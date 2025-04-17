<template>
    <div class="order-list">
        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                    <span>订单列表</span>
                    <div class="search-box">
                        <el-input v-model="searchQuery.keyword" placeholder="订单号/用户名" clearable @clear="handleSearch"
                            style="width: 200px; margin-right: 10px;" />
                        <el-select v-model="searchQuery.status" placeholder="订单状态" clearable @change="handleSearch"
                            style="width: 120px; margin-right: 10px;">
                            <el-option v-for="item in orderStatusOptions" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                        <el-button type="primary" @click="handleSearch">搜索</el-button>
                    </div>
                </div>
            </template>

            <el-table :data="orderList" border style="width: 100%" v-loading="loading">
                <el-table-column prop="id" label="订单编号" width="180" />
                <el-table-column prop="userId" label="用户ID" width="100" />
                <el-table-column prop="username" label="用户名" width="120" />
                <el-table-column prop="totalAmount" label="订单金额" width="120">
                    <template #default="scope">
                        <span>¥{{ scope.row.totalAmount.toFixed(2) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="订单状态" width="120">
                    <template #default="scope">
                        <el-tag :type="getOrderStatusType(scope.row.status)">
                            {{ getOrderStatusText(scope.row.status) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="createTime" label="创建时间" width="180" />
                <el-table-column prop="payTime" label="支付时间" width="180" />
                <el-table-column label="操作" fixed="right" width="220">
                    <template #default="scope">
                        <el-button size="small" type="primary" @click="handleViewOrder(scope.row)">
                            查看
                        </el-button>
                        <el-button size="small" type="success" v-if="scope.row.status === 1"
                            @click="handleShipOrder(scope.row)">
                            发货
                        </el-button>
                        <el-button size="small" type="danger" v-if="scope.row.status === 0"
                            @click="handleCancelOrder(scope.row)">
                            取消
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

        <!-- 订单详情抽屉 -->
        <el-drawer v-model="drawerVisible" title="订单详情" direction="rtl" size="60%">
            <div v-if="currentOrder" class="order-detail">
                <h3>订单基本信息</h3>
                <el-descriptions :column="2" border>
                    <el-descriptions-item label="订单编号">{{ currentOrder.id }}</el-descriptions-item>
                    <el-descriptions-item label="创建时间">{{ currentOrder.createTime }}</el-descriptions-item>
                    <el-descriptions-item label="用户ID">{{ currentOrder.userId }}</el-descriptions-item>
                    <el-descriptions-item label="用户名">{{ currentOrder.username }}</el-descriptions-item>
                    <el-descriptions-item label="订单状态">
                        <el-tag :type="getOrderStatusType(currentOrder.status)">
                            {{ getOrderStatusText(currentOrder.status) }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="订单金额">¥{{ currentOrder.totalAmount.toFixed(2) }}</el-descriptions-item>
                    <el-descriptions-item label="支付时间" :span="2">{{ currentOrder.payTime || '未支付'
                    }}</el-descriptions-item>
                </el-descriptions>

                <h3>收货信息</h3>
                <el-descriptions :column="1" border>
                    <el-descriptions-item label="收货人">{{ currentOrder.receiverName }}</el-descriptions-item>
                    <el-descriptions-item label="手机号">{{ currentOrder.receiverPhone }}</el-descriptions-item>
                    <el-descriptions-item label="详细地址">{{ currentOrder.receiverAddress }}</el-descriptions-item>
                </el-descriptions>

                <h3>商品信息</h3>
                <el-table :data="currentOrder.orderItems" border style="width: 100%">
                    <el-table-column prop="productId" label="商品ID" width="100" />
                    <el-table-column prop="productName" label="商品名称" min-width="200" />
                    <el-table-column prop="productPic" label="图片" width="100">
                        <template #default="scope">
                            <el-image style="width: 60px; height: 60px" :src="scope.row.productPic" fit="cover"
                                :preview-src-list="[scope.row.productPic]" />
                        </template>
                    </el-table-column>
                    <el-table-column prop="productPrice" label="单价" width="100">
                        <template #default="scope">
                            <span>¥{{ scope.row.productPrice.toFixed(2) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="quantity" label="数量" width="80" />
                    <el-table-column prop="totalPrice" label="小计" width="100">
                        <template #default="scope">
                            <span>¥{{ scope.row.totalPrice.toFixed(2) }}</span>
                        </template>
                    </el-table-column>
                </el-table>

                <div class="order-actions" v-if="currentOrder.status === 1">
                    <el-button type="primary" @click="handleShipOrder(currentOrder)">发货</el-button>
                </div>
            </div>
        </el-drawer>

        <!-- 发货对话框 -->
        <el-dialog v-model="shipDialogVisible" title="订单发货" width="500px">
            <el-form :model="shipForm" :rules="shipRules" ref="shipFormRef" label-width="100px">
                <el-form-item label="物流公司" prop="deliveryCompany">
                    <el-select v-model="shipForm.deliveryCompany" placeholder="请选择物流公司">
                        <el-option label="顺丰速递" value="SF" />
                        <el-option label="中通快递" value="ZTO" />
                        <el-option label="圆通快递" value="YTO" />
                        <el-option label="韵达快递" value="YD" />
                        <el-option label="邮政EMS" value="EMS" />
                    </el-select>
                </el-form-item>
                <el-form-item label="物流单号" prop="deliverySn">
                    <el-input v-model="shipForm.deliverySn" placeholder="请输入物流单号" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="shipDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="confirmShip">确认发货</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'

// 订单接口
interface OrderItem {
    id: number;
    orderId: number;
    productId: number;
    productName: string;
    productPic: string;
    productPrice: number;
    quantity: number;
    totalPrice: number;
}

interface Order {
    id: string;
    userId: number;
    username: string;
    totalAmount: number;
    status: number; // 0: 待付款, 1: 待发货, 2: 已发货, 3: 已完成, 4: 已取消, 5: 已退款
    payType: number; // 0: 未支付, 1: 支付宝, 2: 微信
    createTime: string;
    payTime: string | null;
    deliveryCompany: string | null;
    deliverySn: string | null;
    deliveryTime: string | null;
    receiverName: string;
    receiverPhone: string;
    receiverAddress: string;
    orderItems: OrderItem[];
}

// 状态和加载
const loading = ref(false);
const total = ref(0);
const orderList = ref<Order[]>([]);
const currentOrder = ref<Order | null>(null);
const drawerVisible = ref(false);
const shipDialogVisible = ref(false);

// 搜索参数
const searchQuery = reactive({
    keyword: '',
    status: '',
    pageNum: 1,
    pageSize: 10
});

// 发货表单
const shipFormRef = ref<FormInstance>();
const shipForm = reactive({
    orderId: '',
    deliveryCompany: '',
    deliverySn: ''
});
const shipRules = {
    deliveryCompany: [{ required: true, message: '请选择物流公司', trigger: 'change' }],
    deliverySn: [{ required: true, message: '请输入物流单号', trigger: 'blur' }]
};

// 订单状态选项
const orderStatusOptions = [
    { label: '待付款', value: 0 },
    { label: '待发货', value: 1 },
    { label: '已发货', value: 2 },
    { label: '已完成', value: 3 },
    { label: '已取消', value: 4 },
    { label: '已退款', value: 5 }
];

// 获取订单状态文本
const getOrderStatusText = (status: number) => {
    const option = orderStatusOptions.find(item => item.value === status);
    return option ? option.label : '未知状态';
};

// 获取订单状态标签类型
const getOrderStatusType = (status: number) => {
    switch (status) {
        case 0: return ''; // 默认
        case 1: return 'warning'; // 待发货
        case 2: return 'info'; // 已发货
        case 3: return 'success'; // 已完成
        case 4: return 'danger'; // 已取消
        case 5: return 'danger'; // 已退款
        default: return '';
    }
};

// 查询订单列表
const fetchOrderList = () => {
    loading.value = true;

    // 模拟API请求
    setTimeout(() => {
        // 模拟数据
        const mockOrders: Order[] = [
            {
                id: 'ORD20230501001',
                userId: 1001,
                username: '张三',
                totalAmount: 299.99,
                status: 1,
                payType: 1,
                createTime: '2023-05-01 10:30:25',
                payTime: '2023-05-01 10:35:16',
                deliveryCompany: null,
                deliverySn: null,
                deliveryTime: null,
                receiverName: '张三',
                receiverPhone: '13812345678',
                receiverAddress: '北京市朝阳区XX街道XX小区1号楼1单元101',
                orderItems: [
                    {
                        id: 1,
                        orderId: 1,
                        productId: 101,
                        productName: '时尚休闲T恤',
                        productPic: 'https://via.placeholder.com/100',
                        productPrice: 149.99,
                        quantity: 1,
                        totalPrice: 149.99
                    },
                    {
                        id: 2,
                        orderId: 1,
                        productId: 102,
                        productName: '牛仔裤',
                        productPic: 'https://via.placeholder.com/100',
                        productPrice: 150.00,
                        quantity: 1,
                        totalPrice: 150.00
                    }
                ]
            },
            {
                id: 'ORD20230502002',
                userId: 1002,
                username: '李四',
                totalAmount: 1299.00,
                status: 2,
                payType: 2,
                createTime: '2023-05-02 15:20:10',
                payTime: '2023-05-02 15:25:33',
                deliveryCompany: 'SF',
                deliverySn: 'SF1234567890',
                deliveryTime: '2023-05-03 09:12:45',
                receiverName: '李四',
                receiverPhone: '13987654321',
                receiverAddress: '上海市浦东新区XX路XX号XX花园B栋2单元2203',
                orderItems: [
                    {
                        id: 3,
                        orderId: 2,
                        productId: 103,
                        productName: '智能手机',
                        productPic: 'https://via.placeholder.com/100',
                        productPrice: 1299.00,
                        quantity: 1,
                        totalPrice: 1299.00
                    }
                ]
            },
            {
                id: 'ORD20230503003',
                userId: 1003,
                username: '王五',
                totalAmount: 89.90,
                status: 0,
                payType: 0,
                createTime: '2023-05-03 20:10:35',
                payTime: null,
                deliveryCompany: null,
                deliverySn: null,
                deliveryTime: null,
                receiverName: '王五',
                receiverPhone: '13500123456',
                receiverAddress: '广州市天河区XX大道XX号XX公寓3栋1803',
                orderItems: [
                    {
                        id: 4,
                        orderId: 3,
                        productId: 104,
                        productName: '运动水壶',
                        productPic: 'https://via.placeholder.com/100',
                        productPrice: 89.90,
                        quantity: 1,
                        totalPrice: 89.90
                    }
                ]
            }
        ];

        orderList.value = mockOrders;
        total.value = 100; // 模拟总数
        loading.value = false;
    }, 500);
};

// 搜索订单
const handleSearch = () => {
    searchQuery.pageNum = 1;
    fetchOrderList();
};

// 分页处理
const handleSizeChange = (size: number) => {
    searchQuery.pageSize = size;
    fetchOrderList();
};

const handleCurrentChange = (page: number) => {
    searchQuery.pageNum = page;
    fetchOrderList();
};

// 查看订单详情
const handleViewOrder = (order: Order) => {
    currentOrder.value = order;
    drawerVisible.value = true;
};

// 发货处理
const handleShipOrder = (order: Order) => {
    shipForm.orderId = order.id;
    shipForm.deliveryCompany = '';
    shipForm.deliverySn = '';
    shipDialogVisible.value = true;
};

// 确认发货
const confirmShip = () => {
    shipFormRef.value?.validate((valid) => {
        if (valid) {
            // 模拟API调用
            ElMessage.success('订单发货成功');

            // 更新订单状态
            if (currentOrder.value && currentOrder.value.id === shipForm.orderId) {
                currentOrder.value.status = 2;
                currentOrder.value.deliveryCompany = shipForm.deliveryCompany;
                currentOrder.value.deliverySn = shipForm.deliverySn;
                currentOrder.value.deliveryTime = new Date().toLocaleString();
            }

            // 更新列表中的订单状态
            const orderIndex = orderList.value.findIndex(item => item.id === shipForm.orderId);
            if (orderIndex !== -1) {
                orderList.value[orderIndex].status = 2;
                orderList.value[orderIndex].deliveryCompany = shipForm.deliveryCompany;
                orderList.value[orderIndex].deliverySn = shipForm.deliverySn;
                orderList.value[orderIndex].deliveryTime = new Date().toLocaleString();
            }

            shipDialogVisible.value = false;
        }
    });
};

// 取消订单
const handleCancelOrder = (order: Order) => {
    ElMessageBox.confirm(
        `确定要取消订单 ${order.id} 吗?`,
        '提示',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(() => {
        // 模拟API调用
        ElMessage.success('订单取消成功');

        // 更新订单状态
        const orderIndex = orderList.value.findIndex(item => item.id === order.id);
        if (orderIndex !== -1) {
            orderList.value[orderIndex].status = 4;
        }
    }).catch(() => {
        // 取消操作
    });
};

// 初始加载
onMounted(() => {
    fetchOrderList();
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

    .el-card {
        margin-bottom: 20px;
    }

    .el-table {
        width: 100%;
        max-width: 100%;
        overflow-x: auto;
    }

    .order-detail {
        padding: 20px;

        h3 {
            margin-top: 20px;
            margin-bottom: 10px;
            font-weight: bold;
        }

        .order-actions {
            margin-top: 20px;
            display: flex;
            justify-content: flex-end;
        }
    }
}
</style>