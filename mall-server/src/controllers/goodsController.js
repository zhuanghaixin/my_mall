/**
 * 商品控制器
 * 处理商品相关的业务逻辑
 */
const { Op } = require('sequelize');
const { Goods, Category } = require('../models');
const catchAsync = require('../utils/catchAsync');
const { ValidationError, NotFoundError } = require('../utils/errorTypes');
const logger = require('../utils/logger');

/**
 * @swagger
 * components:
 *   schemas:
 *     Goods:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 商品ID
 *         category_id:
 *           type: integer
 *           description: 分类ID
 *         name:
 *           type: string
 *           description: 商品名称
 *         price:
 *           type: number
 *           format: float
 *           description: 商品价格
 *         original_price:
 *           type: number
 *           format: float
 *           description: 原价
 *         stock:
 *           type: integer
 *           description: 库存
 *         sales:
 *           type: integer
 *           description: 销量
 *         main_image:
 *           type: string
 *           description: 主图URL
 *         images:
 *           type: string
 *           description: 商品图片，多个图片用逗号分隔
 *         description:
 *           type: string
 *           description: 商品描述
 *         detail:
 *           type: string
 *           description: 商品详情
 *         status:
 *           type: integer
 *           description: 状态：0下架，1上架
 *         category:
 *           $ref: '#/components/schemas/Category'
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 * 
 *     GoodsListResponse:
 *       type: object
 *       properties:
 *         code:
 *           type: integer
 *           example: 200
 *         message:
 *           type: string
 *           example: 获取成功
 *         data:
 *           type: object
 *           properties:
 *             list:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Goods'
 *             total:
 *               type: integer
 *               description: 总记录数
 *             page:
 *               type: integer
 *               description: 当前页码
 *             pageSize:
 *               type: integer
 *               description: 每页条数
 *             totalPages:
 *               type: integer
 *               description: 总页数
 * 
 *     GoodsDetailResponse:
 *       type: object
 *       properties:
 *         code:
 *           type: integer
 *           example: 200
 *         message:
 *           type: string
 *           example: 获取成功
 *         data:
 *           $ref: '#/components/schemas/Goods'
 *
 *     GoodsCreateRequest:
 *       type: object
 *       required:
 *         - name
 *         - category_id
 *         - price
 *       properties:
 *         name:
 *           type: string
 *           description: 商品名称
 *         category_id:
 *           type: integer
 *           description: 分类ID
 *         price:
 *           type: number
 *           format: float
 *           description: 商品价格
 *         original_price:
 *           type: number
 *           format: float
 *           description: 原价
 *         stock:
 *           type: integer
 *           description: 库存
 *         main_image:
 *           type: string
 *           description: 主图URL
 *         images:
 *           type: string
 *           description: 商品图片，多个图片用逗号分隔
 *         description:
 *           type: string
 *           description: 商品描述
 *         detail:
 *           type: string
 *           description: 商品详情
 *         status:
 *           type: integer
 *           description: 状态：0下架，1上架
 *           default: 1
 *
 *     GoodsBatchOperateRequest:
 *       type: object
 *       required:
 *         - ids
 *         - operation
 *       properties:
 *         ids:
 *           type: array
 *           items:
 *             type: integer
 *           description: 商品ID数组
 *         operation:
 *           type: string
 *           enum: [delete, online, offline, recommend, unrecommend]
 *           description: 操作类型：删除、上架、下架、设为推荐、取消推荐
 *
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         code:
 *           type: integer
 *           example: 200
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           nullable: true
 */

