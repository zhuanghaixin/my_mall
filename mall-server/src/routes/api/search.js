/**
 * 搜索相关API路由
 */
const express = require('express');
const router = express.Router();
const searchController = require('../../controllers/searchController');

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: 搜索商品
 *     tags: [小程序接口]
 *     description: 根据关键词搜索商品
 *     parameters:
 *       - name: keyword
 *         in: query
 *         description: 搜索关键词
 *         required: true
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         description: 页码，默认1
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         description: 每页数量，默认10
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: sortType
 *         in: query
 *         description: 排序方式：0综合排序(默认)，1销量降序，2价格升序，3价格降序
 *         required: false
 *         schema:
 *           type: integer
 *           enum: [0, 1, 2, 3]
 *           default: 0
 *     responses:
 *       200:
 *         description: 成功获取搜索结果
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 搜索成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: 总记录数
 *                       example: 100
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: 时尚连衣裙
 *                           price:
 *                             type: number
 *                             format: float
 *                             example: 199.00
 *                           original_price:
 *                             type: number
 *                             format: float
 *                             example: 299.00
 *                           cover_image:
 *                             type: string
 *                             example: /uploads/goods/dress.jpg
 *                           main_image:
 *                             type: string
 *                             example: /uploads/goods/dress_main.jpg
 *                           sale_count:
 *                             type: integer
 *                             example: 100
 *                           status:
 *                             type: integer
 *                             example: 1
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: 服务器错误
 *                 error:
 *                   type: string
 *                   description: 错误详情
 */
router.get('/', searchController.searchGoods);

/**
 * @swagger
 * /api/search/hot:
 *   get:
 *     summary: 获取热门搜索词
 *     tags: [小程序接口]
 *     description: 获取系统热门搜索关键词
 *     parameters:
 *       - name: limit
 *         in: query
 *         description: 返回数量限制，默认10
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: 成功获取热门搜索词
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 获取成功
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       keyword:
 *                         type: string
 *                         example: 连衣裙
 *                       search_count:
 *                         type: integer
 *                         example: 1000
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: 服务器错误
 *                 error:
 *                   type: string
 *                   description: 错误详情
 */
router.get('/hot', searchController.getHotKeywords);

/**
 * @swagger
 * /api/search/history:
 *   get:
 *     summary: 获取用户搜索历史
 *     tags: [小程序接口]
 *     description: 获取当前用户的搜索历史记录
 *     parameters:
 *       - name: limit
 *         in: query
 *         description: 返回数量限制，默认10
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: x-user-openid
 *         in: header
 *         description: 用户openid，用于识别未登录用户
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取搜索历史
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 获取成功
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       keyword:
 *                         type: string
 *                         example: 连衣裙
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: 2023-06-01T12:00:00Z
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: 服务器错误
 *                 error:
 *                   type: string
 *                   description: 错误详情
 */
router.get('/history', searchController.getSearchHistory);

/**
 * @swagger
 * /api/search/clearHistory:
 *   delete:
 *     summary: 清除用户搜索历史
 *     tags: [小程序接口]
 *     description: 清除当前用户的所有搜索历史记录
 *     parameters:
 *       - name: x-user-openid
 *         in: header
 *         description: 用户openid，用于识别未登录用户
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功清除搜索历史
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 清除成功
 *                 data:
 *                   type: null
 *       400:
 *         description: 参数错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: 未能识别用户身份
 *                 data:
 *                   type: null
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: 服务器错误
 *                 error:
 *                   type: string
 *                   description: 错误详情
 */
router.delete('/clearHistory', searchController.clearSearchHistory);

module.exports = router; 