<template>
    <div class="project-upload">
        <h1>基于MD5的大文件上传</h1>

        <div class="upload-container">
            <el-card class="upload-card">
                <div class="upload-area" @click="triggerFileInput" @drop.prevent="handleDrop" @dragover.prevent>
                    <input type="file" ref="fileInput" class="file-input" @change="handleFileChange" @click.stop />
                    <i class="el-icon-upload" v-if="!file"></i>
                    <div v-if="!file" class="upload-text">
                        <div>点击或拖拽文件到此处上传</div>
                        <div class="upload-hint">支持大文件上传与秒传</div>
                    </div>
                    <div v-else-if="showHashProgress" class="hash-progress">
                        <div class="hash-title">正在计算文件特征值</div>
                        <el-progress :percentage="hashPercent"></el-progress>
                    </div>
                    <div v-else class="file-info">
                        <div class="file-name">{{ file.name }}</div>
                        <div class="file-size">{{ formatFileSize(file.size) }}</div>
                        <div v-if="fileHash" class="file-hash">
                            <small>特征值: {{ fileHash }}</small>
                        </div>
                    </div>
                </div>

                <div class="upload-actions" v-if="file && !uploading && !uploadSuccess && !isCalculatingHash">
                    <div class="upload-options">
                        <el-switch v-model="isUsingConcurrent" inline-prompt active-text="并发" inactive-text="顺序"
                            size="large" style="margin-right: 10px;" />
                        <el-input-number v-if="isUsingConcurrent" v-model="concurrentLimit" :min="1" :max="10"
                            size="small" :disabled="uploading" placeholder="并发数" controls-position="right"
                            style="width: 120px; margin-right: 10px;"></el-input-number>
                    </div>
                    <div class="button-group">
                        <el-button type="primary" @click="startUpload">开始上传</el-button>
                        <el-button @click="resetUpload">取消</el-button>
                    </div>
                </div>

                <div class="upload-progress" v-if="uploading">
                    <el-progress :percentage="uploadProgress" :format="progressFormat"
                        :status="isPaused ? 'exception' : 'success'"></el-progress>
                    <div class="progress-info">
                        已上传: {{ uploadedChunks }}/{{ totalChunks }} 分片
                        <span v-if="isUsingConcurrent"> | 并发数: {{ concurrentLimit }}</span>
                    </div>
                    <div class="progress-time" v-if="uploadedChunks > 0">
                        已用时间: {{ formatTime(uploadingTime) }}
                        <span v-if="uploadSpeed > 0 && !isPaused"> | 上传速度: {{ formatSpeed(uploadSpeed) }}</span>
                    </div>
                    <div class="upload-control-buttons">
                        <el-button type="primary" @click="resumeUpload" size="small" v-if="isPaused">继续上传</el-button>
                        <el-button type="warning" @click="pauseUpload" size="small" v-if="!isPaused">暂停上传</el-button>
                        <el-button type="danger" @click="cancelUpload" size="small">取消上传</el-button>
                    </div>
                </div>

                <div class="upload-result" v-if="uploadSuccess">
                    <i class="el-icon-success success-icon"></i>
                    <div class="success-text">上传成功</div>
                    <div class="file-url">文件地址: {{ fileUrl }}</div>
                    <div class="upload-stats">
                        <div>文件大小: {{ formatFileSize(file?.size || 0) }}</div>
                        <div>上传耗时: {{ formatTime(uploadDuration) }}</div>
                        <div>平均速度: {{ formatSpeed(uploadAvgSpeed) }}</div>
                        <div v-if="fileHash">特征值: {{ fileHash }}</div>
                        <div>上传模式: {{ isUsingConcurrent ? `并发(${concurrentLimit}个)` : '顺序' }}</div>
                    </div>
                    <el-button type="primary" @click="resetUpload" size="small">继续上传</el-button>
                </div>
            </el-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import request from '@/api/request';
import type { ApiResponse } from '@/api/request';
import SparkMD5 from 'spark-md5';

// 文件相关状态
const file = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const chunkSize = 2 * 1024 * 1024; // 2MB分片大小
const fileHash = ref<string>(''); // 存储文件的MD5哈希值
const hashPercent = ref<number>(0); // MD5计算进度
const isCalculatingHash = ref<boolean>(false); // 是否正在计算MD5
// 添加Worker引用
const worker = ref<Worker | null>(null);

