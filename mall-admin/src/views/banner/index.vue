<template>
    <div class="banner-container">
        <div class="header">
            <h2>轮播图管理</h2>
            <el-button type="primary" @click="handleAdd">
                <el-icon>
                    <Plus />
                </el-icon>新增轮播图
            </el-button>
        </div>

        <!-- 搜索区域 -->
        <el-card class="search-card">
            <el-form :inline="true" :model="searchForm" class="search-form">
                <el-form-item label="标题">
                    <el-input v-model="searchForm.title" placeholder="请输入轮播图标题" clearable />
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
                        <el-option label="启用" :value="1" />
                        <el-option label="禁用" :value="0" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSearch">查询</el-button>
                    <el-button @click="resetSearch">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <el-card class="list-card">
            <div class="table-container">
                <el-table v-loading="loading" :data="bannerList" border style="width: 100%">
                    <el-table-column prop="id" label="ID" width="80" />
                    <el-table-column prop="title" label="标题" width="150" />
                    <el-table-column label="图片" width="180">
                        <template #default="scope">
                            <el-image :src="scope.row.image" style="width: 100px; height: 60px" fit="cover"
                                :preview-src-list="[scope.row.image]" :preview-teleported="true" />
                        </template>
                    </el-table-column>
                    <el-table-column prop="url" label="链接" show-overflow-tooltip />
                    <el-table-column label="排序" width="140">
                        <template #default="scope">
                            <div class="sort-control">
                                <span class="sort-value">{{ scope.row.sort }}</span>
                                <div class="sort-buttons">
                                    <el-button size="small" text @click="handleSortChange(scope.row, 'up')">
                                        <el-icon>
                                            <ArrowUp />
                                        </el-icon>
                                    </el-button>
                                    <el-button size="small" text @click="handleSortChange(scope.row, 'down')">
                                        <el-icon>
                                            <ArrowDown />
                                        </el-icon>
                                    </el-button>
                                </div>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="状态" width="100">
                        <template #default="scope">
                            <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0"
                                @change="handleStatusChange(scope.row)" />
                        </template>
                    </el-table-column>
                    <el-table-column label="创建时间" width="180">
                        <template #default="scope">
                            {{ formatDate(scope.row.create_time) }}
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="200" fixed="right">
                        <template #default="scope">
                            <el-button type="success" size="small" @click="handlePreview(scope.row)">
                                预览
                            </el-button>
                            <el-button type="primary" link @click="handleEdit(scope.row)">
                                编辑
                            </el-button>
                            <el-button type="danger" link @click="handleDelete(scope.row)">
                                删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 分页 -->
                <div class="pagination-container">
                    <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize"
                        :page-sizes="[10, 20, 30, 50]" :total="pagination.total"
                        layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
                        @current-change="handleCurrentChange" />
                </div>
            </div>
        </el-card>

        <!-- 添加/编辑轮播图对话框 -->
        <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px" destroy-on-close>
            <el-form ref="bannerFormRef" :model="bannerForm" :rules="bannerRules" label-width="100px">
                <el-form-item label="标题" prop="title">
                    <el-input v-model="bannerForm.title" placeholder="请输入轮播图标题" />
                </el-form-item>
                <el-form-item label="图片" prop="image">
                    <el-upload class="banner-upload" action="/api/upload/image" :headers="uploadHeaders"
                        :on-success="handleUploadSuccess" :on-error="handleUploadError" :show-file-list="false">
                        <img v-if="bannerForm.image" :src="bannerForm.image" class="upload-image" />
                        <el-icon v-else class="upload-icon">
                            <Plus />
                        </el-icon>
                    </el-upload>
                    <div class="upload-tip">建议尺寸: 750px * 350px</div>
                </el-form-item>
                <el-form-item label="链接" prop="url">
                    <el-input v-model="bannerForm.url" placeholder="请输入跳转链接" />
                </el-form-item>
                <el-form-item label="排序" prop="sort">
                    <el-input-number v-model="bannerForm.sort" :min="0" :max="100" />
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-radio-group v-model="bannerForm.status">
                        <el-radio :label="1">启用</el-radio>
                        <el-radio :label="0">禁用</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
                    确定
                </el-button>
            </template>
        </el-dialog>

        <!-- 预览对话框 -->
        <el-dialog title="轮播图预览" v-model="previewVisible" width="700px">
            <div class="preview-container">
                <h3>{{ previewBanner.title }}</h3>
                <div class="preview-image-container">
                    <img :src="previewBanner.image" class="preview-image" />
                </div>
                <div class="preview-info">
                    <p><strong>链接:</strong> <a :href="previewBanner.url" target="_blank">{{ previewBanner.url }}</a></p>
                    <p><strong>排序:</strong> {{ previewBanner.sort }}</p>
                    <p><strong>状态:</strong> <el-tag :type="previewBanner.status === 1 ? 'success' : 'danger'">
                            {{ previewBanner.status === 1 ? '启用' : '禁用' }}
                        </el-tag></p>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus';
