/**
 * 首页相关API路由
 */
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/home/data:
 *   get:
 *     summary: 获取首页全部数据
 *     tags: [小程序接口]
 *     description: 获取首页所有数据，包括轮播图、推荐商品、分类等
 *     responses:
 *       200:
 *         description: 成功获取首页数据
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
 *                     banners:
 *                       type: array
 *                       description: 轮播图列表
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           title:
 *                             type: string
 *                             example: 夏季新品上市
 *                           image:
 *                             type: string
 *                             example: /uploads/banners/summer.jpg
 *                           url:
 *                             type: string
 *                             example: /pages/goods/list?categoryId=1
 *                     recommendGoods:
 *                       type: array
 *                       description: 推荐商品列表
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
 *                           cover_image:
 *                             type: string
 *                             example: /uploads/goods/dress.jpg
 *                           sale_count:
 *                             type: integer
 *                             example: 100
 *                     categories:
 *                       type: array
 *                       description: 分类列表
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: 女装
 *                           icon:
 *                             type: string
 *                             example: /uploads/categories/womens.png
 *                           goods:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                   example: 1
 *                                 name:
 *                                   type: string
 *                                   example: 时尚连衣裙
 *                                 price:
 *                                   type: number
 *                                   format: float
 *                                   example: 199.00
 *                                 cover_image:
 *                                   type: string
 *                                   example: /uploads/goods/dress.jpg
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
router.get('/data', async (req, res) => {
    try {
        const { Banner, Category, Goods } = require('../../models');
        const { Op } = require('sequelize');

        // 获取轮播图数据
        const banners = await Banner.findAll({
            where: { status: 1 },
            order: [
                ['sort', 'ASC'],
                ['id', 'DESC']
            ]
        });

        // 获取推荐商品数据
        const recommendGoods = await Goods.findAll({
            where: {
                status: 1,
                is_recommend: 1
            },
            order: [
                ['sale_count', 'DESC'],
                ['id', 'DESC']
            ],
            limit: 10
        });

        // 获取分类和分类下的商品
        const categories = await Category.findAll({
            where: {
                status: 1,
                level: 1 // 只获取一级分类
            },
            order: [
                ['sort', 'ASC'],
                ['id', 'ASC']
            ],
            limit: 10 // 限制最多返回10个分类
        });

        // 为每个分类获取其下的商品
        const categoriesWithGoods = await Promise.all(
            categories.map(async (category) => {
                const goods = await Goods.findAll({
                    where: {
                        status: 1,
                        category_id: category.id
                    },
                    order: [
                        ['sale_count', 'DESC']
                    ],
                    limit: 6 // 每个分类下最多返回6个商品
                });

                return {
                    id: category.id,
                    name: category.name,
                    icon: category.icon,
                    goods: goods
                };
            })
        );

        res.status(200).json({
            code: 200,
            message: '获取成功',
            data: {
                banners,
                recommendGoods,
                categories: categoriesWithGoods
            }
        });
    } catch (error) {
        console.error('获取首页数据失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/home/recommend:
 *   get:
 *     summary: 获取推荐商品
 *     tags: [小程序接口]
 *     description: 获取首页推荐商品列表
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 返回数量限制
 *     responses:
 *       200:
 *         description: 成功获取推荐商品
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
 */
router.get('/recommend', async (req, res) => {
    try {
        const { Goods } = require('../../models');
        const limit = parseInt(req.query.limit) || 10;

        const recommendGoods = await Goods.findAll({
            where: {
                status: 1,
                is_recommend: 1
            },
            order: [
                ['sale_count', 'DESC'],
                ['id', 'DESC']
            ],
            limit
        });

        res.status(200).json({
            code: 200,
            message: '获取成功',
            data: recommendGoods
        });
    } catch (error) {
        console.error('获取推荐商品失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/home/categories:
 *   get:
 *     summary: 获取首页分类及商品
 *     tags: [小程序接口]
 *     description: 获取首页显示的分类及其下的商品
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 返回分类数量限制
 *       - in: query
 *         name: goodsLimit
 *         schema:
 *           type: integer
 *           default: 6
 *         description: 每个分类下返回的商品数量限制
 *     responses:
 *       200:
 *         description: 成功获取分类数据
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
 *                         example: 女装
 *                       icon:
 *                         type: string
 *                         example: /uploads/categories/womens.png
 *                       goods:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 1
 *                             name:
 *                               type: string
 *                               example: 时尚连衣裙
 *                             price:
 *                               type: number
 *                               format: float
 *                               example: 199.00
 *                             cover_image:
 *                               type: string
 *                               example: /uploads/goods/dress.jpg
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
 */
router.get('/categories', async (req, res) => {
    try {
        const { Category, Goods } = require('../../models');
        const limit = parseInt(req.query.limit) || 10;
        const goodsLimit = parseInt(req.query.goodsLimit) || 6;

        // 获取分类列表
        const categories = await Category.findAll({
            where: {
                status: 1,
                level: 1 // 只获取一级分类
            },
            order: [
                ['sort', 'ASC'],
                ['id', 'ASC']
            ],
            limit
        });

        // 为每个分类获取其下的商品
        const categoriesWithGoods = await Promise.all(
            categories.map(async (category) => {
                const goods = await Goods.findAll({
                    where: {
                        status: 1,
                        category_id: category.id
                    },
                    order: [
                        ['sale_count', 'DESC']
                    ],
                    limit: goodsLimit
                });

                return {
                    id: category.id,
                    name: category.name,
                    icon: category.icon,
                    goods: goods
                };
            })
        );

        res.status(200).json({
            code: 200,
            message: '获取成功',
            data: categoriesWithGoods
        });
    } catch (error) {
        console.error('获取分类数据失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
            error: error.message
        });
    }
});

module.exports = router; 