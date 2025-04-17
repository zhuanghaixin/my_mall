<template>
    <div class="system-settings">
        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                    <span>系统基本设置</span>
                </div>
            </template>

            <el-form ref="settingsFormRef" :model="settingsForm" :rules="settingsRules" label-width="120px"
                class="settings-form">
                <!-- 基本信息 -->
                <h3>基本信息</h3>
                <el-form-item label="系统名称" prop="siteName">
                    <el-input v-model="settingsForm.siteName" placeholder="请输入系统名称" />
                </el-form-item>
                <el-form-item label="系统LOGO">
                    <el-upload class="logo-uploader" action="#" :http-request="uploadLogo" :show-file-list="false"
                        :before-upload="beforeLogoUpload">
                        <img v-if="settingsForm.logoUrl" :src="settingsForm.logoUrl" class="logo" />
                        <el-icon v-else class="logo-uploader-icon">
                            <Plus />
                        </el-icon>
                    </el-upload>
                    <div class="upload-tip">建议尺寸: 200px × 60px</div>
                </el-form-item>
                <el-form-item label="公司名称" prop="companyName">
                    <el-input v-model="settingsForm.companyName" placeholder="请输入公司名称" />
                </el-form-item>
                <el-form-item label="客服电话" prop="servicePhone">
                    <el-input v-model="settingsForm.servicePhone" placeholder="请输入客服电话" />
                </el-form-item>
                <el-form-item label="客服邮箱" prop="serviceEmail">
                    <el-input v-model="settingsForm.serviceEmail" placeholder="请输入客服邮箱" />
                </el-form-item>

                <!-- 商城设置 -->
                <h3>商城设置</h3>
                <el-form-item label="商城状态">
                    <el-radio-group v-model="settingsForm.shopStatus">
                        <el-radio :label="1">正常营业</el-radio>
                        <el-radio :label="0">系统维护中</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="维护提示" v-if="settingsForm.shopStatus === 0">
                    <el-input v-model="settingsForm.maintenanceMsg" type="textarea" placeholder="系统维护中，请稍后再试..."
                        :rows="3" />
                </el-form-item>
                <el-form-item label="新订单通知">
                    <el-switch v-model="settingsForm.newOrderNotify" />
                </el-form-item>
                <el-form-item label="默认显示库存">
                    <el-switch v-model="settingsForm.showStock" />
                </el-form-item>

                <!-- 支付设置 -->
                <h3>支付设置</h3>
                <el-form-item label="支付方式">
                    <el-checkbox-group v-model="settingsForm.paymentMethods">
                        <el-checkbox label="wechat">微信支付</el-checkbox>
                        <el-checkbox label="alipay">支付宝</el-checkbox>
                        <el-checkbox label="bank">银行转账</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item label="订单超时时间">
                    <el-input-number v-model="settingsForm.orderTimeout" :min="1" :max="48" controls-position="right" />
                    <span class="unit-label">小时</span>
                </el-form-item>
                <el-form-item label="自动确认收货">
                    <el-input-number v-model="settingsForm.autoConfirmDay" :min="1" :max="30"
                        controls-position="right" />
                    <span class="unit-label">天</span>
                </el-form-item>

                <!-- 送货区域设置 -->
                <h3>配送区域设置</h3>
                <el-form-item label="配送区域">
                    <el-tree ref="regionTree" :data="regionData" show-checkbox node-key="id"
                        :props="{ children: 'children', label: 'label' }" @check="handleRegionCheck" />
                </el-form-item>

                <!-- 提交按钮 -->
                <el-form-item>
                    <el-button type="primary" @click="submitSettings">保存设置</el-button>
                    <el-button @click="resetSettings">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules, UploadProps, UploadRequestOptions } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';

// 表单引用
const settingsFormRef = ref<FormInstance>();

// 表单数据
const settingsForm = reactive({
    siteName: '商城管理系统',
    logoUrl: 'https://via.placeholder.com/200x60',
    companyName: '示例科技有限公司',
    servicePhone: '400-123-4567',
    serviceEmail: 'service@example.com',
    shopStatus: 1, // 1: 正常营业, 0: 系统维护
    maintenanceMsg: '系统维护中，请稍后再试...',
    newOrderNotify: true,
    showStock: true,
    paymentMethods: ['wechat', 'alipay'],
    orderTimeout: 24, // 小时
    autoConfirmDay: 7, // 天
    regions: [] as number[] // 配送区域ID
});

