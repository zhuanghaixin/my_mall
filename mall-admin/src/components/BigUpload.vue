<template>
    <div class="big-upload">
        <slot name="trigger">
            <el-button @click="triggerFileInput" :disabled="uploading">选择文件</el-button>
        </slot>
        <input type="file" ref="fileInput" class="file-input" @change="handleFileChange" style="display:none" />
        <div v-if="file" class="file-info">
            <div>{{ file.name }} ({{ formatFileSize(file.size) }})</div>
            <div v-if="showHashProgress">
                <el-progress :percentage="hashPercent" />
            </div>
            <div v-else-if="fileHash">特征值: {{ fileHash }}</div>
        </div>
        <slot name="actions" :uploading="uploading" :uploadProgress="uploadProgress" :uploadSuccess="uploadSuccess"
            :startUpload="startUpload" :pauseUpload="pauseUpload" :resumeUpload="resumeUpload"
            :cancelUpload="cancelUpload">
            <el-button v-if="file && !uploading && !uploadSuccess && !isCalculatingHash" type="primary"
                @click="startUpload">开始上传</el-button>
            <el-button v-if="uploading && !isPaused" @click="pauseUpload">暂停</el-button>
            <el-button v-if="uploading && isPaused" @click="resumeUpload">继续</el-button>
            <el-button v-if="uploading" @click="cancelUpload">取消</el-button>
            <el-button v-if="uploadSuccess" @click="resetUpload">重置</el-button>
        </slot>
        <el-progress v-if="uploading || uploadSuccess" :percentage="uploadProgress"
            :status="uploadSuccess ? 'success' : (isPaused ? 'exception' : 'active')" />
        <div v-if="uploadSuccess">
            <slot name="result" :fileUrl="fileUrl" :fileHash="fileHash" :file="file">
                <div>上传成功: <a :href="fileUrl" target="_blank">{{ fileUrl }}</a></div>
            </slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import SparkMD5 from 'spark-md5';
import request from '@/api/request';
import type { AxiosResponse } from 'axios';

// 文件上传响应数据类型
interface FileUploadData {
    url?: string;
    uploaded?: boolean;
    uploadedChunks?: number[];
    [key: string]: any;
}

const props = defineProps({
    modelValue: File,
    chunkSize: { type: Number, default: 2 * 1024 * 1024 },
    concurrentLimit: { type: Number, default: 3 },
    action: { type: String, default: '/upload' },
    headers: { type: Object, default: () => ({}) },
    mergeAction: { type: String, default: '/upload/merge' },
    verifyAction: { type: String, default: '/upload/verify' },
    chunkAction: { type: String, default: '/upload/chunk' },
    withCredentials: { type: Boolean, default: false },
    beforeUpload: Function,
    onSuccess: Function,
    onError: Function,
    onProgress: Function,
    onHashProgress: Function,
});
const emit = defineEmits(['update:modelValue', 'success', 'error', 'progress', 'hash-progress']);

const file = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const fileHash = ref('');
const hashPercent = ref(0);
const isCalculatingHash = ref(false);
const showHashProgress = computed(() => isCalculatingHash.value && file.value && hashPercent.value > 0 && hashPercent.value < 100);
const uploading = ref(false);
const isPaused = ref(false);
const uploadProgress = ref(0);
const uploadedChunks = ref(0);
const totalChunks = ref(0);
const uploadSuccess = ref(false);
const fileUrl = ref('');
const abortController = ref<AbortController | null>(null);
const worker = ref<Worker | null>(null);
const startTime = ref<number>(0);
const endTime = ref<number>(0);
const pausedTime = ref<number>(0);
const totalPausedTime = ref<number>(0);
const currentChunkIndex = ref<number>(0);
const uploadTimeTimer = ref<any>(null);
const lastUploadedSize = ref<number>(0);

watch(() => props.modelValue, (val) => {
    if (val) file.value = val;
});

const triggerFileInput = () => {
    if (uploading.value) return;
    fileInput.value?.click();
};

const handleFileChange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        file.value = target.files[0];
        emit('update:modelValue', file.value);
        calculateTotalChunks();
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

const calculateTotalChunks = () => {
    if (!file.value) return;
    totalChunks.value = Math.ceil(file.value.size / props.chunkSize);
};

