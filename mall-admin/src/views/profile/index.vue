<template>
    <div class="profile-container">
        <el-card v-loading="loading">
            <template #header>
                <div class="card-header">
                    <h3>个人资料</h3>
                    <el-button type="primary" size="small" @click="refreshProfile">刷新</el-button>
                </div>
            </template>

            <div v-if="profile" class="profile-info">
                <div class="avatar-container">
                    <el-avatar :size="100" :src="profile.avatar || defaultAvatar" />
                </div>

                <el-descriptions :column="1" border>
                    <el-descriptions-item label="用户名">{{ profile.username }}</el-descriptions-item>
                    <el-descriptions-item label="真实姓名">{{ profile.realName || '未设置' }}</el-descriptions-item>
                    <el-descriptions-item label="邮箱">{{ profile.email || '未设置' }}</el-descriptions-item>
                    <el-descriptions-item label="手机">{{ profile.phone || '未设置' }}</el-descriptions-item>
                    <el-descriptions-item label="角色">
                        <el-tag type="success" v-if="profile.role === 'admin'">超级管理员</el-tag>
                        <el-tag type="warning" v-else-if="profile.role === 'editor'">编辑员</el-tag>
                        <el-tag type="info" v-else>{{ profile.role }}</el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="状态">
                        <el-tag :type="profile.status === 'active' ? 'success' : 'danger'">
                            {{ getStatusText(profile.status) }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="最后登录时间">
                        {{ formatDate(profile.lastLoginTime) }}
                    </el-descriptions-item>
                </el-descriptions>
            </div>
            <div v-else-if="!loading" class="empty-data">
                <el-empty description="暂无个人信息" />
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { adminApi } from '../../api/admin'
import type { AdminInfo } from '../../api/admin'

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 状态文本映射
const statusText: Record<string, string> = {
    active: '正常',
    inactive: '未激活',
    locked: '已锁定'
}

// 获取状态文本
const getStatusText = (status: string): string => {
    return statusText[status] || status
}

// 用户资料数据
const profile = ref<AdminInfo | null>(null)
const loading = ref(true)

// 格式化日期
const formatDate = (dateString: string | null): string => {
    if (!dateString) return '未登录'
    const date = new Date(dateString)
    return date.toLocaleString()
}

// 获取用户资料
const getProfile = async () => {
    try {
        loading.value = true
        const res = await adminApi.getProfile()
        profile.value = res.data.admin
    } catch (error) {
        ElMessage.error('获取个人资料失败')
    } finally {
        loading.value = false
    }
}

// 刷新个人资料
const refreshProfile = () => {
    getProfile()
}

// 页面加载时获取资料
onMounted(() => {
    getProfile()
})
</script>

<style lang="scss" scoped>
.profile-container {
    padding: 20px;

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .profile-info {
        max-width: 600px;
        margin: 0 auto;
    }

    .avatar-container {
        text-align: center;
        margin-bottom: 30px;
    }

    .empty-data {
        padding: 40px 0;
    }
}
</style>