/**
 * @swagger
 * /api/admin/goods/list:
 *   get:
 *     summary: 获取商品列表
 *     description: 获取商品列表，支持分页、搜索和筛选
 *     tags: [商品管理]
 *     parameters:
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
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 搜索关键词，模糊匹配商品名称
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         description: 分类ID
 *       - in: query
 *         name: parent_category_id
 *         schema:
 *           type: integer
 *         description: 父分类ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *         description: 商品状态，0下架，1上架
 *       - in: query
 *         name: is_recommend
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *         description: 推荐状态，0不推荐，1推荐
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取商品列表
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GoodsListResponse'
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
exports.getGoodsList = catchAsync(async (req, res) => {
    const {
        page = 1,
        pageSize = 10,
        keyword = '',
        category_id,
        parent_category_id,
        status,
        is_recommend
    } = req.query;

    // 构建查询条件
    const where = {};

    // 关键词搜索
    if (keyword) {
        where.name = { [Op.like]: `%${keyword}%` };
    }

    // 分类筛选
    if (category_id) {
        where.category_id = category_id;
    } else if (parent_category_id) {
        try {
            const subCategories = await Category.findAll({
                where: {
                    parent_id: parent_category_id,
                    status: 1
                },
                attributes: ['id']
            });

            if (subCategories.length > 0) {
                const subCategoryIds = subCategories.map(cat => cat.id);
                where.category_id = { [Op.in]: subCategoryIds };
            } else {
                where.category_id = parent_category_id;
            }
        } catch (error) {
            logger.error(`获取子分类失败: ${error.message}`);
        }
    }

    // 状态筛选
    if (status !== undefined && status !== '') {
        where.status = parseInt(status);
    }

    // 推荐状态筛选
    if (is_recommend !== undefined && is_recommend !== '') {
        where.is_recommend = parseInt(is_recommend);
    }

    // 查询商品总数
    const total = await Goods.count({ where });

    // 分页查询
    const goods = await Goods.findAll({
        where,
        include: [
            {
                model: Category,
                as: 'category',
                attributes: ['id', 'name'],
            }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(pageSize),
        offset: (parseInt(page) - 1) * parseInt(pageSize)
    });

    // 计算总页数
    const totalPages = Math.ceil(total / pageSize);

    res.status(200).json({
        code: 200,
        message: '获取成功',
        data: {
            list: goods,
            total,
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            totalPages
        }
    });
});

/**
 * @swagger
 * /api/admin/goods/{id}:
 *   get:
 *     summary: 获取商品详情
 *     description: 根据ID获取商品详细信息
 *     tags: [商品管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 商品ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取商品详情
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GoodsDetailResponse'
 *       401:
 *         description: 未授权
 *       404:
 *         description: 商品不存在
 *       500:
 *         description: 服务器错误
 */
exports.getGoodsDetail = catchAsync(async (req, res) => {
    const { id } = req.params;

    const goods = await Goods.findByPk(id, {
        include: [
            {
                model: Category,
                as: 'category',
                attributes: ['id', 'name'],
            }
        ]
    });

    if (!goods) {
        throw new NotFoundError('商品不存在');
    }

    res.status(200).json({
        code: 200,
        message: '获取成功',
        data: goods
    });
});

/**
 * @swagger
 * /api/admin/goods:
 *   post:
 *     summary: 创建商品
 *     description: 创建新商品
 *     tags: [商品管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GoodsCreateRequest'
 *     responses:
 *       201:
 *         description: 创建成功
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
 *                   example: 创建成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: 创建的商品ID
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
exports.createGoods = catchAsync(async (req, res) => {
    const {
        name,
        category_id,
        price,
        original_price,
        stock,
        main_image,
        cover_image,
        images,
        description,
        detail,
        is_recommend = 0,
        status = 1
    } = req.body;

    // 验证必要字段
    if (!name || !price || !category_id) {
        throw new ValidationError('商品名称、价格和分类ID必须提供');
    }

    // 创建商品
    const goods = await Goods.create({
        name,
        category_id,
        price,
        original_price,
        stock,
        main_image,
        cover_image,
        images,
        description,
        detail,
        is_recommend,
        status
    });

    logger.info(`商品创建成功: ${goods.id}`);

    res.status(201).json({
        code: 200,
        message: '创建成功',
        data: {
            id: goods.id
        }
    });
});

/**
 * @swagger
 * /api/admin/goods/{id}:
 *   put:
 *     summary: 更新商品
 *     description: 更新商品信息
 *     tags: [商品管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 商品ID
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GoodsCreateRequest'
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 商品不存在
 *       500:
 *         description: 服务器错误
 */
exports.updateGoods = catchAsync(async (req, res) => {
    const { id } = req.params;
    const {
        name,
        category_id,
        price,
        original_price,
        stock,
        main_image,
        cover_image,
        images,
        description,
        detail,
        is_recommend,
        status
    } = req.body;

    // 查找商品
    const goods = await Goods.findByPk(id);

    if (!goods) {
        throw new NotFoundError('商品不存在');
    }

    // 更新商品信息
    await goods.update({
        name,
        category_id,
        price,
        original_price,
        stock,
        main_image,
        cover_image,
        images,
        description,
        detail,
        is_recommend,
        status
    });

    logger.info(`商品更新成功: ${id}`);

    res.status(200).json({
        code: 200,
        message: '更新成功',
        data: null
    });
});