import { Plus, ArrowUp, ArrowDown } from '@element-plus/icons-vue';
import { getBannerList, addBanner, updateBanner, deleteBanner, updateBannerStatus, updateBannerSort, Banner } from '@/api/banner';
import { ApiResponse } from '@/api/request';

// 状态定义
const loading = ref(false);
const bannerList = ref<Banner[]>([]);
const dialogVisible = ref(false);
const dialogType = ref('add'); // 'add' 或 'edit'
const submitLoading = ref(false);
const bannerFormRef = ref<FormInstance>();
const previewVisible = ref(false);
const previewBanner = reactive<Banner>({
    title: '',
    image: '',
    url: '',
    sort: 0,
    status: 1
});

// 计算属性
const dialogTitle = computed(() => {
    return dialogType.value === 'add' ? '新增轮播图' : '编辑轮播图';
});

// 分页相关
const pagination = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0
});

// 搜索相关
const searchForm = reactive({
    title: '',
    status: undefined as number | undefined
});

// 表单相关
const bannerForm = reactive<Banner>({
    title: '',
    image: '',
    url: '',
    sort: 0,
    status: 1
});

const bannerRules = {
    title: [
        { required: true, message: '请输入轮播图标题', trigger: 'blur' },
        { max: 50, message: '标题长度不能超过50个字符', trigger: 'blur' }
    ],
    image: [
        { required: true, message: '请上传轮播图片', trigger: 'change' }
    ],
    url: [
        { required: true, message: '请输入跳转链接', trigger: 'blur' }
    ]
};

// 上传相关
const uploadHeaders = {
    Authorization: `Bearer ${localStorage.getItem('token')}`
};

// 生命周期
onMounted(() => {
    fetchBannerList();
});

// 方法定义
const fetchBannerList = async () => {
    loading.value = true;
    try {
        const params = {
            page: pagination.currentPage,
            pageSize: pagination.pageSize,
            ...searchForm.title ? { title: searchForm.title } : {},
            ...searchForm.status !== undefined ? { status: searchForm.status } : {}
        };

        const res = await getBannerList(params) as ApiResponse<{
            list: Banner[],
            total: number
        }>;

        if (res.code === 200) {
            bannerList.value = res.data.list || res.data;
            pagination.total = res.data.total || (Array.isArray(res.data) ? res.data.length : 0);
        } else {
            ElMessage.error(res.message || '获取轮播图列表失败');
        }
    } catch (error) {
        console.error('获取轮播图列表出错', error);
        ElMessage.error('获取轮播图列表出错');
    } finally {
        loading.value = false;
    }
};

const formatDate = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString();
};

const resetForm = () => {
    bannerForm.title = '';
    bannerForm.image = '';
    bannerForm.url = '';
    bannerForm.sort = 0;
    bannerForm.status = 1;

    if (bannerFormRef.value) {
        bannerFormRef.value.resetFields();
    }
};

const handleAdd = () => {
    dialogType.value = 'add';
    resetForm();
    dialogVisible.value = true;
};

const handleEdit = (row: Banner) => {
    dialogType.value = 'edit';
    Object.assign(bannerForm, row);
    dialogVisible.value = true;
};