// 表单校验规则
const settingsRules = reactive<FormRules>({
    siteName: [
        { required: true, message: '请输入系统名称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    companyName: [
        { required: true, message: '请输入公司名称', trigger: 'blur' }
    ],
    servicePhone: [
        { required: true, message: '请输入客服电话', trigger: 'blur' },
        { pattern: /^(\d{3,4}-\d{7,8})|(\d{11})$/, message: '电话格式不正确', trigger: 'blur' }
    ],
    serviceEmail: [
        { required: true, message: '请输入客服邮箱', trigger: 'blur' },
        { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
    ]
});

// 地区数据
const regionData = [
    {
        id: 1,
        label: '华北地区',
        children: [
            { id: 11, label: '北京市' },
            { id: 12, label: '天津市' },
            { id: 13, label: '河北省' },
            { id: 14, label: '山西省' },
            { id: 15, label: '内蒙古自治区' }
        ]
    },
    {
        id: 2,
        label: '华东地区',
        children: [
            { id: 21, label: '上海市' },
            { id: 22, label: '江苏省' },
            { id: 23, label: '浙江省' },
            { id: 24, label: '安徽省' },
            { id: 25, label: '福建省' },
            { id: 26, label: '江西省' },
            { id: 27, label: '山东省' }
        ]
    },
    {
        id: 3,
        label: '华南地区',
        children: [
            { id: 31, label: '广东省' },
            { id: 32, label: '广西壮族自治区' },
            { id: 33, label: '海南省' }
        ]
    },
    {
        id: 4,
        label: '华中地区',
        children: [
            { id: 41, label: '河南省' },
            { id: 42, label: '湖北省' },
            { id: 43, label: '湖南省' }
        ]
    },
    {
        id: 5,
        label: '西南地区',
        children: [
            { id: 51, label: '重庆市' },
            { id: 52, label: '四川省' },
            { id: 53, label: '贵州省' },
            { id: 54, label: '云南省' },
            { id: 55, label: '西藏自治区' }
        ]
    },
    {
        id: 6,
        label: '西北地区',
        children: [
            { id: 61, label: '陕西省' },
            { id: 62, label: '甘肃省' },
            { id: 63, label: '青海省' },
            { id: 64, label: '宁夏回族自治区' },
            { id: 65, label: '新疆维吾尔自治区' }
        ]
    },
    {
        id: 7,
        label: '东北地区',
        children: [
            { id: 71, label: '辽宁省' },
            { id: 72, label: '吉林省' },
            { id: 73, label: '黑龙江省' }
        ]
    },
    {
        id: 8,
        label: '港澳台地区',
        children: [
            { id: 81, label: '香港特别行政区' },
            { id: 82, label: '澳门特别行政区' },
            { id: 83, label: '台湾省' }
        ]
    }
];

// 地区树引用
const regionTree = ref();

// 处理地区选择
const handleRegionCheck = (_: any, checkedNodes: any) => {
    settingsForm.regions = checkedNodes.checkedKeys;
};

// 上传logo前校验
const beforeLogoUpload: UploadProps['beforeUpload'] = (file) => {
    // 检查文件类型
    const isImage = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isImage) {
        ElMessage.error('上传LOGO只能是JPG或PNG格式!');
        return false;
    }

    // 检查文件大小
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
        ElMessage.error('上传LOGO大小不能超过2MB!');
        return false;
    }

    return true;
};

// 上传LOGO
const uploadLogo = (options: UploadRequestOptions) => {
    const { file } = options;
    // 实际项目中应调用上传API
    // 这里使用FileReader来模拟
    const reader = new FileReader();
    reader.readAsDataURL(file as Blob);
    reader.onload = () => {
        settingsForm.logoUrl = reader.result as string;
        ElMessage.success('LOGO上传成功');
    };
};

// 提交设置
const submitSettings = () => {
    settingsFormRef.value?.validate((valid) => {
        if (valid) {
            // 实际项目中应调用API保存设置
            ElMessage.success('系统设置保存成功');
        }
    });
};

// 重置设置
const resetSettings = () => {
    settingsFormRef.value?.resetFields();
    // 重置地区选择
    regionTree.value?.setCheckedKeys([]);
};

// 初始化
onMounted(() => {
    // 设置已选择的配送区域
    // 模拟已选择的区域
    const selectedRegions = [11, 21, 31, 51];
    settingsForm.regions = selectedRegions;

    // 设置树选中状态
    setTimeout(() => {
        regionTree.value?.setCheckedKeys(selectedRegions);
    }, 100);
});
</script>

<style scoped lang="scss">
.system-settings {
    height: 100%;
    overflow: auto;

    .settings-form {
        max-width: 800px;
        margin: 0 auto;
        padding-bottom: 40px;

        h3 {
            font-weight: bold;
            margin: 20px 0 15px 0;
            padding-bottom: 10px;
            border-bottom: 1px solid #ebeef5;
        }

        .logo-uploader {
            width: 200px;

            .logo {
                width: 200px;
                height: 60px;
                display: block;
                object-fit: contain;
            }

            .logo-uploader-icon {
                font-size: 28px;
                color: #8c939d;
                width: 200px;
                height: 60px;
                border: 1px dashed #d9d9d9;
                border-radius: 4px;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            &:hover {
                .logo-uploader-icon {
                    border-color: #409eff;
                }
            }
        }

        .upload-tip {
            color: #909399;
            font-size: 12px;
            margin-top: 5px;
        }

        .unit-label {
            margin-left: 10px;
        }
    }

    .el-card {
        margin-bottom: 20px;
    }
}
</style>