const calculateFileHash = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (worker.value) worker.value.terminate();
        try {
            worker.value = new Worker('/md5Worker.js');
            isCalculatingHash.value = true;
            hashPercent.value = 0;
            worker.value.onmessage = (e) => {
                const { type, data } = e.data;
                if (type === 'progress') {
                    hashPercent.value = data.percent;
                    emit('hash-progress', data.percent);
                    if (props.onHashProgress) props.onHashProgress(data.percent);
                } else if (type === 'complete') {
                    isCalculatingHash.value = false;
                    fileHash.value = data.hash;
                    worker.value?.terminate();
                    worker.value = null;
                    resolve(data.hash);
                } else if (type === 'error') {
                    isCalculatingHash.value = false;
                    worker.value?.terminate();
                    worker.value = null;
                    reject(new Error(data.error));
                }
            };
            worker.value.onerror = (error) => {
                isCalculatingHash.value = false;
                worker.value?.terminate();
                worker.value = null;
                ElMessage.warning('后台计算失败，将在主线程计算，UI可能暂时卡顿');
                calculateFileHashInMainThread(file)
                    .then(resolve)
                    .catch(reject);
            };
            worker.value.postMessage({ file, chunkSize: props.chunkSize });
        } catch (error) {
            isCalculatingHash.value = false;
            ElMessage.warning('Web Worker不可用，将在主线程计算，UI可能暂时卡顿');
            calculateFileHashInMainThread(file)
                .then(resolve)
                .catch(reject);
        }
    });
};

// 在主线程中计算文件的MD5哈希值（备用方法）
const calculateFileHashInMainThread = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const chunks = Math.ceil(file.size / props.chunkSize);
        const spark = new SparkMD5.ArrayBuffer();
        const fileReader = new FileReader();
        let currentChunk = 0;

        const loadNext = () => {
            const start = currentChunk * props.chunkSize;
            const end = Math.min(start + props.chunkSize, file.size);
            fileReader.readAsArrayBuffer(file.slice(start, end));
        };

        fileReader.onload = (e) => {
            if (e.target?.result) {
                spark.append(e.target.result as ArrayBuffer);
                currentChunk++;
                hashPercent.value = Math.floor((currentChunk / chunks) * 100);
                emit('hash-progress', hashPercent.value);
                if (props.onHashProgress) props.onHashProgress(hashPercent.value);

                if (currentChunk < chunks) {
                    loadNext();
                } else {
                    const hash = spark.end();
                    isCalculatingHash.value = false;
                    resolve(hash);
                }
            }
        };

        fileReader.onerror = (error) => {
            isCalculatingHash.value = false;
            reject(error);
        };

        loadNext();
    });
};

const formatFileSize = (size: number) => {
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
    if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + ' MB';
    return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};

// 创建文件分片
const createFileChunks = (file: File) => {
    const chunks = [];
    let start = 0;
    while (start < file.size) {
        const end = Math.min(start + props.chunkSize, file.size);
        const chunk = file.slice(start, end);
        chunks.push(chunk);
        start = end;
    }
    return chunks;
};

// 检查已上传的分片
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

        console.log('验证上传请求数据:', requestData, '请求URL:', props.verifyAction);

        const url = props.verifyAction;
        // 发送请求
        const response = await request.post(url, requestData);

        console.log('验证上传响应原始数据:', response);

        if (!response) {
            console.error('响应为空');
            return [];
        }

        // 打印响应的完整结构，帮助调试
        console.log('响应结构:', {
            isObject: typeof response === 'object',
            hasCode: 'code' in response,
            hasData: 'data' in response,
            dataType: response.data ? typeof response.data : 'undefined',
            properties: Object.keys(response)
        });

        // 检查是否可以秒传 - 适应不同的响应结构
        if (response.code === 200 || response.status === 200) {
            const responseData = response.data || response;

            // 检查数据中的上传标志
            if (responseData.uploaded === true) {
                console.log('检测到文件可以秒传', responseData);

                // 提取URL，支持多种响应格式
                const fileUrlStr = responseData.url ||
                    (typeof responseData === 'string' ? responseData : '');

                fileUrl.value = fileUrlStr;
                uploadSuccess.value = true;
                uploading.value = false;
                uploadProgress.value = 100;

                ElMessage.success('文件秒传成功！');
                emit('success', responseData);
                if (props.onSuccess) props.onSuccess(responseData);

                return 'INSTANT_UPLOAD'; // 特殊标记，表示可以秒传
            }

            // 尝试获取已上传的分片列表
            const uploadedChunkList = responseData.uploadedChunks || [];
            if (uploadedChunkList.length > 0) {
                console.log('已上传分片列表:', uploadedChunkList);
                return uploadedChunkList;
            }
        }

        console.log('没有找到已上传的分片');
        return [];
    } catch (error) {
        console.error('检查已上传分片失败:', error);
        return [];
    }
};