const handleDelete = (row: Banner) => {
    ElMessageBox.confirm(
        '确定要删除该轮播图吗？',
        '提示',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(async () => {
        try {
            const res = await deleteBanner(row.id as number) as ApiResponse;
            if (res.code === 200) {
                ElMessage.success('删除成功');
                fetchBannerList();
            } else {
                ElMessage.error(res.message || '删除失败');
            }
        } catch (error) {
            console.error('删除轮播图出错', error);
            ElMessage.error('删除轮播图出错');
        }
    }).catch(() => { });
};

const handleStatusChange = async (row: Banner) => {
    try {
        const res = await updateBannerStatus(row.id as number, row.status) as ApiResponse;
        if (res.code === 200) {
            ElMessage.success('状态更新成功');
        } else {
            ElMessage.error(res.message || '状态更新失败');
            // 恢复原状态
            row.status = row.status === 1 ? 0 : 1;
        }
    } catch (error) {
        console.error('更新轮播图状态出错', error);
        ElMessage.error('更新轮播图状态出错');
        // 恢复原状态
        row.status = row.status === 1 ? 0 : 1;
    }
};

const handleSortChange = async (row: Banner, direction: 'up' | 'down') => {
    const newSort = direction === 'up' ? row.sort - 1 : row.sort + 1;
    if (newSort < 0) {
        ElMessage.warning('已经是最高排序');
        return;
    }

    try {
        const res = await updateBannerSort(row.id as number, newSort) as ApiResponse;
        if (res.code === 200) {
            ElMessage.success('排序更新成功');
            // 更新当前行数据
            row.sort = newSort;
            // 重新获取列表以反映顺序变化
            setTimeout(() => {
                fetchBannerList();
            }, 300);
        } else {
            ElMessage.error(res.message || '排序更新失败');
        }
    } catch (error) {
        console.error('更新轮播图排序出错', error);
        ElMessage.error('更新轮播图排序出错');
    }
};

const handleUploadSuccess = (response: ApiResponse) => {
    if (response.code === 200) {
        bannerForm.image = response.data.url;
    } else {
        ElMessage.error('图片上传失败');
    }
};

const handleUploadError = () => {
    ElMessage.error('图片上传失败');
};

const handleSubmit = async () => {
    bannerFormRef.value?.validate(async (valid) => {
        if (!valid) return;

        submitLoading.value = true;
        try {
            let res;
            if (dialogType.value === 'add') {
                res = await addBanner(bannerForm);
            } else {
                res = await updateBanner(bannerForm.id as number, bannerForm);
            }

            if (res.code === 200) {
                ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功');
                dialogVisible.value = false;
                fetchBannerList();
            } else {
                ElMessage.error(res.message || (dialogType.value === 'add' ? '添加失败' : '更新失败'));
            }
        } catch (error) {
            console.error(dialogType.value === 'add' ? '添加轮播图出错' : '更新轮播图出错', error);
            ElMessage.error(dialogType.value === 'add' ? '添加轮播图出错' : '更新轮播图出错');
        } finally {
            submitLoading.value = false;
        }
    });
};

// 分页事件处理
const handleSizeChange = (val: number) => {
    pagination.pageSize = val;
    pagination.currentPage = 1; // 重置到第一页
    fetchBannerList();
};

const handleCurrentChange = (val: number) => {
    pagination.currentPage = val;
    fetchBannerList();
};

// 搜索相关
const handleSearch = () => {
    pagination.currentPage = 1; // 重置到第一页
    fetchBannerList();
};

const resetSearch = () => {
    searchForm.title = '';
    searchForm.status = undefined;
    handleSearch();
};

// 预览
const handlePreview = (row: Banner) => {
    Object.assign(previewBanner, row);
    previewVisible.value = true;
};
</script>

<style scoped>
.banner-container {
    padding: 20px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.search-card {
    margin-bottom: 20px;
}

.search-form {
    display: flex;
    flex-wrap: wrap;
}

.list-card {
    margin-bottom: 20px;
}

.table-container {
    margin-bottom: 20px;
}

/* 确保图片预览弹窗在最高层级 */
:deep(.el-image-viewer__wrapper) {
    z-index: 2100 !important;
}

.banner-upload {
    display: flex;
    justify-content: center;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 200px;
    height: 100px;
}

.banner-upload:hover {
    border-color: #409eff;
}

.upload-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    line-height: 100px;
    text-align: center;
}

.upload-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.upload-tip {
    font-size: 12px;
    color: #999;
    margin-top: 5px;
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

.sort-control {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.sort-value {
    margin-right: 10px;
}

.sort-buttons {
    display: flex;
    flex-direction: column;
}

.preview-container {
    padding: 10px;
}

.preview-image-container {
    width: 100%;
    display: flex;
    justify-content: center;
    margin: 20px 0;
}

.preview-image {
    max-width: 100%;
    max-height: 300px;
    object-fit: contain;
}

.preview-info {
    margin-top: 20px;
    border-top: 1px solid #eee;
    padding-top: 10px;
}
</style>