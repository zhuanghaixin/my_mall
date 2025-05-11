<template>
  <div class="project-upload">
    <h1>大文件上传</h1>

    <div class="upload-container">
      <el-card class="upload-card">
        <div class="upload-area" @click="triggerFileInput" @drop.prevent="handleDrop" @dragover.prevent>
          <input type="file" ref="fileInput" class="file-input" @change="handleFileChange" @click.stop />
          <i class="el-icon-upload" v-if="!file"></i>
          <div v-if="!file" class="upload-text">
            <div>点击或拖拽文件到此处上传</div>
            <div class="upload-hint">支持大文件上传</div>
          </div>
          <div v-else class="file-info">
            <div class="file-name">{{ file.name }}</div>
            <div class="file-size">{{ formatFileSize(file.size) }}</div>
          </div>
        </div>

        <div class="upload-actions" v-if="file && !uploading && !uploadSuccess">
          <el-button type="primary" @click="startUpload">开始上传</el-button>
          <el-button @click="resetUpload">取消</el-button>
        </div>

        <div class="upload-progress" v-if="uploading">
          <el-progress :percentage="uploadProgress" :format="progressFormat"
            :status="isPaused ? 'exception' : 'success'"></el-progress>
          <div class="progress-info">
            已上传: {{ uploadedChunks }}/{{ totalChunks }} 分片
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

// 文件相关状态
const file = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const chunkSize = 2 * 1024 * 1024; // 2MB分片大小

// 上传状态
const uploading = ref(false);
const isPaused = ref(false);
const uploadProgress = ref(0);
const uploadedChunks = ref(0);
const totalChunks = ref(0);
const uploadSuccess = ref(false);
const fileUrl = ref('');
const isFileInputActive = ref(false);

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

// 处理文件选择
const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    file.value = target.files[0];
    calculateTotalChunks();
  }
};

// 处理拖拽上传
const handleDrop = (e: DragEvent) => {
  if (e.dataTransfer && e.dataTransfer.files.length > 0) {
    file.value = e.dataTransfer.files[0];
    calculateTotalChunks();
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

// 上传单个分片
const uploadChunk = async (chunk: Blob, index: number, fileName: string) => {
  const formData = new FormData();
  formData.append('chunk', chunk, `${fileName}.part${index}`);
  formData.append('index', index.toString());
  formData.append('filename', fileName);
  formData.append('totalChunks', totalChunks.value.toString());

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

  // 从当前索引继续上传
  await continueUploadFromIndex(currentChunkIndex.value);
};

// 从指定索引继续上传
const continueUploadFromIndex = async (startIndex: number) => {
  if (!file.value || !uploading.value || isPaused.value) return;

  try {
    const fileName = file.value.name;
    const chunks = createFileChunks(file.value);

    // 从保存的索引继续上传
    for (let i = startIndex; i < chunks.length && uploading.value && !isPaused.value; i++) {
      currentChunkIndex.value = i; // 保存当前处理的分片索引

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
      const response = await request.post<ApiResponse>('/upload/merge', {
        filename: fileName,
        totalChunks: totalChunks.value
      }, {
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

// 开始上传
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

    // 开始从0上传
    await continueUploadFromIndex(0);
  } catch (error: any) {
    // 主函数中的错误处理，与continueUploadFromIndex中类似
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

// 重置上传
const resetUpload = () => {
  file.value = null;
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

  // 停止计时器
  if (uploadTimeTimer.value) {
    clearInterval(uploadTimeTimer.value);
    uploadTimeTimer.value = null;
  }

  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

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
  justify-content: center;
  gap: 12px;
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
</style>