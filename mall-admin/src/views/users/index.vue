<template>
    <div class="user-list">
        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                    <span>用户列表</span>
                    <div class="search-box">
                        <el-input v-model="searchQuery.keyword" placeholder="用户名/手机号/邮箱" clearable @clear="handleSearch"
                            style="width: 220px; margin-right: 10px;" />
                        <el-select v-model="searchQuery.status" placeholder="状态" clearable @change="handleSearch"
                            style="width: 100px; margin-right: 10px;">
                            <el-option label="启用" :value="1" />
                            <el-option label="禁用" :value="0" />
                        </el-select>
                        <el-button type="primary" @click="handleSearch">搜索</el-button>
                    </div>
                </div>
            </template>

            <el-table :data="userList" border style="width: 100%" v-loading="loading">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="username" label="用户名" width="120" />
                <el-table-column prop="nickname" label="昵称" width="120" />
                <el-table-column prop="phone" label="手机号" width="120" />
                <el-table-column prop="email" label="邮箱" width="180" />
                <el-table-column prop="gender" label="性别" width="80">
                    <template #default="scope">
                        {{ scope.row.gender === 1 ? '男' : scope.row.gender === 2 ? '女' : '未知' }}
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="80">
                    <template #default="scope">
                        <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                            {{ scope.row.status === 1 ? '启用' : '禁用' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="createTime" label="注册时间" width="180" />
                <el-table-column prop="loginTime" label="最后登录" width="180" />
                <el-table-column label="操作" fixed="right" width="220">
                    <template #default="scope">
                        <el-button size="small" type="primary" @click="handleViewUser(scope.row)">
                            查看
                        </el-button>
                        <el-button size="small" :type="scope.row.status === 1 ? 'danger' : 'success'"
                            @click="handleToggleStatus(scope.row)">
                            {{ scope.row.status === 1 ? '禁用' : '启用' }}
                        </el-button>
                        <el-button size="small" type="warning" @click="handleResetPassword(scope.row)">
                            重置密码
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination-container">
                <el-pagination background layout="total, sizes, prev, pager, next, jumper" :total="total"
                    :page-size="searchQuery.pageSize" :current-page="searchQuery.pageNum"
                    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>
        </el-card>

        <!-- 用户详情抽屉 -->
        <el-drawer v-model="drawerVisible" title="用户详情" direction="rtl" size="40%">
            <div v-if="currentUser" class="user-detail">
                <el-descriptions :column="2" border>
                    <el-descriptions-item label="ID">{{ currentUser.id }}</el-descriptions-item>
                    <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
                    <el-descriptions-item label="昵称">{{ currentUser.nickname }}</el-descriptions-item>
                    <el-descriptions-item label="手机号">{{ currentUser.phone }}</el-descriptions-item>
                    <el-descriptions-item label="邮箱">{{ currentUser.email }}</el-descriptions-item>
                    <el-descriptions-item label="性别">
                        {{ currentUser.gender === 1 ? '男' : currentUser.gender === 2 ? '女' : '未知' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="状态">
                        <el-tag :type="currentUser.status === 1 ? 'success' : 'danger'">
                            {{ currentUser.status === 1 ? '启用' : '禁用' }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="注册时间">{{ currentUser.createTime }}</el-descriptions-item>
                    <el-descriptions-item label="最后登录">{{ currentUser.loginTime }}</el-descriptions-item>
                    <el-descriptions-item label="会员等级">{{ currentUser.memberLevel }}</el-descriptions-item>
                </el-descriptions>

                <h3>订单统计</h3>
                <el-row :gutter="20" class="stat-cards">
                    <el-col :span="8">
                        <el-card shadow="hover">
                            <template #header>
                                <div class="stat-header">
                                    <span>订单总数</span>
                                </div>
                            </template>
                            <div class="stat-value">{{ currentUser.orderStats.total }}</div>
                        </el-card>
                    </el-col>
                    <el-col :span="8">
                        <el-card shadow="hover">
                            <template #header>
                                <div class="stat-header">
                                    <span>总消费</span>
                                </div>
                            </template>
                            <div class="stat-value">¥{{ currentUser.orderStats.amount.toFixed(2) }}</div>
                        </el-card>
                    </el-col>
                    <el-col :span="8">
                        <el-card shadow="hover">
                            <template #header>
                                <div class="stat-header">
                                    <span>待付款</span>
                                </div>
                            </template>
                            <div class="stat-value">{{ currentUser.orderStats.unpaid }}</div>
                        </el-card>
                    </el-col>
                </el-row>

                <div class="user-actions">
                    <el-button :type="currentUser.status === 1 ? 'danger' : 'success'"
                        @click="handleToggleStatus(currentUser)">
                        {{ currentUser.status === 1 ? '禁用用户' : '启用用户' }}
                    </el-button>
                    <el-button type="warning" @click="handleResetPassword(currentUser)">重置密码</el-button>
                </div>
            </div>
        </el-drawer>

        <!-- 重置密码对话框 -->
        <el-dialog v-model="resetPasswordDialogVisible" title="重置密码" width="400px">
            <p>确定要重置用户 <strong>{{ currentUser?.username }}</strong> 的密码吗？</p>
            <p>新密码将通过短信发送给用户。</p>
            <template #footer>
                <el-button @click="resetPasswordDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="confirmResetPassword">确 定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 用户接口
interface UserOrderStats {
    total: number;
    amount: number;
    unpaid: number;
}

interface User {
    id: number;
    username: string;
    nickname: string;
    phone: string;
    email: string;
    gender: number; // 0: 未知, 1: 男, 2: 女
    status: number; // 0: 禁用, 1: 启用
    createTime: string;
    loginTime: string;
    memberLevel: string;
    orderStats: UserOrderStats;
}

// 状态和加载
const loading = ref(false);
const total = ref(0);
const userList = ref<User[]>([]);
const currentUser = ref<User | null>(null);
const drawerVisible = ref(false);
const resetPasswordDialogVisible = ref(false);

// 搜索参数
const searchQuery = reactive({
    keyword: '',
    status: '',
    pageNum: 1,
    pageSize: 10
});

// 获取用户列表
const fetchUserList = () => {
    loading.value = true;

    // 模拟API请求
    setTimeout(() => {
        // 模拟数据
        const mockUsers: User[] = [
            {
                id: 1001,
                username: 'zhangsan',
                nickname: '张三',
                phone: '13812345678',
                email: 'zhangsan@example.com',
                gender: 1,
                status: 1,
                createTime: '2023-01-15 10:30:25',
                loginTime: '2023-05-01 18:22:36',
                memberLevel: '黄金会员',
                orderStats: {
                    total: 15,
                    amount: 2599.80,
                    unpaid: 1
                }
            },
            {
                id: 1002,
                username: 'lisi',
                nickname: '李四',
                phone: '13987654321',
                email: 'lisi@example.com',
                gender: 1,
                status: 1,
                createTime: '2023-02-20 14:45:12',
                loginTime: '2023-05-02 09:11:05',
                memberLevel: '白银会员',
                orderStats: {
                    total: 8,
                    amount: 1299.50,
                    unpaid: 0
                }
            },
            {
                id: 1003,
                username: 'wangwu',
                nickname: '王五',
                phone: '13500123456',
                email: 'wangwu@example.com',
                gender: 1,
                status: 0,
                createTime: '2023-03-05 16:20:38',
                loginTime: '2023-04-20 20:15:42',
                memberLevel: '普通会员',
                orderStats: {
                    total: 3,
                    amount: 389.90,
                    unpaid: 2
                }
            },
            {
                id: 1004,
                username: 'zhaoliu',
                nickname: '赵六',
                phone: '13611112222',
                email: 'zhaoliu@example.com',
                gender: 1,
                status: 1,
                createTime: '2023-03-10 11:35:52',
                loginTime: '2023-05-03 14:28:19',
                memberLevel: '普通会员',
                orderStats: {
                    total: 5,
                    amount: 799.00,
                    unpaid: 0
                }
            },
            {
                id: 1005,
                username: 'xiaohong',
                nickname: '小红',
                phone: '13922223333',
                email: 'xiaohong@example.com',
                gender: 2,
                status: 1,
                createTime: '2023-04-01 09:12:48',
                loginTime: '2023-05-01 16:40:23',
                memberLevel: '白银会员',
                orderStats: {
                    total: 7,
                    amount: 1159.70,
                    unpaid: 1
                }
            }
        ];

        userList.value = mockUsers;
        total.value = 100; // 模拟总数
        loading.value = false;
    }, 500);
};

// 搜索用户
const handleSearch = () => {
    searchQuery.pageNum = 1;
    fetchUserList();
};

// 分页处理
const handleSizeChange = (size: number) => {
    searchQuery.pageSize = size;
    fetchUserList();
};

const handleCurrentChange = (page: number) => {
    searchQuery.pageNum = page;
    fetchUserList();
};

// 查看用户详情
const handleViewUser = (user: User) => {
    currentUser.value = user;
    drawerVisible.value = true;
};

// 切换用户状态
const handleToggleStatus = (user: User) => {
    const newStatus = user.status === 1 ? 0 : 1;
    const statusText = newStatus === 1 ? '启用' : '禁用';

    ElMessageBox.confirm(
        `确定要${statusText}用户 ${user.username} 吗?`,
        '提示',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(() => {
        // 模拟API调用

        // 更新用户状态
        user.status = newStatus;

        ElMessage.success(`用户${statusText}成功`);
    }).catch(() => {
        // 取消操作
    });
};

// 重置用户密码
const handleResetPassword = (user: User) => {
    currentUser.value = user;
    resetPasswordDialogVisible.value = true;
};

// 确认重置密码
const confirmResetPassword = () => {
    if (!currentUser.value) return;

    // 模拟API调用
    setTimeout(() => {
        ElMessage.success(`密码重置成功，新密码已发送至用户手机`);
        resetPasswordDialogVisible.value = false;
    }, 500);
};

// 初始加载
onMounted(() => {
    fetchUserList();
});
</script>

<style scoped lang="scss">
.user-list {
    height: 100%;
    overflow: auto;

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .search-box {
        display: flex;
        align-items: center;
    }

    .pagination-container {
        margin-top: 20px;
        margin-bottom: 20px;
        display: flex;
        justify-content: center;
    }

    .el-card {
        margin-bottom: 20px;
    }

    .el-table {
        width: 100%;
        max-width: 100%;
        overflow-x: auto;
    }

    .user-detail {
        padding: 20px;

        h3 {
            margin-top: 20px;
            margin-bottom: 15px;
            font-weight: bold;
        }

        .stat-cards {
            margin-bottom: 20px;

            .stat-header {
                display: flex;
                justify-content: center;
                font-size: 14px;
            }

            .stat-value {
                font-size: 24px;
                text-align: center;
                color: #409eff;
                font-weight: bold;
            }
        }

        .user-actions {
            margin-top: 20px;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }
    }
}
</style>