/**
 * @swagger
 * /api/admin/goods/{id}:
 *   delete:
 *     summary: 删除商品
 *     description: 根据ID删除商品
 *     tags: [商品管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 商品ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: 未授权
 *       404:
 *         description: 商品不存在
 *       500:
 *         description: 服务器错误
 */
exports.deleteGoods = catchAsync(async (req, res) => {
    const { id } = req.params;

    // 查找商品
    const goods = await Goods.findByPk(id);

    if (!goods) {
        throw new NotFoundError('商品不存在');
    }

    // 删除商品
    await goods.destroy();

    logger.info(`商品删除成功: ${id}`);

    res.status(200).json({
        code: 200,
        message: '删除成功',
        data: null
    });
});

/**
 * @swagger
 * /api/admin/goods/{id}/status:
 *   put:
 *     summary: 更新商品状态
 *     description: 上架或下架商品
 *     tags: [商品管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 商品ID
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: 商品状态，0下架，1上架
 *     responses:
 *       200:
 *         description: 状态更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 商品不存在
 *       500:
 *         description: 服务器错误
 */
exports.updateGoodsStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (status === undefined || ![0, 1].includes(parseInt(status))) {
        throw new ValidationError('状态值无效，应为0或1');
    }

    // 查找商品
    const goods = await Goods.findByPk(id);

    if (!goods) {
        throw new NotFoundError('商品不存在');
    }

    // 更新状态
    await goods.update({ status });

    logger.info(`商品状态更新成功: ${id}, 状态: ${status}`);

    res.status(200).json({
        code: 200,
        message: '状态更新成功',
        data: null
    });
});

/**
 * @swagger
 * /api/admin/goods/{id}/recommend:
 *   put:
 *     summary: 设置推荐商品
 *     description: 设置商品是否为推荐商品
 *     tags: [商品管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 商品ID
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - is_recommend
 *             properties:
 *               is_recommend:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: 推荐状态，0不推荐，1推荐
 *     responses:
 *       200:
 *         description: 推荐状态更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 商品不存在
 *       500:
 *         description: 服务器错误
 */
exports.updateGoodsRecommend = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { is_recommend } = req.body;

    if (is_recommend === undefined || ![0, 1].includes(parseInt(is_recommend))) {
        throw new ValidationError('推荐状态值无效，应为0或1');
    }

    // 查找商品
    const goods = await Goods.findByPk(id);

    if (!goods) {
        throw new NotFoundError('商品不存在');
    }

    // 更新推荐状态
    await goods.update({ is_recommend });

    logger.info(`商品推荐状态更新成功: ${id}, 推荐状态: ${is_recommend}`);

    res.status(200).json({
        code: 200,
        message: '推荐状态更新成功',
        data: null
    });
});

/**
 * @swagger
 * /api/admin/goods/batch:
 *   post:
 *     summary: 批量操作商品
 *     description: 批量删除、上架或下架商品
 *     tags: [商品管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GoodsBatchOperateRequest'
 *     responses:
 *       200:
 *         description: 操作成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
exports.batchOperateGoods = catchAsync(async (req, res) => {
    const { ids, operation } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new ValidationError('商品ID列表不能为空');
    }

    if (!operation || !['delete', 'online', 'offline', 'recommend', 'unrecommend'].includes(operation)) {
        throw new ValidationError('无效的操作类型，支持的操作：delete, online, offline, recommend, unrecommend');
    }

    let message = '';

    switch (operation) {
        case 'delete':
            // 批量删除
            await Goods.destroy({
                where: {
                    id: { [Op.in]: ids }
                }
            });
            message = '批量删除成功';
            break;

        case 'online':
            // 批量上架
            await Goods.update(
                { status: 1 },
                { where: { id: { [Op.in]: ids } } }
            );
            message = '批量上架成功';
            break;

        case 'offline':
            // 批量下架
            await Goods.update(
                { status: 0 },
                { where: { id: { [Op.in]: ids } } }
            );
            message = '批量下架成功';
            break;

        case 'recommend':
            // 批量设置为推荐
            await Goods.update(
                { is_recommend: 1 },
                { where: { id: { [Op.in]: ids } } }
            );
            message = '批量设为推荐成功';
            break;

        case 'unrecommend':
            // 批量取消推荐
            await Goods.update(
                { is_recommend: 0 },
                { where: { id: { [Op.in]: ids } } }
            );
            message = '批量取消推荐成功';
            break;
    }

    logger.info(`商品批量操作成功: ${operation}, 影响商品数: ${ids.length}`);

    res.status(200).json({
        code: 200,
        message,
        data: null
    });
}); 