// 上传状态
const uploading = ref(false);
const isPaused = ref(false);
const uploadProgress = ref(0);
const uploadedChunks = ref(0);
const totalChunks = ref(0);
const uploadSuccess = ref(false);
const fileUrl = ref('');
const isFileInputActive = ref(false);

// 并发控制
const concurrentLimit = ref(3); // 默认并发数量
const isUsingConcurrent = ref(true); // 是否使用并发上传

// 上传时间相关状态
const startTime = ref<number>(0);
const endTime = ref<number>(0);
const uploadDuration = ref<number>(0);
const uploadAvgSpeed = ref<number>(0); // 单位：字节/秒
const uploadSpeed = ref<number>(0); // 当前速度
const uploadTimeTimer = ref<any>(null);
const lastUploadedSize = ref<number>(0);
const pausedTime = ref<number>(0);
const totalPausedTime = ref<number>(0);

// 添加上传控制变量
const abortController = ref<AbortController | null>(null);
const currentChunkIndex = ref<number>(0);

// 计算正在上传的时间
const uploadingTime = computed(() => {
    if (!startTime.value || !uploading.value) return 0;
    // 考虑暂停的时间
    const rawTime = Date.now() - startTime.value;
    if (isPaused.value) {
        return rawTime - (Date.now() - pausedTime.value) - totalPausedTime.value;
    }
    return rawTime - totalPausedTime.value;
});

