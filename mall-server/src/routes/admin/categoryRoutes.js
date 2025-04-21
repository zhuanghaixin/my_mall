/**
 * 商品分类相关路由
 * 
 * @swagger
 * tags:
 *   - name: 分类管理
 *     description: 商品分类相关的操作
 */
const express = require('express');
const categoryController = require('../../controllers/categoryController');
const { protect } = require('../../middlewares/authMiddleware');

const router = express.Router();

// 所有分类管理路由都需要管理员身份验证
router.use(protect);

// 获取分类列表
router.get('/list', categoryController.getCategoryList);

// 获取分类详情
router.get('/:id', categoryController.getCategoryDetail);

// 创建分类
router.post('/', categoryController.createCategory);

// 更新分类
router.put('/:id', categoryController.updateCategory);

// 删除分类
router.delete('/:id', categoryController.deleteCategory);

// 更新分类状态
router.put('/:id/status', categoryController.updateCategoryStatus);

module.exports = router;
