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
          <el-progress :percentage="uploadProgress" :format="progressFormat" status="success"></el-progress>
          <div class="progress-info">
            已上传: {{ uploadedChunks }}/{{ totalChunks }} 分片
          </div>
          <el-button type="danger" @click="cancelUpload" size="small">取消上传</el-button>
        </div>

        <div class="upload-result" v-if="uploadSuccess">
          <i class="el-icon-success success-icon"></i>
          <div class="success-text">上传成功</div>
          <div class="file-url">文件地址: {{ fileUrl }}</div>
          <el-button type="primary" @click="resetUpload" size="small">继续上传</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import request from '@/api/request';
import type { ApiResponse } from '@/api/request';

// 文件相关状态
const file = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const chunkSize = 2 * 1024 * 1024; // 2MB分片大小

// 上传状态
const uploading = ref(false);
const uploadProgress = ref(0);
const uploadedChunks = ref(0);
const totalChunks = ref(0);
const uploadSuccess = ref(false);
const fileUrl = ref('');
const isFileInputActive = ref(false);

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
  return percentage === 100 ? '准备合并文件...' : `${percentage}%`;
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
    const response = await request.post<ApiResponse>('/upload/chunk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }) as unknown as ApiResponse;

    if (response.code === 200) {
      uploadedChunks.value++;
      uploadProgress.value = Math.floor((uploadedChunks.value / totalChunks.value) * 100);
    } else {
      throw new Error(response.message || '分片上传失败');
    }
  } catch (error) {
    console.error(`分片 ${index} 上传失败:`, error);
    throw error;
  }
};

// 开始上传
const startUpload = async () => {
  if (!file.value) return;

  try {
    uploading.value = true;
    uploadedChunks.value = 0;
    uploadProgress.value = 0;

    const fileName = file.value.name;
    const chunks = createFileChunks(file.value);

    // 顺序上传分片，添加错误处理和重试逻辑
    for (let i = 0; i < chunks.length; i++) {
      try {
        await uploadChunk(chunks[i], i, fileName);
      } catch (error: any) {
        // 分片上传失败，尝试重试一次
        console.warn(`分片 ${i} 上传失败，正在重试...`);
        try {
          await uploadChunk(chunks[i], i, fileName);
        } catch (retryError: any) {
          // 重试失败，中断上传
          throw new Error(`分片 ${i} 上传失败: ${retryError.message || '请检查网络连接'}`);
        }
      }
    }

    // 请求合并文件
    const response = await request.post<ApiResponse>('/upload/merge', {
      filename: fileName,
      totalChunks: totalChunks.value
    }) as unknown as ApiResponse;

    console.log('合并文件响应:', response); // 添加调试日志，查看响应结构

    if (response.code === 200) {
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
    ElMessage.error('上传失败: ' + (error.message || '请重试'));
    console.error('上传错误:', error);
  } finally {
    uploading.value = false;
  }
};

// 取消上传
const cancelUpload = () => {
  uploading.value = false;
  uploadProgress.value = 0;
  uploadedChunks.value = 0;
  ElMessage.info('上传已取消');
};

// 重置上传
const resetUpload = () => {
  file.value = null;
  uploading.value = false;
  uploadProgress.value = 0;
  uploadedChunks.value = 0;
  totalChunks.value = 0;
  uploadSuccess.value = false;
  fileUrl.value = '';

  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

// 页面加载后修正UI状态
onMounted(() => {
  // 确保初始状态正确
  resetUpload();
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
</style>