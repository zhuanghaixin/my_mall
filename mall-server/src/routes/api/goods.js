/**
 * 商品相关API路由
 */
const express = require('express');
const router = express.Router();
const { Goods, Category } = require('../../models');
const { Op } = require('sequelize');

/**
 * @swagger
 * /api/goods/list:
 *   get:
 *     summary: 获取商品列表
 *     tags: [小程序接口]
 *     description: 获取商品列表，支持分页和筛选
 *     parameters:
 *       - name: page
 *         in: query
 *         description: 页码，默认1
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: 每页数量，默认10
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: category_id
 *         in: query
 *         description: 分类ID
 *         required: false
 *         schema:
 *           type: integer
 *       - name: keyword
 *         in: query
 *         description: 搜索关键词
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取商品列表
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
router.get('/list', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const categoryId = req.query.category_id;
        const keyword = req.query.keyword;

        // 构建查询条件
        const where = { status: 1 }; // 只查询上架商品

        if (categoryId) {
            where.category_id = categoryId;
        }

        if (keyword) {
            where.name = {
                [Op.like]: `%${keyword}%`
            };
        }

        // 查询商品总数
        const count = await Goods.count({ where });

        // 查询商品列表
        const items = await Goods.findAll({
            where,
            attributes: ['id', 'name', 'price', 'original_price', 'cover_image', 'sale_count', 'status'],
            order: [
                ['id', 'DESC']
            ],
            limit,
            offset
        });

        res.status(200).json({
            code: 200,
            message: '获取成功',
            data: {
                total: count,
                items
            }
        });
    } catch (error) {
        console.error('获取商品列表失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/goods/detail:
 *   get:
 *     summary: 获取商品详情
 *     tags: [小程序接口]
 *     description: 获取指定商品的详细信息
 *     parameters:
 *       - name: id
 *         in: query
 *         description: 商品ID
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功获取商品详情
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
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: 时尚连衣裙
 *                     price:
 *                       type: number
 *                       format: float
 *                       example: 199.00
 *                     original_price:
 *                       type: number
 *                       format: float
 *                       example: 299.00
 *                     stock:
 *                       type: integer
 *                       example: 100
 *                     sale_count:
 *                       type: integer
 *                       example: 50
 *                     main_image:
 *                       type: string
 *                       example: /uploads/goods/main.jpg
 *                     cover_image:
 *                       type: string
 *                       example: /uploads/goods/cover.jpg
 *                     images:
 *                       type: array
 *                       example: ["/uploads/goods/1.jpg", "/uploads/goods/2.jpg"]
 *                     description:
 *                       type: string
 *                       example: 这是一件漂亮的连衣裙
 *                     detail:
 *                       type: string
 *                       example: <p>详细的商品描述，支持HTML</p>
 *                     category:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         name:
 *                           type: string
 *                           example: 女装
 *       404:
 *         description: 商品不存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: 商品不存在
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
router.get('/detail', async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({
                code: 400,
                message: '商品ID不能为空'
            });
        }

        // 查询商品详情
        const goods = await Goods.findOne({
            where: { id, status: 1 } // 只查询上架商品
        });

        if (!goods) {
            return res.status(404).json({
                code: 404,
                message: '商品不存在或已下架'
            });
        }

        // 查询商品所属分类
        const category = await Category.findByPk(goods.category_id, {
            attributes: ['id', 'name']
        });

        // 处理商品图片，将字符串转为数组
        const images = goods.images ? goods.images.split(',') : [];

        // 构建返回数据
        const data = {
            ...goods.toJSON(),
            images,
            category
        };

        res.status(200).json({
            code: 200,
            message: '获取成功',
            data
        });
    } catch (error) {
        console.error('获取商品详情失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/goods/hot:
 *   get:
 *     summary: 获取热门商品
 *     tags: [小程序接口]
 *     description: 获取热门商品列表，根据销量排序
 *     parameters:
 *       - name: limit
 *         in: query
 *         description: 返回数量，默认10
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: 成功获取热门商品
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
 *                       name:
 *                         type: string
 *                         example: 时尚连衣裙
 *                       price:
 *                         type: number
 *                         format: float
 *                         example: 199.00
 *                       cover_image:
 *                         type: string
 *                         example: /uploads/goods/dress.jpg
 *                       sale_count:
 *                         type: integer
 *                         example: 100
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
router.get('/hot', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        // 查询热门商品
        const hotGoods = await Goods.findAll({
            where: { status: 1 }, // 只查询上架商品
            attributes: ['id', 'name', 'price', 'cover_image', 'sale_count'],
            order: [
                ['sale_count', 'DESC'],
                ['id', 'DESC']
            ],
            limit
        });

        res.status(200).json({
            code: 200,
            message: '获取成功',
            data: hotGoods
        });
    } catch (error) {
        console.error('获取热门商品失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
            error: error.message
        });
    }
});

module.exports = router; 