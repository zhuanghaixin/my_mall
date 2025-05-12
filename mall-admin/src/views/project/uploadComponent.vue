<template>
    <div>
        <h2>大文件上传组件演示</h2>
        <p>尝试上传一个文件，支持断点续传和秒传功能</p>

        <el-button @click="testClick" type="success" style="margin-bottom: 20px;">测试按钮响应</el-button>

        <el-form label-width="120px" style="margin-bottom: 20px;">
            <el-form-item label="上传服务器URL">
                <el-input v-model="baseUrl" placeholder="例如：http://localhost:3000" />
            </el-form-item>
            <el-form-item label="验证API">
                <el-input v-model="verifyAction" />
            </el-form-item>
            <el-form-item label="分片上传API">
                <el-input v-model="chunkAction" />
            </el-form-item>
            <el-form-item label="合并API">
                <el-input v-model="mergeAction" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="updateApiUrls">更新API接口</el-button>
            </el-form-item>
        </el-form>

        <BigUpload ref="uploadRef" v-model="file" :chunk-size="2 * 1024 * 1024" :concurrent-limit="3"
            :verify-action="verifyAction" :chunk-action="chunkAction" :merge-action="mergeAction"
            @success="onUploadSuccess" @error="onUploadError" @progress="onUploadProgress"
            @hash-progress="onHashProgress">
            <template #trigger>
                <el-button type="primary" size="large" @click="manualTrigger">
                    <i class="el-icon-upload"></i> 点击选择文件上传
                </el-button>
            </template>

            <template #result="{ fileUrl, fileHash, file }">
                <div class="upload-result">
                    <h3><i class="el-icon-success" style="color: #67C23A;"></i> 上传成功！</h3>
                    <div>文件名：{{ file?.name }}</div>
                    <div>文件大小：{{ formatFileSize(file?.size || 0) }}</div>
                    <div>文件特征值：{{ fileHash }}</div>
                    <div>访问地址：<a :href="fileUrl" target="_blank">{{ fileUrl }}</a></div>
                </div>
            </template>
        </BigUpload>

        <div v-if="uploadLogs.length > 0" class="upload-logs">
            <h3>上传日志 <el-button size="small" @click="clearLogs">清空日志</el-button></h3>
            <el-card style="max-height: 400px; overflow-y: auto;">
                <div v-for="(log, index) in uploadLogs" :key="index" class="log-item">
                    <span class="log-time">{{ log.time }}</span>
                    <span :class="'log-type log-type-' + log.type">{{ log.type.toUpperCase() }}</span>
                    <span class="log-message">{{ log.message }}</span>
                </div>
            </el-card>
        </div>

        <div style="margin-top: 20px;">
            <h3>调试操作</h3>
            <el-button @click="checkUploaderStatus">查看上传组件状态</el-button>
            <el-button @click="testRequestVerify">测试验证请求</el-button>
            <el-button @click="testRequestChunk">测试分片请求</el-button>
            <el-button @click="testRequestMerge">测试合并请求</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BigUpload from '@/components/BigUpload.vue';
import request from '@/api/request';

const file = ref<File | undefined>(undefined);
const uploadLogs = ref<{ time: string, type: string, message: string }[]>([]);
const uploadRef = ref<InstanceType<typeof BigUpload> | null>(null);

// 服务器配置
const baseUrl = ref(window.location.origin);
const verifyAction = ref('/upload/verify');
const chunkAction = ref('/upload/chunk');
const mergeAction = ref('/upload/merge');

// 更新API URL
const updateApiUrls = () => {
    addLog('info', `更新API URL配置：
    - 验证API: ${verifyAction.value}
    - 分片API: ${chunkAction.value}
    - 合并API: ${mergeAction.value}
    `);
};

// 为window添加testUpload方法的类型声明
declare global {
    interface Window {
        testUpload: () => void;
    }
}

// 页面加载时添加一条日志
onMounted(() => {
    console.log("组件已挂载");
    addLog('info', '页面已加载，等待用户操作');

    // 访问浏览器控制台执行
    window.testUpload = () => {
        addLog('info', '手动触发测试');
        if (uploadRef.value) {
            console.log("uploadRef获取成功:", uploadRef.value);
        } else {
            console.error("uploadRef未获取到");
        }
    };
});

// 清空日志
const clearLogs = () => {
    uploadLogs.value = [];
    addLog('info', '日志已清空');
};

// 测试按钮点击事件
const testClick = () => {
    console.log('测试按钮被点击');
    addLog('info', '测试按钮被点击');
};

// 手动触发文件选择
const manualTrigger = (e: Event) => {
    e.stopPropagation(); // 阻止事件冒泡
    console.log('选择文件按钮被点击');
    addLog('info', '选择文件按钮被点击');

    if (uploadRef.value) {
        try {
            console.log('尝试手动触发文件选择');
            // 使用类型断言访问方法
            const upload = uploadRef.value as any;
            if (typeof upload.triggerFileInput === 'function') {
                upload.triggerFileInput();
            } else {
                console.error('triggerFileInput方法不存在');
                addLog('error', 'triggerFileInput方法不存在');
            }
        } catch (error) {
            console.error('触发方法失败:', error);
            addLog('error', `触发方法失败: ${error}`);
        }
    } else {
        console.error('组件引用不可用');
        addLog('error', '组件引用不可用，无法触发文件选择');
    }
};

