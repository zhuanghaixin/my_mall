/**
 * 小程序分类相关API路由
 */
const express = require('express');
const router = express.Router();
const { Category, Goods } = require('../../models');
const { Op } = require('sequelize');

/**
 * @swagger
 * /api/category/tree:
 *   get:
 *     summary: 获取分类树结构
 *     tags: [小程序接口]
 *     description: 获取所有启用状态的分类树结构(包含一级分类和二级分类)
 *     responses:
 *       200:
 *         description: 成功获取分类树结构
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
 *                         example: 手机数码
 *                       icon:
 *                         type: string
 *                         example: /uploads/category/digital.png
 *                       level:
 *                         type: integer
 *                         example: 1
 *                       children:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 2
 *                             name:
 *                               type: string
 *                               example: 手机
 *                             icon:
 *                               type: string
 *                               example: /uploads/category/mobile.png
 *                             parent_id:
 *                               type: integer
 *                               example: 1
 *                             level:
 *                               type: integer
 *                               example: 2
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
router.get('/tree', async (req, res) => {
    try {
        // 获取所有启用状态的分类
        const categories = await Category.findAll({
            where: {
                status: 1 // 只获取启用状态的分类
            },
            order: [
                ['sort', 'ASC'], // 优先按排序字段升序
                ['id', 'ASC']    // 其次按ID升序
            ]
        });

        // 构建分类树结构
        const categoryTree = buildCategoryTree(categories);

        res.status(200).json({
            code: 200,
            message: '获取成功',
            data: categoryTree
        });
    } catch (error) {
        console.error('获取分类树结构失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/category/{id}/goods:
 *   get:
 *     summary: 获取分类下的商品列表
 *     tags: [小程序接口]
 *     description: 根据分类ID获取该分类下的商品列表，包括子分类下的商品
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 分类ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页条数
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
 *                     list:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: iPhone 13
 *                           price:
 *                             type: number
 *                             format: float
 *                             example: 5999.00
 *                           original_price:
 *                             type: number
 *                             format: float
 *                             example: 6799.00
 *                           main_image:
 *                             type: string
 *                             example: /uploads/goods/iphone13.jpg
 *                           sales:
 *                             type: integer
 *                             example: 1000
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 10
 *       404:
 *         description: 分类不存在
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
 *                   example: 分类不存在
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
router.get('/:id/goods', async (req, res) => {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;

        // 查询分类是否存在
        const category = await Category.findOne({
            where: {
                id,
                status: 1 // 只查询启用状态的分类
            }
        });

        if (!category) {
            return res.status(404).json({
                code: 404,
                message: '分类不存在',
                data: null
            });
        }

        // 获取分类及其子分类ID
        let categoryIds = [parseInt(id)];
        const childCategories = await Category.findAll({
            where: {
                parent_id: id,
                status: 1
            }
        });

        // 添加子分类ID
        if (childCategories.length > 0) {
            categoryIds = [...categoryIds, ...childCategories.map(item => item.id)];
        }

        // 查询商品总数
        const total = await Goods.count({
            where: {
                category_id: {
                    [Op.in]: categoryIds
                },
                status: 1 // 只查询上架商品
            }
        });

        // 分页查询商品列表
        const goods = await Goods.findAll({
            where: {
                category_id: {
                    [Op.in]: categoryIds
                },
                status: 1 // 只查询上架商品
            },
            attributes: ['id', 'name', 'price', 'original_price', 'main_image', 'sales'],
            order: [
                ['sale_count', 'DESC'], // 按销量降序
                ['id', 'DESC'] // 然后按ID降序
            ],
            offset: (page - 1) * pageSize,
            limit: pageSize
        });

        // 计算总页数
        const totalPages = Math.ceil(total / pageSize);

        res.status(200).json({
            code: 200,
            message: '获取成功',
            data: {
                list: goods,
                total,
                page,
                pageSize,
                totalPages
            }
        });
    } catch (error) {
        console.error('获取分类商品列表失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
            error: error.message
        });
    }
});

/**
 * 构建分类树形结构
 * @param {Array} categories - 所有分类数据
 * @param {Number} parentId - 父分类ID
 * @param {Number} level - 当前层级，顶级为0
 * @returns {Array} 树形结构的分类数据
 */
const buildCategoryTree = (categories, parentId = 0) => {
    const result = [];

    for (const category of categories) {
        if (category.parent_id === parentId) {
            // 递归构建子分类树
            const children = buildCategoryTree(categories, category.id);

            // 提取纯对象
            const plainCategory = category.get({ plain: true });

            const treeNode = {
                ...plainCategory,
                children: children.length > 0 ? children : undefined
            };

            result.push(treeNode);
        }
    }

    return result;
};

module.exports = router; 