// 上传单个分片
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

    // 添加自定义请求头
    const headers = { ...props.headers };

    console.log(`上传分片${index}请求数据:`, {
        chunkIndex: index,
        fileName,
        fileHash: fileHash.value,
        chunkSize: chunk.size,
        url: props.chunkAction
    });

    try {
        // 使用 AbortController 来控制请求
        const signal = abortController.value?.signal;

        const url = props.chunkAction;
        const response = await request.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                ...headers
            },
            signal,
            withCredentials: props.withCredentials
        });

        console.log(`分片${index}上传响应:`, response);

        // 检查上传是否已取消或暂停
        if (!uploading.value || isPaused.value) {
            if (isPaused.value) {
                console.log(`分片 ${index} 上传已暂停`);
            } else {
                throw new Error('上传已取消');
            }
            return false; // 返回false表示需要中断上传流程
        }

        // 检查响应是否成功 - 适应不同的响应结构
        if (response && (response.code === 200 || response.status === 200)) {
            uploadedChunks.value++;
            uploadProgress.value = Math.floor((uploadedChunks.value / totalChunks.value) * 100);

            // 触发进度事件
            emit('progress', uploadProgress.value);
            if (props.onProgress) props.onProgress(uploadProgress.value);

            return true; // 分片上传成功
        } else {
            // 尝试从不同位置获取错误消息
            const errorMsg = response?.message ||
                response?.data?.message ||
                `分片${index}上传失败`;
            console.error(`分片${index}上传失败:`, errorMsg);
            throw new Error(errorMsg);
        }
    } catch (error: any) {
        // 检查是否是主动取消的请求
        if (error?.name === 'AbortError' || !uploading.value) {
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

// 并发上传分片
const uploadChunksConcurrently = async (
    chunks: Blob[],
    fileName: string,
    startIndex: number = 0,
    uploadedList: number[] = []
) => {
    if (!uploading.value || isPaused.value) return;

    // 从startIndex开始，按照并发限制分批上传
    for (let batchStart = startIndex; batchStart < chunks.length; batchStart += props.concurrentLimit) {
        // 检查是否已取消或暂停上传
        if (!uploading.value || isPaused.value) {
            console.log('上传已取消或暂停，停止批量上传');
            break;
        }

        // 计算当前批次的结束位置
        const batchEnd = Math.min(batchStart + props.concurrentLimit, chunks.length);
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

// 合并文件
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

        console.log('合并文件请求数据:', requestData);

        const url = props.mergeAction;
        const response = await request.post(url, requestData, {
            signal: abortController.value?.signal,
            headers: props.headers,
            withCredentials: props.withCredentials
        });

        console.log('合并文件响应数据:', JSON.stringify(response));

        // 检查响应是否成功 - 适应不同的响应结构
        if (response && (response.code === 200 || response.status === 200)) {
            // 记录结束时间
            endTime.value = Date.now();

            // 尝试从不同位置获取文件URL
            const responseData = response.data || response;

            if (typeof responseData === 'string') {
                // 响应直接是URL字符串
                fileUrl.value = responseData;
                console.log('响应数据是字符串URL:', fileUrl.value);
            } else if (responseData && responseData.url) {
                // 响应是带url属性的对象
                fileUrl.value = responseData.url;
                console.log('获取到文件URL:', fileUrl.value);
            } else {
                // 无法获取URL
                fileUrl.value = '文件已上传，但无法获取URL';
                console.warn('无法从响应中获取文件URL:', response);
            }

            uploadSuccess.value = true;
            ElMessage.success('文件上传成功');

            // 触发成功回调
            emit('success', responseData);
            if (props.onSuccess) props.onSuccess(responseData);
        } else {
            // 尝试从不同位置获取错误消息
            const errorMsg = response?.message ||
                response?.data?.message ||
                '文件合并失败';
            console.error('合并文件失败:', errorMsg);
            throw new Error(errorMsg);
        }
    } catch (error: any) {
        // 检查是否是取消上传导致的错误
        if (error?.name === 'AbortError' || error?.message === '上传已取消' || !uploading.value) {
            console.log('合并文件操作被取消');
            return;
        }

        emit('error', error);
        if (props.onError) props.onError(error);
        throw error; // 将错误继续抛出，让外层处理
    }
};

// 开始上传
const startUpload = async () => {
    console.log('开始上传：', file.value?.name);
    if (!file.value || isCalculatingHash.value) {
        console.warn('无法开始上传：', file.value ? '正在计算文件特征值' : '没有选择文件');
        return;
    }

    try {
        // 如果有beforeUpload钩子，首先调用
        if (props.beforeUpload) {
            const shouldUpload = await props.beforeUpload(file.value);
            if (shouldUpload === false) {
                console.log('beforeUpload返回false，中止上传');
                return;
            }
        }

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
        uploadSuccess.value = false;

        // 创建新的 AbortController 用于取消请求
        abortController.value = new AbortController();

        // 检查是否有已上传的分片
        const fileName = file.value.name;
        const chunks = createFileChunks(file.value);
        console.log(`文件 ${fileName} 分割为 ${chunks.length} 个分片`);

        // 请求已上传的分片列表
        const existedChunks = await checkExistingChunks(fileName, chunks.length);
        console.log('已上传分片检查结果:', existedChunks);

        // 检查是否可以秒传
        if (existedChunks === 'INSTANT_UPLOAD') {
            console.log('文件秒传成功');
            return; // 秒传成功，直接返回
        }

        // 如果有已上传的分片，更新进度
        if (existedChunks && Array.isArray(existedChunks) && existedChunks.length > 0) {
            uploadedChunks.value = existedChunks.length;
            uploadProgress.value = Math.floor((uploadedChunks.value / totalChunks.value) * 100);
            ElMessage.info(`检测到已上传 ${existedChunks.length} 个分片，继续上传剩余部分`);
        }

        // 默认使用并发上传
        console.log('开始并发上传分片');
        const allUploaded = await uploadChunksConcurrently(chunks, fileName, 0, existedChunks);
        console.log('分片上传完成状态:', allUploaded);

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
            console.log('所有分片上传完成，开始合并文件');
            // 请求合并文件
            await mergeFile(fileName);
        }
    } catch (error: any) {
        // 检查是否是取消上传导致的错误
        if (error?.name === 'AbortError' || error?.message === '上传已取消' || !uploading.value) {
            console.log('上传已被用户取消');
            return;
        }

        ElMessage.error('上传失败: ' + (error.message || '请重试'));
        console.error('上传错误:', error);
        emit('error', error);
        if (props.onError) props.onError(error);
    } finally {
        // 如果不是暂停状态，则完全清理上传状态
        if (!isPaused.value) {
            uploading.value = false;
            abortController.value = null; // 清理 AbortController
        }
    }
};

// 暂停上传
const pauseUpload = () => {
    if (!uploading.value || isPaused.value) return;

    isPaused.value = true;
    pausedTime.value = Date.now();

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

    try {
        const fileName = file.value.name;
        const chunks = createFileChunks(file.value);

        // 重新获取已上传的分片列表
        const existedChunks = await checkExistingChunks(fileName, chunks.length);

        if (existedChunks === 'INSTANT_UPLOAD') {
            return; // 秒传成功，直接返回
        }

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
        if (error?.name === 'AbortError' || error?.message === '上传已取消' || !uploading.value) {
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
        emit('error', error);
        if (props.onError) props.onError(error);
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

    ElMessage.info('上传已取消');
};

// 重置上传
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

    // 取消所有网络请求
    if (abortController.value) {
        abortController.value.abort();
        abortController.value = null;
    }

    if (fileInput.value) {
        fileInput.value.value = '';
    }

    emit('update:modelValue', undefined);
};

// 组件卸载前清理资源
onUnmounted(() => {
    // 确保Worker被终止
    if (worker.value) {
        worker.value.terminate();
        worker.value = null;
    }

    // 取消所有网络请求
    if (abortController.value) {
        abortController.value.abort();
        abortController.value = null;
    }
});

// 暴露需要从组件外部访问的方法
defineExpose({
    triggerFileInput,
    startUpload,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    resetUpload
});
</script>

<style scoped>
.big-upload {
    padding: 16px;
}

.file-info {
    margin: 8px 0;
}
</style>