// 查看上传组件状态
const checkUploaderStatus = () => {
    if (!uploadRef.value) {
        addLog('error', '上传组件引用不可用');
        return;
    }

    const uploader = uploadRef.value as any;
    const statusInfo = {
        hasFile: !!uploader.file,
        fileName: uploader.file?.name,
        fileSize: uploader.file?.size,
        isUploading: uploader.uploading,
        isPaused: uploader.isPaused,
        uploadProgress: uploader.uploadProgress,
        uploadSuccess: uploader.uploadSuccess,
        fileHash: uploader.fileHash,
        fileUrl: uploader.fileUrl
    };

    addLog('info', '上传组件状态: ' + JSON.stringify(statusInfo, null, 2));
    console.log('上传组件状态:', statusInfo);
};

// 测试验证请求
const testRequestVerify = async () => {
    addLog('info', `正在测试验证接口: ${verifyAction.value}`);
    try {
        const response = await request.post(verifyAction.value, {
            filename: 'test-file.txt',
            totalChunks: 5,
            fileHash: 'test-hash-123'
        });
        addLog('success', `验证接口响应: ${JSON.stringify(response)}`);
    } catch (error) {
        addLog('error', `验证接口错误: ${error}`);
    }
};

// 测试分片请求
const testRequestChunk = async () => {
    addLog('info', `正在测试分片接口: ${chunkAction.value}`);
    try {
        const formData = new FormData();
        const blob = new Blob(['test chunk data'], { type: 'text/plain' });
        formData.append('chunk', blob, 'test-file.txt.part0');
        formData.append('index', '0');
        formData.append('filename', 'test-file.txt');
        formData.append('totalChunks', '5');
        formData.append('fileHash', 'test-hash-123');

        const response = await request.post(chunkAction.value, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        addLog('success', `分片接口响应: ${JSON.stringify(response)}`);
    } catch (error) {
        addLog('error', `分片接口错误: ${error}`);
    }
};

// 测试合并请求
const testRequestMerge = async () => {
    addLog('info', `正在测试合并接口: ${mergeAction.value}`);
    try {
        const response = await request.post(mergeAction.value, {
            filename: 'test-file.txt',
            totalChunks: 5,
            fileHash: 'test-hash-123'
        });
        addLog('success', `合并接口响应: ${JSON.stringify(response)}`);
    } catch (error) {
        addLog('error', `合并接口错误: ${error}`);
    }
};

// 添加日志函数
const addLog = (type: 'info' | 'success' | 'error' | 'warning', message: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    uploadLogs.value.unshift({ time: timeStr, type, message });
    document.title = `[${timeStr}] ${message}`; // 修改页面标题便于观察

    // 限制日志条数
    if (uploadLogs.value.length > 50) {
        uploadLogs.value = uploadLogs.value.slice(0, 50);
    }

    // 同时输出到控制台
    if (type === 'error') {
        console.error(message);
    } else if (type === 'warning') {
        console.warn(message);
    } else {
        console.log(message);
    }
};

const onUploadSuccess = (data: any) => {
    addLog('success', `上传成功: ${JSON.stringify(data)}`);
};

const onUploadError = (err: any) => {
    addLog('error', `上传失败: ${err.message || JSON.stringify(err)}`);
};

const onUploadProgress = (percent: number) => {
    if (percent % 10 === 0 || percent === 100) {
        addLog('info', `上传进度: ${percent}%`);
    }
};

const onHashProgress = (percent: number) => {
    if (percent % 25 === 0 || percent === 100) {
        addLog('info', `MD5计算进度: ${percent}%`);
    }
};

const formatFileSize = (size: number) => {
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
    if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + ' MB';
    return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};
</script>

<style scoped lang="scss">
.upload-result {
    padding: 16px 0;

    h3 {
        margin-bottom: 12px;
        font-size: 18px;
        color: #67C23A;
    }

    div {
        margin: 8px 0;
        color: #606266;
    }
}

.upload-logs {
    margin-top: 32px;

    h3 {
        margin-bottom: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .log-item {
        padding: 6px 0;
        font-family: monospace;
        border-bottom: 1px solid #f2f2f2;

        &:last-child {
            border-bottom: none;
        }
    }

    .log-time {
        color: #909399;
        margin-right: 8px;
    }

    .log-type {
        display: inline-block;
        width: 70px;
        padding: 0 4px;
        margin-right: 8px;
        text-align: center;
        border-radius: 3px;

        &.log-type-info {
            background-color: #e6f7ff;
            color: #1890ff;
        }

        &.log-type-success {
            background-color: #f0f9eb;
            color: #67C23A;
        }

        &.log-type-error {
            background-color: #fef0f0;
            color: #F56C6C;
        }

        &.log-type-warning {
            background-color: #fdf6ec;
            color: #E6A23C;
        }
    }

    .log-message {
        color: #303133;
        word-break: break-all;
    }
}
</style>