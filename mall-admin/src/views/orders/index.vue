<template>
    <div class="order-list">
        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                    <span>订单列表</span>
                    <div class="search-box">
                        <el-input v-model="searchQuery.order_no" placeholder="订单编号" clearable @clear="handleSearch"
                            style="width: 180px; margin-right: 10px;" />
                        <el-select v-model="searchQuery.status" placeholder="订单状态" clearable @change="handleSearch"
                            style="width: 120px; margin-right: 10px;">
                            <el-option v-for="item in orderStatusOptions" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                        <el-date-picker
                            v-model="dateRange"
                            type="daterange"
                            range-separator="至"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            format="YYYY-MM-DD"
                            value-format="YYYY-MM-DD"
                            style="width: 320px; margin-right: 10px;"
                            @change="handleDateRangeChange"
                        />
                        <el-button type="primary" @click="handleSearch">搜索</el-button>
                    </div>
                </div>
            </template>

            <!-- 订单统计卡片 -->
            <div class="order-stats" v-if="orderStats">
                <el-row :gutter="20">
                    <el-col :span="4">
                        <el-card shadow="hover" class="stat-card">
                            <div class="stat-title">待付款</div>
                            <div class="stat-value">{{ orderStats.status_counts.pending_payment }}</div>
                        </el-card>
                    </el-col>
                    <el-col :span="4">
                        <el-card shadow="hover" class="stat-card">
                            <div class="stat-title">待发货</div>
                            <div class="stat-value">{{ orderStats.status_counts.pending_delivery }}</div>
                        </el-card>
                    </el-col>
                    <el-col :span="4">
                        <el-card shadow="hover" class="stat-card">
                            <div class="stat-title">待收货</div>
                            <div class="stat-value">{{ orderStats.status_counts.pending_receipt }}</div>
                        </el-card>
                    </el-col>
                    <el-col :span="4">
                        <el-card shadow="hover" class="stat-card">
                            <div class="stat-title">已完成</div>
                            <div class="stat-value">{{ orderStats.status_counts.completed }}</div>
                        </el-card>
                    </el-col>
                    <el-col :span="4">
                        <el-card shadow="hover" class="stat-card">
                            <div class="stat-title">已取消</div>
                            <div class="stat-value">{{ orderStats.status_counts.cancelled }}</div>
                        </el-card>
                    </el-col>
                    <el-col :span="4">
                        <el-card shadow="hover" class="stat-card">
                            <div class="stat-title">今日销售额</div>
                            <div class="stat-value">{{ formatCurrency(orderStats.today_sales) }}</div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>

            <el-table :data="orderList" border style="width: 100%" v-loading="loading">
                <el-table-column prop="order_no" label="订单编号" width="200" />
                <el-table-column label="用户信息" width="150">
                    <template #default="scope">
                        <div v-if="scope.row.user">
                            <el-avatar :size="30" :src="scope.row.user.avatar" />
                            <div>{{ scope.row.user.nickname }}</div>
                        </div>
                        <div v-else>用户ID: {{ scope.row.user_id }}</div>
                    </template>
                </el-table-column>
                <el-table-column label="商品信息" min-width="300">
                    <template #default="scope">
                        <div v-if="scope.row.orderGoods && scope.row.orderGoods.length > 0" class="goods-list">
                            <div v-for="(item, index) in scope.row.orderGoods" :key="index" class="goods-item">
                                <el-image 
                                    :src="item.goods_image" 
                                    :alt="item.goods_name"
                                    style="width: 40px; height: 40px; margin-right: 8px;"
                                />
                                <div class="goods-info">
                                    <div class="goods-name">{{ item.goods_name }}</div>
                                    <div class="goods-price">
                                        {{ formatCurrency(item.price) }} × {{ item.quantity }}
                                    </div>
                                </div>
                            </div>
                            <div v-if="scope.row.orderGoods.length > 1" class="goods-more">
                                共{{ scope.row.orderGoods.length }}件商品
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="订单金额" width="120">
                    <template #default="scope">
                        <div>{{ formatCurrency(scope.row.pay_amount) }}</div>
                        <div class="text-muted">
                            <small>含运费: {{ formatCurrency(scope.row.freight_amount) }}</small>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="订单状态" width="100">
                    <template #default="scope">
                        <el-tag :type="getOrderStatusType(scope.row.status)">
                            {{ getOrderStatusText(scope.row.status) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="时间信息" width="180">
                    <template #default="scope">
                        <div>创建: {{ formatDate(scope.row.create_time) }}</div>
                        <div v-if="scope.row.pay_time">支付: {{ formatDate(scope.row.pay_time) }}</div>
                        <div v-if="scope.row.delivery_time">发货: {{ formatDate(scope.row.delivery_time) }}</div>
                        <div v-if="scope.row.receive_time">完成: {{ formatDate(scope.row.receive_time) }}</div>
                    </template>
                </el-table-column>
                <el-table-column label="操作" fixed="right" width="180">
                    <template #default="scope">
                        <el-button size="small" type="primary" @click="handleViewOrder(scope.row)">
                            查看
                        </el-button>
                        <el-button size="small" type="success" v-if="scope.row.status === OrderStatus.PendingDelivery"
                            @click="handleShipOrder(scope.row)">
                            发货
                        </el-button>
                        <el-button size="small" type="danger" v-if="scope.row.status === OrderStatus.PendingPayment"
                            @click="handleCancelOrder(scope.row)">
                            取消
                        </el-button>
                        <el-button size="small" type="danger" v-if="scope.row.status === OrderStatus.Cancelled"
                            @click="handleDeleteOrder(scope.row)">
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination-container">
                <el-pagination background layout="total, sizes, prev, pager, next, jumper" :total="total"
                    :page-size="searchQuery.pageSize" :current-page="searchQuery.page"
                    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>
        </el-card>

        <!-- 订单详情抽屉 -->
        <el-drawer v-model="drawerVisible" title="订单详情" direction="rtl" size="60%">
            <div v-if="currentOrder" class="order-detail">
                <h3>订单基本信息</h3>
                <el-descriptions :column="2" border>
                    <el-descriptions-item label="订单编号">{{ currentOrder.order_no }}</el-descriptions-item>
                    <el-descriptions-item label="创建时间">{{ formatDate(currentOrder.create_time) }}</el-descriptions-item>
                    <el-descriptions-item label="用户信息" :span="2">
                        <div v-if="currentOrder.user" class="user-info">
                            <el-avatar :size="50" :src="currentOrder.user.avatar" />
                            <div>
                                <div>{{ currentOrder.user.nickname }}</div>
                                <div>{{ currentOrder.user.phone }}</div>
                            </div>
                        </div>
                        <div v-else>用户ID: {{ currentOrder.user_id }}</div>
                    </el-descriptions-item>
                    <el-descriptions-item label="订单状态">
                        <el-tag :type="getOrderStatusType(currentOrder.status)">
                            {{ getOrderStatusText(currentOrder.status) }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="订单金额">{{ formatCurrency(currentOrder.pay_amount) }}</el-descriptions-item>
                    <el-descriptions-item label="支付方式">{{ getPayTypeText(currentOrder.pay_type) }}</el-descriptions-item>
                    <el-descriptions-item label="运费">{{ formatCurrency(currentOrder.freight_amount) }}</el-descriptions-item>
                    <el-descriptions-item label="支付时间" :span="currentOrder.pay_time ? 1 : 2">
                        {{ currentOrder.pay_time ? formatDate(currentOrder.pay_time) : '未支付' }}
                    </el-descriptions-item>
                    <el-descriptions-item v-if="currentOrder.pay_time" label="订单备注" :span="1">
                        {{ currentOrder.remark || '无' }}
                    </el-descriptions-item>
                </el-descriptions>

                <template v-if="currentOrder.status >= OrderStatus.PendingReceipt">
                    <h3>物流信息</h3>
                    <el-descriptions :column="1" border>
                        <el-descriptions-item label="发货时间">{{ formatDate(currentOrder.delivery_time) }}</el-descriptions-item>
                        <el-descriptions-item label="物流公司">{{ currentOrder.delivery_company }}</el-descriptions-item>
                        <el-descriptions-item label="物流单号">{{ currentOrder.delivery_number }}</el-descriptions-item>
                    </el-descriptions>
                </template>

                <h3>商品信息</h3>
                <el-table :data="currentOrder.orderGoods || []" border style="width: 100%">
                    <el-table-column prop="goods_id" label="商品ID" width="100" />
                    <el-table-column prop="goods_name" label="商品名称" min-width="200" />
                    <el-table-column label="商品图片" width="100">
                        <template #default="scope">
                            <el-image style="width: 60px; height: 60px" :src="scope.row.goods_image" fit="cover"
                                :preview-src-list="[scope.row.goods_image]" />
                        </template>
                    </el-table-column>
                    <el-table-column prop="price" label="单价" width="100">
                        <template #default="scope">
                            <span>{{ formatCurrency(scope.row.price) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="quantity" label="数量" width="80" />
                    <el-table-column label="小计" width="100">
                        <template #default="scope">
                            <span>{{ formatCurrency(parseFloat(scope.row.price) * scope.row.quantity) }}</span>
                        </template>
                    </el-table-column>
                </el-table>

                <div class="order-actions" v-if="currentOrder.status === OrderStatus.PendingDelivery">
                    <el-button type="primary" @click="handleShipOrder(currentOrder)">发货</el-button>
                </div>
            </div>
        </el-drawer>

        <!-- 发货对话框 -->
        <el-dialog v-model="shipDialogVisible" title="订单发货" width="500px">
            <el-form :model="shipForm" :rules="shipRules" ref="shipFormRef" label-width="100px">
                <el-form-item label="物流公司" prop="delivery_company">
                    <el-select v-model="shipForm.delivery_company" placeholder="请选择物流公司">
                        <el-option label="顺丰速运" value="顺丰速运" />
                        <el-option label="中通快递" value="中通快递" />
                        <el-option label="圆通快递" value="圆通快递" />
                        <el-option label="韵达快递" value="韵达快递" />
                        <el-option label="邮政EMS" value="邮政EMS" />
                    </el-select>
                </el-form-item>
                <el-form-item label="物流单号" prop="delivery_number">
                    <el-input v-model="shipForm.delivery_number" placeholder="请输入物流单号" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="shipDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="confirmShip" :loading="submitLoading">确认发货</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { 
    getOrderList, 
    getOrderDetail, 
    updateOrderStatus, 
    deleteOrder,
    getOrderStats,
    type Order,
    type OrderStats,
    OrderStatus
} from '../../api/order'
import { useUserStore } from '../../stores/user'

// 状态和加载
const loading = ref(false);
const submitLoading = ref(false);
const total = ref(0);
const orderList = ref<Order[]>([]);
const currentOrder = ref<Order | null>(null);
const drawerVisible = ref(false);
const shipDialogVisible = ref(false);
const orderStats = ref<OrderStats | null>(null);
const dateRange = ref<[string, string] | null>(null);

// 搜索参数
const searchQuery = reactive({
    order_no: '',
    status: undefined as OrderStatus | undefined,
    page: 1,
    pageSize: 10,
    start_time: '',
    end_time: ''
});

// 发货表单
const shipFormRef = ref<FormInstance>();
const shipForm = reactive({
    id: 0,
    delivery_company: '',
    delivery_number: ''
});
const shipRules = {
    delivery_company: [{ required: true, message: '请选择物流公司', trigger: 'change' }],
    delivery_number: [{ required: true, message: '请输入物流单号', trigger: 'blur' }]
};

// 订单状态选项
const orderStatusOptions = [
    { label: '待付款', value: OrderStatus.PendingPayment },
    { label: '待发货', value: OrderStatus.PendingDelivery },
    { label: '待收货', value: OrderStatus.PendingReceipt },
    { label: '已完成', value: OrderStatus.Completed },
    { label: '已取消', value: OrderStatus.Cancelled }
];

// 获取订单状态文本
const getOrderStatusText = (status: number) => {
    const option = orderStatusOptions.find(item => item.value === status);
    return option ? option.label : '未知状态';
};

// 获取支付方式文本
const getPayTypeText = (payType: number) => {
    switch (payType) {
        case 0: return '未支付';
        case 1: return '微信支付';
        case 2: return '支付宝';
        default: return '未知方式';
    }
};

// 获取订单状态标签类型
const getOrderStatusType = (status: number) => {
    switch (status) {
        case OrderStatus.PendingPayment: return ''; // 默认
        case OrderStatus.PendingDelivery: return 'warning'; // 待发货
        case OrderStatus.PendingReceipt: return 'info'; // 待收货
        case OrderStatus.Completed: return 'success'; // 已完成
        case OrderStatus.Cancelled: return 'danger'; // 已取消
        default: return '';
    }
};

// 处理日期范围变化
const handleDateRangeChange = (val: [string, string] | null) => {
    if (val && val.length === 2) {
        searchQuery.start_time = val[0];
        searchQuery.end_time = val[1];
    } else {
        searchQuery.start_time = '';
        searchQuery.end_time = '';
    }
};

// 格式化货币
const formatCurrency = (value: number | string) => {
    // 确保value是数字类型
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return `¥${numValue.toFixed(2)}`;
};

// 格式化日期
const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// 获取订单统计信息
const fetchOrderStats = async () => {
    try {
        const res = await getOrderStats();
        console.log('订单统计信息:', res);
        if (res.code === 200) {
            orderStats.value = res.data;
        }
    } catch (error) {
        console.error('获取订单统计信息失败:', error);
    }
};

// 查询订单列表
const fetchOrderList = async () => {
    loading.value = true;
    try {
        const res = await getOrderList(searchQuery);
        console.log('订单列表数据:', res);
        if (res.code === 200) {
            orderList.value = res.data.list;
            total.value = res.data.total;
        }
    } catch (error) {
        console.error('获取订单列表失败:', error);
    } finally {
        loading.value = false;
    }
};

// 搜索订单
const handleSearch = () => {
    searchQuery.page = 1;
    fetchOrderList();
};

// 分页处理
const handleSizeChange = (size: number) => {
    searchQuery.pageSize = size;
    fetchOrderList();
};

const handleCurrentChange = (page: number) => {
    searchQuery.page = page;
    fetchOrderList();
};

// 查看订单详情
const handleViewOrder = async (order: Order) => {
    try {
        const res = await getOrderDetail(order.id);
        console.log('订单详情:', res);
        if (res.code === 200) {
            currentOrder.value = res.data;
            drawerVisible.value = true;
        }
    } catch (error) {
        console.error('获取订单详情失败:', error);
    }
};

// 发货处理
const handleShipOrder = (order: Order) => {
    shipForm.id = order.id;
    shipForm.delivery_company = '';
    shipForm.delivery_number = '';
    shipDialogVisible.value = true;
};

// 确认发货
const confirmShip = () => {
    shipFormRef.value?.validate(async (valid) => {
        if (valid) {
            submitLoading.value = true;
            try {
                const res = await updateOrderStatus(
                    shipForm.id, 
                    OrderStatus.PendingReceipt, 
                    {
                        delivery_company: shipForm.delivery_company,
                        delivery_number: shipForm.delivery_number
                    }
                );
                
                if (res.code === 200) {
                    ElMessage.success('订单发货成功');
                    shipDialogVisible.value = false;
                    
                    // 更新列表数据和当前订单
                    fetchOrderList();
                    fetchOrderStats();
                    
                    // 如果当前查看的是发货的订单，更新订单详情
                    if (currentOrder.value && currentOrder.value.id === shipForm.id) {
                        currentOrder.value = res.data;
                    }
                }
            } catch (error) {
                console.error('订单发货失败:', error);
            } finally {
                submitLoading.value = false;
            }
        }
    });
};

// 取消订单
const handleCancelOrder = (order: Order) => {
    ElMessageBox.confirm(
        `确定要取消订单 ${order.order_no} 吗?`,
        '提示',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(async () => {
        try {
            const res = await updateOrderStatus(order.id, OrderStatus.Cancelled);
            if (res.code === 200) {
                ElMessage.success('订单取消成功');
                fetchOrderList();
                fetchOrderStats();
                
                // 如果当前查看的是取消的订单，更新订单详情
                if (currentOrder.value && currentOrder.value.id === order.id) {
                    currentOrder.value = res.data;
                }
            }
        } catch (error) {
            console.error('订单取消失败:', error);
        }
    }).catch(() => {
        // 取消操作
    });
};

// 删除订单
const handleDeleteOrder = (order: Order) => {
    ElMessageBox.confirm(
        `确定要删除订单 ${order.order_no} 吗? 删除后无法恢复`,
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'error'
        }
    ).then(async () => {
        try {
            const res = await deleteOrder(order.id);
            if (res.code === 200) {
                ElMessage.success('订单删除成功');
                fetchOrderList();
                fetchOrderStats();
                
                // 如果当前查看的是删除的订单，关闭抽屉
                if (currentOrder.value && currentOrder.value.id === order.id) {
                    drawerVisible.value = false;
                }
            }
        } catch (error) {
            console.error('订单删除失败:', error);
        }
    }).catch(() => {
        // 取消操作
    });
};

// 初始加载
onMounted(() => {
    console.log('开始加载订单数据');
    // 检查是否有有效的Token
    const userStore = useUserStore();
    console.log('当前Token状态:', userStore.token ? '已登录' : '未登录');
    if (!userStore.token) {
        ElMessage.error('您未登录或登录已过期，请重新登录');
        return;
    }
    fetchOrderList();
    fetchOrderStats();
});
</script>

<style scoped lang="scss">
.order-list {
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

    .order-stats {
        margin-bottom: 20px;
        
        .stat-card {
            text-align: center;
            padding: 10px;
            
            .stat-title {
                font-size: 14px;
                color: #606266;
                margin-bottom: 8px;
            }
            
            .stat-value {
                font-size: 20px;
                font-weight: bold;
                color: #409EFF;
            }
        }
    }

    .goods-list {
        max-height: 120px;
        overflow-y: auto;
        
        .goods-item {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            
            .goods-info {
                flex: 1;
                
                .goods-name {
                    font-size: 14px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                
                .goods-price {
                    font-size: 12px;
                    color: #999;
                }
            }
        }
        
        .goods-more {
            font-size: 12px;
            color: #409EFF;
            text-align: right;
        }
    }

    .order-detail {
        padding: 20px;

        h3 {
            margin-top: 20px;
            margin-bottom: 10px;
            font-weight: bold;
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .order-actions {
            margin-top: 20px;
            display: flex;
            justify-content: flex-end;
        }
    }
    
    .text-muted {
        color: #909399;
    }
}
</style>