// 格式化时间为人类可读格式
const formatTime = (milliseconds: number): string => {
    if (!milliseconds) return '0秒';

    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}小时${minutes % 60}分钟`;
    } else if (minutes > 0) {
        return `${minutes}分钟${seconds % 60}秒`;
    } else {
        return `${seconds}秒`;
    }
};

// 格式化速度为人类可读格式
const formatSpeed = (bytesPerSecond: number): string => {
    if (bytesPerSecond < 1024) {
        return `${bytesPerSecond.toFixed(2)} B/s`;
    } else if (bytesPerSecond < 1024 * 1024) {
        return `${(bytesPerSecond / 1024).toFixed(2)} KB/s`;
    } else {
        return `${(bytesPerSecond / (1024 * 1024)).toFixed(2)} MB/s`;
    }
};

// 更新上传速度
const updateUploadSpeed = () => {
    if (!uploading.value || !file.value || isPaused.value) {
        uploadSpeed.value = 0;
        return;
    }

    const currentUploadedSize = uploadedChunks.value * chunkSize;
    const sizeDiff = currentUploadedSize - lastUploadedSize.value;
    lastUploadedSize.value = currentUploadedSize;

    // 计算当前速度 (每秒更新一次)
    uploadSpeed.value = sizeDiff;
};

// 触发文件选择
const triggerFileInput = () => {
    // 如果已经有文件或者正在上传中，不触发文件选择
    if (file.value || uploading.value) return;

    if (fileInput.value && !isFileInputActive.value) {
        isFileInputActive.value = true;
        fileInput.value.click();
        // 防止重复触发
        setTimeout(() => {
            isFileInputActive.value = false;
        }, 300);
    }
};

/**
 * 使用Web Worker计算文件的MD5哈希值
 *
 * @param file 文件对象
 * @returns 返回一个Promise，resolve参数为计算得到的MD5哈希值字符串
 */
const calculateFileHash = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        // 终止已有的Worker
        if (worker.value) {
            worker.value.terminate();
        }

        try {
            // 创建新的Worker
            worker.value = new Worker('/md5Worker.js');

            // 设置计算状态
            isCalculatingHash.value = true;
            hashPercent.value = 0;

            // 处理Worker消息
            worker.value.onmessage = (e) => {
                const { type, data } = e.data;

                switch (type) {
                    case 'progress':
                        // 更新进度
                        hashPercent.value = data.percent;
                        break;
                    case 'complete':
                        // 计算完成
                        isCalculatingHash.value = false;
                        console.log('文件MD5计算完成(Worker):', data.hash);

                        // 清理Worker
                        if (worker.value) {
                            worker.value.terminate();
                            worker.value = null;
                        }

                        resolve(data.hash);
                        break;
                    case 'error':
                        // 处理错误
                        isCalculatingHash.value = false;
                        console.error('文件MD5计算失败(Worker):', data.error);

                        // 清理Worker
                        if (worker.value) {
                            worker.value.terminate();
                            worker.value = null;
                        }

                        reject(new Error(data.error));
                        break;
                }
            };

            // 处理Worker错误
            worker.value.onerror = (error) => {
                isCalculatingHash.value = false;
                console.error('Worker错误:', error);

                // 清理Worker
                if (worker.value) {
                    worker.value.terminate();
                    worker.value = null;
                }

                // 当Worker失败时，尝试回退到主线程计算
                ElMessage.warning('后台计算失败，将在主线程计算，UI可能暂时卡顿');
                calculateFileHashInMainThread(file)
                    .then(resolve)
                    .catch(reject);
            };

            // 发送文件和参数给Worker
            worker.value.postMessage({
                file,
                chunkSize
            });
        } catch (error) {
            // 如果Worker创建失败，回退到主线程计算
            console.error('创建Worker失败:', error);
            isCalculatingHash.value = true;
            hashPercent.value = 0;

            ElMessage.warning('Web Worker不可用，将在主线程计算，UI可能暂时卡顿');
            calculateFileHashInMainThread(file)
                .then(resolve)
                .catch(reject);
        }
    });
};

/**
 * 在主线程中计算文件的MD5哈希值（备用方法）
 * @param file 文件对象
 * @returns 返回MD5哈希值
 */
const calculateFileHashInMainThread = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const chunks = Math.ceil(file.size / chunkSize);
        const spark = new SparkMD5.ArrayBuffer();
        const fileReader = new FileReader();

        let currentChunk = 0;

        const loadNext = () => {
            const start = currentChunk * chunkSize;
            const end = Math.min(start + chunkSize, file.size);
            fileReader.readAsArrayBuffer(file.slice(start, end));
        };

        fileReader.onload = (e) => {
            if (e.target?.result) {
                spark.append(e.target.result as ArrayBuffer);
                currentChunk++;
                hashPercent.value = Math.floor((currentChunk / chunks) * 100);

                if (currentChunk < chunks) {
                    loadNext();
                } else {
                    const hash = spark.end();
                    isCalculatingHash.value = false;
                    console.log('文件MD5计算完成(主线程):', hash);
                    resolve(hash);
                }
            }
        };

        fileReader.onerror = (error) => {
            isCalculatingHash.value = false;
            console.error('文件MD5计算失败(主线程):', error);
            reject(error);
        };

        loadNext();
    });
};

// 处理文件选择（修改以添加MD5计算）
const handleFileChange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        file.value = target.files[0];
        calculateTotalChunks();

        // 计算文件MD5
        try {
            ElMessage.info('正在计算文件特征值，请稍候...');
            fileHash.value = await calculateFileHash(file.value);
            ElMessage.success('文件特征值计算完成');
        } catch (error) {
            console.error('计算文件特征值失败:', error);
            ElMessage.error('计算文件特征值失败，将使用文件名作为标识');
            fileHash.value = '';
        }
    }
};

// 处理拖拽上传（修改以添加MD5计算）
const handleDrop = async (e: DragEvent) => {
    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        file.value = e.dataTransfer.files[0];
        calculateTotalChunks();

        // 计算文件MD5
        try {
            ElMessage.info('正在计算文件特征值，请稍候...');
            fileHash.value = await calculateFileHash(file.value);
            ElMessage.success('文件特征值计算完成');
        } catch (error) {
            console.error('计算文件特征值失败:', error);
            ElMessage.error('计算文件特征值失败，将使用文件名作为标识');
            fileHash.value = '';
        }
    }
};

// 计算总分片数
const calculateTotalChunks = () => {
    if (!file.value) return;
    totalChunks.value = Math.ceil(file.value.size / chunkSize);
};

// 格式化文件大小
const formatFileSize = (size: number) => {
    if (size < 1024) {
        return size + ' B';
    } else if (size < 1024 * 1024) {
        return (size / 1024).toFixed(2) + ' KB';
    } else if (size < 1024 * 1024 * 1024) {
        return (size / (1024 * 1024)).toFixed(2) + ' MB';
    } else {
        return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
};

// 格式化进度条文本
const progressFormat = (percentage: number) => {
    if (isPaused.value) {
        return '已暂停';
    } else if (percentage === 100) {
        return '准备合并文件...';
    } else {
        return `${percentage}%`;
    }
};

// 创建文件分片
const createFileChunks = (file: File) => {
    const chunks = [];
    let start = 0;

    while (start < file.size) {
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);
        chunks.push(chunk);
        start = end;
    }

    return chunks;
};

// 修改上传单个分片，添加fileHash参数
const uploadChunk = async (chunk: Blob, index: number, fileName: string) => {
    const formData = new FormData();
    formData.append('chunk', chunk, `${fileName}.part${index}`);
    formData.append('index', index.toString());
    formData.append('filename', fileName);
    formData.append('totalChunks', totalChunks.value.toString());

    // 添加文件哈希值（如果有）
    if (fileHash.value) {
        formData.append('fileHash', fileHash.value);
    }

    try {
        // 使用 AbortController 来控制请求
        const signal = abortController.value?.signal;

        const response = await request.post<ApiResponse>('/upload/chunk', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            signal
        }) as unknown as ApiResponse;

        // 检查上传是否已取消或暂停
        if (!uploading.value || isPaused.value) {
            if (isPaused.value) {
                console.log(`分片 ${index} 上传已暂停`);
            } else {
                throw new Error('上传已取消');
            }
            return false; // 返回false表示需要中断上传流程
        }

        if (response.code === 200) {
            uploadedChunks.value++;
            uploadProgress.value = Math.floor((uploadedChunks.value / totalChunks.value) * 100);
            return true; // 分片上传成功
        } else {
            throw new Error(response.message || '分片上传失败');
        }
    } catch (error) {
        // 检查是否是主动取消的请求
        if ((error as any)?.name === 'AbortError' || !uploading.value) {
            console.log(`分片 ${index} 上传已取消`);
            throw new Error('上传已取消');
        }

        // 如果是暂停状态，仅打印日志不抛出错误
        if (isPaused.value) {
            console.log(`分片 ${index} 上传已暂停`);
            return false; // 分片上传中断
        }

        console.error(`分片 ${index} 上传失败:`, error);
        throw error;
    }
};

// 修改检查已上传的分片，添加fileHash参数
const checkExistingChunks = async (fileName: string, totalChunks: number) => {
    try {
        const requestData: Record<string, any> = {
            filename: fileName,
            totalChunks
        };

        // 添加文件哈希值（如果有）
        if (fileHash.value) {
            requestData.fileHash = fileHash.value;
        }

        const response = await request.post<ApiResponse>('/upload/verify', requestData) as unknown as ApiResponse;

        // 检查是否可以秒传
        if (response.code === 200 && response.data && response.data.uploaded === true) {
            // 文件已存在，可以秒传
            fileUrl.value = response.data.url;
            uploadSuccess.value = true;
            uploading.value = false;
            uploadProgress.value = 100;

            // 记录结束时间和计算总时间
            endTime.value = Date.now();
            uploadDuration.value = 0; // 秒传几乎不耗时
            uploadAvgSpeed.value = file.value ? file.value.size : 0; // 显示为"无限快"

            ElMessage.success('文件秒传成功！');
            return 'INSTANT_UPLOAD'; // 特殊标记，表示可以秒传
        }

        if (response.code === 200 && response.data && response.data.uploadedChunks) {
            // 确保所有的分片索引都是有效的数字
            const validChunks = response.data.uploadedChunks.filter(
                (index: any) => typeof index === 'number' && !isNaN(index) && index >= 0 && index < totalChunks
            );

            console.log(`检测到有效分片: ${validChunks.length}/${totalChunks}`);
            return validChunks;
        }

        return [];
    } catch (error) {
        console.error('检查已上传分片失败:', error);
        return [];
    }
};

// 修改并发上传方法，支持已上传分片列表
const uploadChunksConcurrently = async (
    chunks: Blob[],
    fileName: string,
    startIndex: number = 0,
    uploadedList: number[] = []
) => {
    if (!uploading.value || isPaused.value) return;

    // 从startIndex开始，按照并发限制分批上传
    for (let batchStart = startIndex; batchStart < chunks.length; batchStart += concurrentLimit.value) {
        // 检查是否已取消或暂停上传
        if (!uploading.value || isPaused.value) {
            console.log('上传已取消或暂停，停止批量上传');
            break;
        }

        // 计算当前批次的结束位置
        const batchEnd = Math.min(batchStart + concurrentLimit.value, chunks.length);
        currentChunkIndex.value = batchStart; // 更新当前处理的分片索引

        console.log(`并发上传分片 ${batchStart} 到 ${batchEnd - 1}`);

        // 创建Promise数组
        const uploadPromises = [];

        // 将当前批次的分片添加到Promise数组，跳过已上传的分片
        for (let i = batchStart; i < batchEnd; i++) {
            // 如果该分片已经上传，跳过
            if (uploadedList.includes(i)) {
                console.log(`分片 ${i} 已上传，跳过`);
                continue;
            }

            uploadPromises.push(
                uploadChunk(chunks[i], i, fileName).catch(async (error) => {
                    // 忽略暂停导致的错误
                    if (isPaused.value) return false;

                    // 如果是取消导致的错误，直接抛出
                    if (error.message === '上传已取消' || !uploading.value) {
                        throw error;
                    }

                    // 其他错误尝试重试一次
                    console.warn(`分片 ${i} 上传失败，正在重试...`);

                    // 检查是否已取消或暂停
                    if (!uploading.value || isPaused.value) {
                        return false;
                    }

                    // 重试上传
                    return await uploadChunk(chunks[i], i, fileName);
                })
            );
        }

        if (uploadPromises.length === 0) {
            // 如果当前批次没有需要上传的分片，直接继续下一批次
            continue;
        }

        try {
            // 使用Promise.all并发上传当前批次的分片
            const results = await Promise.all(uploadPromises);

            // 如果有任何分片上传返回false（表示暂停或取消），则中断后续上传
            if (results.includes(false)) {
                console.log('检测到上传中断信号，停止后续分片上传');
                break;
            }
        } catch (error) {
            // 如果是取消上传导致的错误，中断后续处理
            if ((error as any).message === '上传已取消' || !uploading.value) {
                console.log('上传已取消，中断并发上传');
                break;
            }

            // 如果是暂停导致的错误，中断后续处理
            if (isPaused.value) {
                console.log('上传已暂停，中断并发上传');
                break;
            }

            // 其他错误，抛出让外层处理
            throw error;
        }
    }

    return uploadedChunks.value === totalChunks.value; // 返回是否所有分片都已上传完成
};

// 暂停上传
const pauseUpload = () => {
    if (!uploading.value || isPaused.value) return;

    isPaused.value = true;
    pausedTime.value = Date.now();

    // 暂停时不需要取消 AbortController，因为我们只是暂时停止，稍后会继续

    ElMessage.info('上传已暂停');
};

// 继续上传
const resumeUpload = async () => {
    if (!isPaused.value || !file.value) return;

    // 计算暂停的总时间
    if (pausedTime.value > 0) {
        totalPausedTime.value += (Date.now() - pausedTime.value);
        pausedTime.value = 0;
    }

    isPaused.value = false;

    // 确保有新的 AbortController
    if (!abortController.value) {
        abortController.value = new AbortController();
    }

    ElMessage.info('继续上传中...');

    // 根据上传模式选择相应的继续上传方法
    if (isUsingConcurrent.value) {
        await continueUploadConcurrently();
    } else {
        await continueUploadFromIndex(currentChunkIndex.value);
    }
};

// 从指定索引继续上传（顺序上传）
const continueUploadFromIndex = async (startIndex: number, uploadedList: number[] = []) => {
    if (!file.value || !uploading.value || isPaused.value) return;

    try {
        const fileName = file.value.name;
        const chunks = createFileChunks(file.value);

        // 从保存的索引继续上传
        for (let i = startIndex; i < chunks.length && uploading.value && !isPaused.value; i++) {
            currentChunkIndex.value = i; // 保存当前处理的分片索引

            // 如果该分片已经上传，跳过
            if (uploadedList.includes(i)) {
                console.log(`分片 ${i} 已上传，跳过`);
                continue;
            }

            try {
                // 每次上传前检查上传状态
                if (!uploading.value) {
                    console.log('上传已取消，中断分片上传循环');
                    break;
                }

                if (isPaused.value) {
                    console.log('上传已暂停，中断分片上传循环');
                    break;
                }

                const success = await uploadChunk(chunks[i], i, fileName);
                if (!success) break; // 如果上传被中断，退出循环

            } catch (error: any) {
                // 检查是否是取消上传导致的错误
                if (error.message === '上传已取消' || !uploading.value) {
                    console.log('上传已取消，中断重试');
                    break;
                }

                // 检查是否是暂停导致的中断
                if (isPaused.value) {
                    console.log('上传已暂停，中断重试');
                    break;
                }

                // 分片上传失败，尝试重试一次
                console.warn(`分片 ${i} 上传失败，正在重试...`);
                try {
                    // 再次检查上传状态
                    if (!uploading.value) {
                        console.log('上传已取消，中断重试');
                        break;
                    }

                    if (isPaused.value) {
                        console.log('上传已暂停，中断重试');
                        break;
                    }

                    const retrySuccess = await uploadChunk(chunks[i], i, fileName);
                    if (!retrySuccess) break; // 如果上传被中断，退出循环

                } catch (retryError: any) {
                    // 再次检查是否是取消上传
                    if (retryError.message === '上传已取消' || !uploading.value) {
                        console.log('上传已取消，中断后续处理');
                        break;
                    }

                    // 检查是否是暂停导致的中断
                    if (isPaused.value) {
                        console.log('上传已暂停，中断后续处理');
                        break;
                    }

                    // 重试失败，中断上传
                    throw new Error(`分片 ${i} 上传失败: ${retryError.message || '请检查网络连接'}`);
                }
            }
        }

        // 如果上传已取消或暂停，直接返回
        if (!uploading.value) {
            console.log('上传已取消，不执行合并操作');
            return;
        }

        if (isPaused.value) {
            console.log('上传已暂停，不执行合并操作');
            return;
        }

        // 检查是否所有分片都已上传完成
        if (uploadedChunks.value === totalChunks.value) {
            // 请求合并文件
            await mergeFile(file.value.name);
        }
    } catch (error: any) {
        // 检查是否是取消上传导致的错误
        if (error.name === 'AbortError' || error.message === '上传已取消' || !uploading.value) {
            console.log('上传已被用户取消');
            return;
        }

        // 检查是否是暂停导致的错误
        if (isPaused.value) {
            console.log('上传已被用户暂停');
            return;
        }

        ElMessage.error('上传失败: ' + (error.message || '请重试'));
        console.error('上传错误:', error);
    }
};

// 从指定索引继续并发上传
const continueUploadConcurrently = async () => {
    if (!file.value || !uploading.value || isPaused.value) return;

    try {
        const fileName = file.value.name;
        const chunks = createFileChunks(file.value);

        // 重新获取已上传的分片列表
        const existedChunks = await checkExistingChunks(fileName, chunks.length);

        // 使用并发上传方法从当前索引继续上传
        const allUploaded = await uploadChunksConcurrently(chunks, fileName, currentChunkIndex.value, existedChunks);

        // 如果上传已取消或暂停，直接返回
        if (!uploading.value) {
            console.log('上传已取消，不执行合并操作');
            return;
        }

        if (isPaused.value) {
            console.log('上传已暂停，不执行合并操作');
            return;
        }

        // 如果所有分片都已上传完成，执行合并操作
        if (allUploaded) {
            // 请求合并文件
            await mergeFile(fileName);
        }
    } catch (error: any) {
        // 检查是否是取消上传导致的错误
        if (error.name === 'AbortError' || error.message === '上传已取消' || !uploading.value) {
            console.log('上传已被用户取消');
            return;
        }

        // 检查是否是暂停导致的错误
        if (isPaused.value) {
            console.log('上传已被用户暂停');
            return;
        }

        ElMessage.error('上传失败: ' + (error.message || '请重试'));
        console.error('上传错误:', error);
    }
};

// 修改合并文件的公共方法，添加fileHash参数
const mergeFile = async (fileName: string) => {
    try {
        // 请求合并文件
        const requestData: Record<string, any> = {
            filename: fileName,
            totalChunks: totalChunks.value
        };

        // 添加文件哈希值（如果有）
        if (fileHash.value) {
            requestData.fileHash = fileHash.value;
        }

        const response = await request.post<ApiResponse>('/upload/merge', requestData, {
            signal: abortController.value?.signal
        }) as unknown as ApiResponse;

        console.log('合并文件响应:', response);

        if (response.code === 200) {
            // 记录结束时间和计算总时间
            endTime.value = Date.now();
            uploadDuration.value = endTime.value - startTime.value - totalPausedTime.value;

            // 计算平均速度
            if (file.value && uploadDuration.value > 0) {
                uploadAvgSpeed.value = file.value.size / (uploadDuration.value / 1000);
            }

            // 检查response.data是否存在
            if (response.data && response.data.url) {
                fileUrl.value = response.data.url;
            } else if ((response as any).url) {
                // 尝试从response直接获取url，使用类型断言
                fileUrl.value = (response as any).url;
            } else {
                // 如果两种方式都无法获取url，设置一个默认值或提示
                fileUrl.value = '文件已上传，但无法获取URL';
                console.warn('无法从响应中获取文件URL:', response);
            }

            uploadSuccess.value = true;
            ElMessage.success('文件上传成功');
        } else {
            throw new Error(response.message || '文件合并失败');
        }
    } catch (error: any) {
        // 检查是否是取消上传导致的错误
        if (error.name === 'AbortError' || error.message === '上传已取消' || !uploading.value) {
            console.log('合并文件操作被取消');
            return;
        }

        throw error; // 将错误继续抛出，让外层处理
    }
};

// 修改开始上传方法
const startUpload = async () => {
    if (!file.value) return;

    try {
        // 重置上传状态和时间
        uploading.value = true;
        isPaused.value = false;
        uploadedChunks.value = 0;
        uploadProgress.value = 0;
        startTime.value = Date.now();
        lastUploadedSize.value = 0;
        pausedTime.value = 0;
        totalPausedTime.value = 0;
        currentChunkIndex.value = 0;

        // 创建新的 AbortController 用于取消请求
        abortController.value = new AbortController();

        // 启动定时器更新上传速度
        uploadTimeTimer.value = setInterval(updateUploadSpeed, 1000);

        // 检查是否有已上传的分片
        const fileName = file.value.name;
        const chunks = createFileChunks(file.value);

        // 请求已上传的分片列表
        const existedChunks = await checkExistingChunks(fileName, chunks.length);

        // 检查是否可以秒传
        if (existedChunks === 'INSTANT_UPLOAD') {
            // 停止计时器和清理上传状态
            if (uploadTimeTimer.value) {
                clearInterval(uploadTimeTimer.value);
                uploadTimeTimer.value = null;
            }
            return; // 秒传成功，直接返回
        }

        // 如果有已上传的分片，更新进度
        if (existedChunks && existedChunks.length > 0) {
            uploadedChunks.value = existedChunks.length;
            uploadProgress.value = Math.floor((uploadedChunks.value / totalChunks.value) * 100);
            ElMessage.info(`检测到已上传 ${existedChunks.length} 个分片，继续上传剩余部分`);
        }

        // 根据上传模式选择上传方法
        if (isUsingConcurrent.value) {
            // 使用并发上传，传入已上传的分片列表
            const allUploaded = await uploadChunksConcurrently(chunks, fileName, 0, existedChunks);

            // 如果上传已取消或暂停，直接返回
            if (!uploading.value) {
                console.log('上传已取消，不执行合并操作');
                return;
            }

            if (isPaused.value) {
                console.log('上传已暂停，不执行合并操作');
                return;
            }

            // 如果所有分片都已上传完成，执行合并操作
            if (allUploaded) {
                // 请求合并文件
                await mergeFile(fileName);
            }
        } else {
            // 使用顺序上传，传入已上传的分片列表
            await continueUploadFromIndex(0, existedChunks);
        }
    } catch (error: any) {
        // 检查是否是取消上传导致的错误
        if (error.name === 'AbortError' || error.message === '上传已取消' || !uploading.value) {
            console.log('上传已被用户取消');
            return;
        }

        ElMessage.error('上传失败: ' + (error.message || '请重试'));
        console.error('上传错误:', error);
    } finally {
        // 停止计时器
        if (uploadTimeTimer.value && (!isPaused.value || !uploading.value)) {
            clearInterval(uploadTimeTimer.value);
            uploadTimeTimer.value = null;
        }

        // 如果不是暂停状态，则完全清理上传状态
        if (!isPaused.value) {
            uploading.value = false;
            abortController.value = null; // 清理 AbortController
        }
    }
};

// 取消上传
const cancelUpload = () => {
    if (!uploading.value) return;

    uploading.value = false;
    isPaused.value = false;
    uploadProgress.value = 0;
    uploadedChunks.value = 0;
    pausedTime.value = 0;
    totalPausedTime.value = 0;

    // 取消所有进行中的网络请求
    if (abortController.value) {
        abortController.value.abort();
        abortController.value = null;
    }

    // 停止计时器
    if (uploadTimeTimer.value) {
        clearInterval(uploadTimeTimer.value);
        uploadTimeTimer.value = null;
    }

    ElMessage.info('上传已取消');
};

// 修改重置上传，确保清理Worker
const resetUpload = () => {
    file.value = null;
    fileHash.value = '';
    uploading.value = false;
    isPaused.value = false;
    uploadProgress.value = 0;
    uploadedChunks.value = 0;
    totalChunks.value = 0;
    uploadSuccess.value = false;
    fileUrl.value = '';
    startTime.value = 0;
    endTime.value = 0;
    uploadDuration.value = 0;
    uploadAvgSpeed.value = 0;
    uploadSpeed.value = 0;
    pausedTime.value = 0;
    totalPausedTime.value = 0;
    currentChunkIndex.value = 0;
    isCalculatingHash.value = false;
    hashPercent.value = 0;

    // 终止Worker
    if (worker.value) {
        worker.value.terminate();
        worker.value = null;
    }

    // 停止计时器
    if (uploadTimeTimer.value) {
        clearInterval(uploadTimeTimer.value);
        uploadTimeTimer.value = null;
    }

    if (fileInput.value) {
        fileInput.value.value = '';
    }
};

// MD5相关UI状态
const showHashProgress = computed(() => {
    return isCalculatingHash.value && file.value && hashPercent.value > 0 && hashPercent.value < 100;
});

// 页面加载后修正UI状态
onMounted(() => {
    // 确保初始状态正确
    resetUpload();
});

// 页面卸载前清理
onUnmounted(() => {
    if (uploadTimeTimer.value) {
        clearInterval(uploadTimeTimer.value);
    }

    // 确保Worker被终止
    if (worker.value) {
        worker.value.terminate();
        worker.value = null;
    }
});
</script>

<style scoped lang="scss">
.project-upload {
    padding: 24px;
}

.upload-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px 0;
}

.upload-card {
    border-radius: 8px;
}

.upload-area {
    position: relative;
    padding: 60px 20px;
    border: 2px dashed #dcdfe6;
    border-radius: 8px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
        border-color: #409eff;
    }

    .el-icon-upload {
        font-size: 48px;
        color: #909399;
        margin-bottom: 16px;
    }
}

.file-input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    z-index: -1;
    /* 将文件输入框移到最下层，防止直接触发 */
}

.upload-text {
    font-size: 16px;
    color: #606266;

    .upload-hint {
        margin-top: 8px;
        font-size: 14px;
        color: #909399;
    }
}

.file-info {
    .file-name {
        font-size: 16px;
        color: #303133;
        margin-bottom: 8px;
        word-break: break-all;
    }

    .file-size {
        font-size: 14px;
        color: #909399;
    }
}

.upload-actions {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;

    .upload-options {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 8px;
    }

    .button-group {
        display: flex;
        gap: 12px;
    }
}

.upload-progress {
    margin-top: 20px;

    .progress-info {
        margin: 12px 0;
        text-align: center;
        color: #606266;
    }
}

.upload-control-buttons {
    display: flex;
    justify-content: center;
    margin-top: 12px;
    gap: 8px;
}

.upload-result {
    margin-top: 20px;
    text-align: center;

    .success-icon {
        font-size: 48px;
        color: #67c23a;
        margin-bottom: 16px;
    }

    .success-text {
        font-size: 16px;
        color: #67c23a;
        margin-bottom: 8px;
    }

    .file-url {
        font-size: 14px;
        color: #606266;
        margin-bottom: 16px;
        word-break: break-all;
    }
}

.progress-time,
.progress-info {
    margin: 12px 0;
    text-align: center;
    color: #606266;
}

.upload-stats {
    margin: 16px 0;
    font-size: 14px;
    color: #606266;
    text-align: center;

    >div {
        margin-bottom: 4px;
    }
}

.hash-progress {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;

    .hash-title {
        font-size: 16px;
        color: #606266;
        margin-bottom: 16px;
    }
}

.file-hash {
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
    word-break: break-all;
}
</style>