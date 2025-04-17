<template>
    <div class="product-category">
        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                    <span>商品分类管理</span>
                    <el-button type="primary" size="small" @click="addCategory">新增分类</el-button>
                </div>
            </template>

            <el-table :data="categoryList" row-key="id" border default-expand-all
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
                <el-form-item label="父级分类" v-if="dialogType === 'add' && !categoryForm.parentId">
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
                <el-button type="primary" @click="submitCategory">确 定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'

// 分类数据接口
interface Category {
    id: number;
    name: string;
    parentId: number | null;
    level: number;
    sort: number;
    status: number;
    children?: Category[];
}

// 分类列表数据
const categoryList = ref<Category[]>([
    {
        id: 1,
        name: '服装',
        parentId: null,
        level: 0,
        sort: 1,
        status: 1,
        children: [
            {
                id: 3,
                name: '男装',
                parentId: 1,
                level: 1,
                sort: 1,
                status: 1,
                children: [
                    {
                        id: 7,
                        name: 'T恤',
                        parentId: 3,
                        level: 2,
                        sort: 1,
                        status: 1
                    },
                    {
                        id: 8,
                        name: '衬衫',
                        parentId: 3,
                        level: 2,
                        sort: 2,
                        status: 1
                    }
                ]
            },
            {
                id: 4,
                name: '女装',
                parentId: 1,
                level: 1,
                sort: 2,
                status: 1
            }
        ]
    },
    {
        id: 2,
        name: '电子产品',
        parentId: null,
        level: 0,
        sort: 2,
        status: 1,
        children: [
            {
                id: 5,
                name: '手机',
                parentId: 2,
                level: 1,
                sort: 1,
                status: 1
            },
            {
                id: 6,
                name: '电脑',
                parentId: 2,
                level: 1,
                sort: 2,
                status: 1
            }
        ]
    }
]);

// 对话框相关
const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const categoryFormRef = ref<FormInstance>();
const categoryForm = reactive<Partial<Category>>({
    name: '',
    parentId: null,
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
                level: item.level
            };

            if (item.children && item.level < 1) {
                newItem.children = filterOptions(item.children);
            }

            return newItem;
        });
    }

    return filterOptions(categoryList.value);
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

        const parentCategory = findParent(value[value.length - 1], categoryList.value);
        if (parentCategory) {
            categoryForm.parentId = parentCategory.id;
            categoryForm.level = parentCategory.level + 1;
        }
    } else {
        categoryForm.parentId = null;
        categoryForm.level = 0;
    }
};

// 添加分类
const addCategory = () => {
    resetForm();
    dialogType.value = 'add';
    categoryForm.parentId = null;
    categoryForm.level = 0;
    selectedParent.value = [];
    dialogVisible.value = true;
};

// 添加子分类
const addSubCategory = (row: Category) => {
    resetForm();
    dialogType.value = 'add';
    categoryForm.parentId = row.id;
    categoryForm.level = row.level + 1;
    selectedParent.value = [row.id];
    dialogVisible.value = true;
};

// 编辑分类
const editCategory = (row: Category) => {
    resetForm();
    dialogType.value = 'edit';
    Object.assign(categoryForm, row);
    dialogVisible.value = true;
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
    ).then(() => {
        // 模拟删除操作
        // 实际项目中应调用API删除
        removeCategory(row.id);
        ElMessage({
            type: 'success',
            message: '删除成功'
        });
    }).catch(() => {
        // 取消删除
    });
};

// 递归删除分类
const removeCategory = (id: number) => {
    const removeFromList = (list: Category[]) => {
        const index = list.findIndex(item => item.id === id);
        if (index !== -1) {
            list.splice(index, 1);
            return true;
        }

        for (let i = 0; i < list.length; i++) {
            if (list[i].children && list[i].children!.length > 0) {
                if (removeFromList(list[i].children!)) {
                    return true;
                }
            }
        }

        return false;
    };

    removeFromList(categoryList.value);
};

// 更新分类状态
const handleStatusChange = (row: Category) => {
    // 实际项目中应调用API更新状态
    ElMessage({
        type: 'success',
        message: `${row.name} 状态已${row.status === 1 ? '启用' : '禁用'}`
    });
};

// 提交分类表单
const submitCategory = () => {
    categoryFormRef.value?.validate((valid) => {
        if (valid) {
            if (dialogType.value === 'add') {
                // 模拟添加操作，生成新ID
                const newId = Math.max(...getAllIds(categoryList.value)) + 1;
                const newCategory: Category = {
                    id: newId,
                    name: categoryForm.name || '',
                    parentId: categoryForm.parentId || null,
                    level: categoryForm.level || 0,
                    sort: categoryForm.sort || 0,
                    status: categoryForm.status || 1
                };

                if (categoryForm.parentId === null) {
                    // 添加一级分类
                    categoryList.value.push(newCategory);
                } else {
                    // 添加子分类
                    addChildCategory(categoryList.value, categoryForm.parentId as number, newCategory);
                }

                ElMessage({
                    type: 'success',
                    message: '添加成功'
                });
            } else {
                // 模拟编辑操作
                updateCategory(categoryList.value, {
                    id: categoryForm.id as number,
                    name: categoryForm.name || '',
                    parentId: categoryForm.parentId || null,
                    level: categoryForm.level || 0,
                    sort: categoryForm.sort || 0,
                    status: categoryForm.status || 1
                });
                ElMessage({
                    type: 'success',
                    message: '更新成功'
                });
            }

            dialogVisible.value = false;
        }
    });
};

// 获取所有分类ID
const getAllIds = (categories: Category[]): number[] => {
    let ids: number[] = [];

    categories.forEach(category => {
        ids.push(category.id);
        if (category.children && category.children.length > 0) {
            ids = ids.concat(getAllIds(category.children));
        }
    });

    return ids;
};

// 添加子分类
const addChildCategory = (categories: Category[], parentId: number, newCategory: Category) => {
    for (const category of categories) {
        if (category.id === parentId) {
            if (!category.children) {
                category.children = [];
            }
            category.children.push(newCategory);
            return true;
        }

        if (category.children && category.children.length > 0) {
            if (addChildCategory(category.children, parentId, newCategory)) {
                return true;
            }
        }
    }

    return false;
};

// 更新分类
const updateCategory = (categories: Category[], updatedCategory: Category) => {
    for (let i = 0; i < categories.length; i++) {
        if (categories[i].id === updatedCategory.id) {
            categories[i].name = updatedCategory.name;
            categories[i].sort = updatedCategory.sort;
            categories[i].status = updatedCategory.status;
            return true;
        }

        if (categories[i].children && categories[i].children!.length > 0) {
            if (updateCategory(categories[i].children!, updatedCategory)) {
                return true;
            }
        }
    }

    return false;
};

// 重置表单
const resetForm = () => {
    // 重置表单数据
    Object.assign(categoryForm, {
        name: '',
        parentId: null,
        level: 0,
        sort: 0,
        status: 1
    });

    // 重置表单验证
    categoryFormRef.value?.resetFields();
};

// 页面加载时获取分类列表
onMounted(() => {
    // 实际项目中应调用API获取分类列表
    // 这里使用模拟数据
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