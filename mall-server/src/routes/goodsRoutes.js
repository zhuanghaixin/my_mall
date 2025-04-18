/**
 * 商品相关路由
 * 
 * @swagger
 * tags:
 *   - name: 商品管理
 *     description: 商品相关的操作
 */
const express = require('express');
const goodsController = require('../controllers/goodsController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// 所有商品管理路由都需要管理员身份验证
router.use(protect);

// 获取商品列表
router.get('/list', goodsController.getGoodsList);

// 获取商品详情
router.get('/:id', goodsController.getGoodsDetail);

// 创建商品
router.post('/', goodsController.createGoods);

// 更新商品
router.put('/:id', goodsController.updateGoods);

// 删除商品
router.delete('/:id', goodsController.deleteGoods);

// 更新商品状态（上架/下架）
router.put('/:id/status', goodsController.updateGoodsStatus);

// 批量操作商品
router.post('/batch', goodsController.batchOperateGoods);

module.exports = router; 