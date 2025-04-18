<template>
    <div class="product-category">
        <!-- 搜索区域 -->
        <el-card class="filter-container" style="margin-bottom: 20px">
            <el-form :inline="true" :model="queryParams">
                <el-form-item label="分类名称">
                    <el-input v-model="queryParams.keyword" placeholder="请输入分类名称" clearable></el-input>
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
                        <el-option :value="1" label="启用"></el-option>
                        <el-option :value="0" label="禁用"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSearch">搜索</el-button>
                    <el-button @click="resetQuery">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                    <span>商品分类管理</span>
                    <el-button type="primary" size="small" @click="addCategory">新增分类</el-button>
                </div>
            </template>

            <el-table v-loading="loading" :data="categoryList" row-key="id" border default-expand-all
                :tree-props="{ children: 'children' }">
                <el-table-column prop="name" label="分类名称" width="250"></el-table-column>
                <el-table-column prop="level" label="层级" width="100">
                    <template #default="scope">
                        <el-tag :type="levelTagType(scope.row.level)">{{ getLevelText(scope.row.level) }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="sort" label="排序" width="100"></el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                    <template #default="scope">
                        <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0"
                            @change="handleStatusChange(scope.row)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="220">
                    <template #default="scope">
                        <el-button size="small" type="primary" @click="editCategory(scope.row)">编辑</el-button>
                        <el-button size="small" type="success" v-if="scope.row.level < 2"
                            @click="addSubCategory(scope.row)">添加子分类</el-button>
                        <el-button size="small" type="danger" @click="deleteCategory(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 分类编辑对话框 -->
        <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增分类' : '编辑分类'" width="500px">
            <el-form :model="categoryForm" :rules="rules" ref="categoryFormRef" label-width="100px">
                <el-form-item label="分类名称" prop="name">
                    <el-input v-model="categoryForm.name" placeholder="请输入分类名称"></el-input>
                </el-form-item>
                <el-form-item label="父级分类" v-if="dialogType === 'add'">
                    <el-cascader v-model="selectedParent" :options="parentOptions"
                        :props="{ checkStrictly: true, value: 'id', label: 'name' }" clearable placeholder="请选择父级分类"
                        @change="handleParentChange"></el-cascader>
                </el-form-item>
                <el-form-item label="排序" prop="sort">
                    <el-input-number v-model="categoryForm.sort" :min="0" :max="100"></el-input-number>
                </el-form-item>
                <el-form-item label="状态">
                    <el-radio-group v-model="categoryForm.status">
                        <el-radio :label="1">启用</el-radio>
                        <el-radio :label="0">禁用</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitCategory" :loading="submitLoading">确 定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { getCategoryList, getCategoryDetail, createCategory, updateCategory as updateCategoryApi, deleteCategory as deleteCategoryApi, updateCategoryStatus } from '@/api/category'

// 分类数据接口
interface Category {
    id: number;
    name: string;
    parent_id: number;
    level?: number;
    sort: number;
    status: number;
    children?: Category[];
}

// 查询参数
const queryParams = reactive({
    keyword: '',
    status: undefined as undefined | number
});

// 分类列表数据
const categoryList = ref<Category[]>([]);
const allCategories = ref<Category[]>([]); // 存储所有分类，用于搜索筛选
const loading = ref(false);
const submitLoading = ref(false);

// 对话框相关
const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const categoryFormRef = ref<FormInstance>();
const categoryForm = reactive<Partial<Category>>({
    name: '',
    parent_id: 0,
    level: 0,
    sort: 0,
    status: 1
});
const selectedParent = ref<number[]>([]);

// 校验规则
const rules = {
    name: [
        { required: true, message: '请输入分类名称', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    sort: [
        { required: true, message: '请输入排序值', trigger: 'blur' }
    ]
};

// 父级分类选项
const parentOptions = computed(() => {
    // 只返回前两级分类作为可选父级
    function filterOptions(categories: Category[]) {
        return categories.map(item => {
            const newItem: any = {
                id: item.id,
                name: item.name,
                level: item.level || 0
            };

            if (item.children && item.level !== undefined && item.level < 1) {
                newItem.children = filterOptions(item.children);
            }

            return newItem;
        });
    }

    return filterOptions(allCategories.value);
});

// 获取层级文本
const getLevelText = (level: number) => {
    switch (level) {
        case 0: return '一级';
        case 1: return '二级';
        case 2: return '三级';
        default: return `${level + 1}级`;
    }
};

// 层级标签类型
const levelTagType = (level: number) => {
    switch (level) {
        case 0: return 'success';
        case 1: return 'warning';
        case 2: return 'info';
        default: return '';
    }
};

// 处理父级分类变化
const handleParentChange = (value: any) => {
    if (value && value.length > 0) {
        // 查找选中的父级分类
        const findParent = (id: number, categories: Category[]): Category | null => {
            for (const category of categories) {
                if (category.id === id) {
                    return category;
                }
                if (category.children) {
                    const found = findParent(id, category.children);
                    if (found) return found;
                }
            }
            return null;
        };

        const parentCategory = findParent(value[value.length - 1], allCategories.value);
        if (parentCategory) {
            categoryForm.parent_id = parentCategory.id;
            categoryForm.level = parentCategory.level ? parentCategory.level + 1 : 1;
        }
    } else {
        categoryForm.parent_id = 0;
        categoryForm.level = 0;
    }
};

// 搜索
const handleSearch = () => {
    applyFilters();
};

// 重置搜索条件
const resetQuery = () => {
    queryParams.keyword = '';
    queryParams.status = undefined;
    applyFilters();
};

// 应用筛选条件
const applyFilters = () => {
    // 深拷贝所有分类，保持原始数据不变
    const filterCategories = (categories: Category[]): Category[] => {
        const result: Category[] = [];

        for (const category of categories) {
            // 检查当前分类是否满足筛选条件
            const matchesKeyword = !queryParams.keyword ||
                category.name.toLowerCase().includes(queryParams.keyword.toLowerCase());
            const matchesStatus = queryParams.status === undefined ||
                category.status === queryParams.status;

            if (matchesKeyword && matchesStatus) {
                // 当前分类满足条件，复制一份添加到结果中
                const newCategory = { ...category };

                // 如果有子分类，递归过滤
                if (category.children && category.children.length > 0) {
                    const filteredChildren = filterCategories(category.children);
                    if (filteredChildren.length > 0) {
                        newCategory.children = filteredChildren;
                    } else {
                        newCategory.children = [];
                    }
                }

                result.push(newCategory);
            } else if (category.children && category.children.length > 0) {
                // 当前分类不满足条件，但其子分类可能满足
                const filteredChildren = filterCategories(category.children);
                if (filteredChildren.length > 0) {
                    // 如果子分类中有满足条件的，也将当前分类加入结果
                    result.push({
                        ...category,
                        children: filteredChildren
                    });
                }
            }
        }

        return result;
    };

    if (!queryParams.keyword && queryParams.status === undefined) {
        // 如果没有筛选条件，直接显示所有分类
        categoryList.value = JSON.parse(JSON.stringify(allCategories.value));
    } else {
        // 应用筛选
        categoryList.value = filterCategories(JSON.parse(JSON.stringify(allCategories.value)));
    }
};

// 添加分类
const addCategory = () => {
    resetForm();
    dialogType.value = 'add';
    categoryForm.parent_id = 0;
    categoryForm.level = 0;
    selectedParent.value = [];
    dialogVisible.value = true;
};

// 添加子分类
const addSubCategory = (row: Category) => {
    resetForm();
    dialogType.value = 'add';
    categoryForm.parent_id = row.id;
    categoryForm.level = row.level ? row.level + 1 : 1;
    selectedParent.value = [row.id];
    dialogVisible.value = true;
};

// 编辑分类
const editCategory = async (row: Category) => {
    resetForm();
    dialogType.value = 'edit';
    loading.value = true;
    try {
        const res = await getCategoryDetail(row.id);
        if (res && res.data) {
            Object.assign(categoryForm, res.data);
            dialogVisible.value = true;
        }
    } catch (error) {
        ElMessage.error('获取分类详情失败');
        console.error('获取分类详情失败:', error);
    } finally {
        loading.value = false;
    }
};

// 删除分类
const deleteCategory = (row: Category) => {
    ElMessageBox.confirm(
        `确定要删除分类 "${row.name}" 吗？${row.children && row.children.length > 0 ? '该操作将连同子分类一起删除！' : ''}`,
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(async () => {
        loading.value = true;
        try {
            await deleteCategoryApi(row.id);
            ElMessage({
                type: 'success',
                message: '删除成功'
            });
            // 重新加载分类列表
            fetchCategoryList();
        } catch (error) {
            ElMessage.error('删除失败');
            console.error('删除失败:', error);
        } finally {
            loading.value = false;
        }
    }).catch(() => {
        // 取消删除
    });
};

// 更新分类状态
const handleStatusChange = async (row: Category) => {
    loading.value = true;
    try {
        await updateCategoryStatus(row.id, row.status);
        ElMessage({
            type: 'success',
            message: `${row.name} 状态已${row.status === 1 ? '启用' : '禁用'}`
        });
        // 状态更新成功后重新获取列表，确保数据一致性
        await fetchCategoryList();
    } catch (error) {
        // 恢复之前的状态
        row.status = row.status === 1 ? 0 : 1;
        ElMessage.error('状态更新失败');
        console.error('状态更新失败:', error);
    } finally {
        loading.value = false;
    }
};

// 提交分类表单
const submitCategory = () => {
    categoryFormRef.value?.validate(async (valid) => {
        if (valid) {
            submitLoading.value = true;
            try {
                if (dialogType.value === 'add') {
                    // 调用添加API
                    await createCategory({
                        name: categoryForm.name || '',
                        parent_id: categoryForm.parent_id || 0,
                        sort: categoryForm.sort || 0,
                        status: categoryForm.status || 1
                    });

                    ElMessage({
                        type: 'success',
                        message: '添加成功'
                    });
                } else {
                    // 调用更新API
                    if (!categoryForm.id) {
                        ElMessage.error('缺少分类ID');
                        return;
                    }

                    await updateCategoryApi(categoryForm.id, {
                        name: categoryForm.name,
                        parent_id: categoryForm.parent_id || 0,
                        sort: categoryForm.sort,
                        status: categoryForm.status
                    });

                    ElMessage({
                        type: 'success',
                        message: '更新成功'
                    });
                }

                // 关闭对话框并刷新列表
                dialogVisible.value = false;
                await fetchCategoryList(); // 等待获取最新数据
            } catch (error) {
                ElMessage.error(dialogType.value === 'add' ? '添加失败' : '更新失败');
                console.error(`${dialogType.value === 'add' ? '添加' : '更新'}失败:`, error);
            } finally {
                submitLoading.value = false;
            }
        }
    });
};

// 重置表单
const resetForm = () => {
    // 重置表单数据
    Object.assign(categoryForm, {
        id: undefined,
        name: '',
        parent_id: 0,
        level: 0,
        sort: 0,
        status: 1
    });

    // 重置表单验证
    categoryFormRef.value?.resetFields();
};

// 获取分类列表
const fetchCategoryList = async () => {
    loading.value = true;
    try {
        const res = await getCategoryList();
        if (res && res.data) {
            // 存储所有分类用于筛选和父级分类选择
            allCategories.value = res.data;
            // 应用当前的筛选条件
            applyFilters();
        }
    } catch (error) {
        ElMessage.error('获取分类列表失败');
        console.error('获取分类列表失败:', error);
    } finally {
        loading.value = false;
    }
};

// 页面加载时获取分类列表
onMounted(() => {
    fetchCategoryList();
});
</script>

<style scoped lang="scss">
.product-category {
    height: 100%;
    overflow: auto;

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .filter-container {
        margin-bottom: 20px;
    }

    .el-tag {
        margin-right: 10px;
    }

    .el-card {
        margin-bottom: 20px;
    }

    .el-table {
        max-width: 100%;
        overflow-x: auto;
    }
}
</style>