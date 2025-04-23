/**
 * 购物车控制器
 * 处理购物车相关的业务逻辑
 */
const { Cart, Goods } = require('../models');
const { Op } = require('sequelize');
const catchAsync = require('../utils/catchAsync');
const { ValidationError, NotFoundError, BusinessError } = require('../utils/errorTypes');
const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../utils/jwtToken');
const config = require('../config');
const AppError = require('../utils/appError');

/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 购物车项ID
 *         goodsId:
 *           type: integer
 *           description: 商品ID
 *         count:
 *           type: integer
 *           description: 商品数量
 *         selected:
 *           type: boolean
 *           description: 是否选中
 *         goodsInfo:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *             description:
 *               type: string
 *             price:
 *               type: number
 *             main_image:
 *               type: string
 *             stock:
 *               type: integer
 */

/**
 * @swagger
 * /api/cart/list:
 *   get:
 *     summary: 获取购物车列表
 *     tags: [购物车]
 *     description: 获取当前用户的购物车列表
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取购物车列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 获取成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     cartList:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CartItem'
 *                     totalPrice:
 *                       type: number
 *                     totalCount:
 *                       type: integer
 *                     checkedTotalPrice:
 *                       type: number
 *                     checkedTotalCount:
 *                       type: integer
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
const getCartList = catchAsync(async (req, res) => {
    // 由于使用了protect中间件，用户信息已在req.user中
    const userInfo = req.user;

    // 查询购物车信息
    const cartList = await Cart.findAll({
        where: {
            user_id: userInfo.id,
            is_delete: false
        },
        include: [{
            model: Goods,
            as: 'goods',
            attributes: ['id', 'name', 'description', 'price', 'main_image', 'stock']
        }],
        order: [['add_time', 'DESC']]
    });

    // 计算总价和总数
    let totalPrice = 0;
    let totalCount = 0;
    let checkedTotalPrice = 0;
    let checkedTotalCount = 0;

    const formattedCartList = cartList.map(item => {
        const cartItem = {
            id: item.id,
            goodsId: item.goods_id,
            count: item.count,
            selected: item.selected,
            goodsInfo: item.goods
        };

        totalCount += item.count;
        totalPrice += item.count * (item.goods?.price || 0);

        if (item.selected) {
            checkedTotalCount += item.count;
            checkedTotalPrice += item.count * (item.goods?.price || 0);
        }

        return cartItem;
    });

    logger.info(`用户 ${userInfo.id} 获取购物车列表，共 ${cartList.length} 项`);

    res.status(200).json({
        success: true,
        code: 200,
        message: '获取成功',
        data: {
            cartList: formattedCartList,
            totalPrice,
            totalCount,
            checkedTotalPrice,
            checkedTotalCount
        }
    });
});

/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     summary: 添加商品到购物车
 *     tags: [购物车]
 *     description: 将商品添加到购物车，如已存在则增加数量
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - goodsId
 *             properties:
 *               goodsId:
 *                 type: integer
 *                 description: 商品ID
 *               count:
 *                 type: integer
 *                 description: 商品数量
 *                 default: 1
 *     responses:
 *       200:
 *         description: 添加成功
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
 *                   example: 添加成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     cartCount:
 *                       type: integer
 *                       description: 购物车总数量
 *       400:
 *         description: 参数错误
 *       404:
 *         description: 商品不存在
 *       500:
 *         description: 服务器错误
 */
const addToCart = catchAsync(async (req, res) => {
    // 由于使用了protect中间件，用户信息已在req.user中
    const userInfo = req.user;

    const { goodsId, count = 1 } = req.body;

    if (!goodsId) {
        throw new ValidationError('缺少商品ID');
    }

    // 检查商品是否存在
    const goodsInfo = await Goods.findByPk(goodsId);
    if (!goodsInfo) {
        throw new NotFoundError('商品不存在');
    }

    // 检查商品是否已下架
    console.log('goods', goodsInfo.status);
    if (goodsInfo.status !== 1) {
        return res.status(400).json({
            success: false,
            code: 400,
            message: '商品已下架'
        });
    }

    // 检查商品库存
    if (goodsInfo.stock < count) {
        return res.status(400).json({
            success: false,
            code: 400,
            message: '商品库存不足'
        });
    }

    // 检查购物车中是否已存在该商品
    let cartItem = await Cart.findOne({
        where: {
            user_id: userInfo.id,
            goods_id: goodsId,
            is_delete: false
        }
    });

    if (cartItem) {
        // 更新数量
        const newCount = cartItem.count + count;

        // 检查更新后的数量是否超过库存
        if (newCount > goodsInfo.stock) {
            return res.status(400).json({
                success: false,
                code: 400,
                message: '商品库存不足'
            });
        }

        await cartItem.update({
            count: newCount,
            update_time: Math.floor(Date.now() / 1000)
        });

        logger.info(`用户 ${userInfo.id} 更新购物车商品 ${goodsId} 数量为 ${newCount}`);
    } else {
        // 创建新的购物车项
        cartItem = await Cart.create({
            user_id: userInfo.id,
            goods_id: goodsId,
            count,
            selected: true,
            add_time: Math.floor(Date.now() / 1000),
            update_time: Math.floor(Date.now() / 1000)
        });

        logger.info(`用户 ${userInfo.id} 添加商品 ${goodsId} 到购物车，数量 ${count}`);
    }

    // 返回最新的购物车数量
    const cartCount = await Cart.sum('count', {
        where: {
            user_id: userInfo.id,
            is_delete: false
        }
    }) || 0;

    res.status(200).json({
        success: true,
        code: 200,
        message: '加入购物车成功',
        data: { cartCount }
    });
});

/**
 * @swagger
 * /api/cart/update:
 *   post:
 *     summary: 更新购物车
 *     tags: [购物车]
 *     description: 更新购物车中商品的数量或选中状态
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *                 description: 购物车项ID
 *               count:
 *                 type: integer
 *                 description: 商品数量
 *               selected:
 *                 type: boolean
 *                 description: 是否选中
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 更新成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     cartList:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CartItem'
 *                     totalPrice:
 *                       type: number
 *                     totalCount:
 *                       type: integer
 *                     checkedTotalPrice:
 *                       type: number
 *                     checkedTotalCount:
 *                       type: integer
 *       400:
 *         description: 参数错误
 *       404:
 *         description: 购物车项不存在
 *       500:
 *         description: 服务器错误
 */
const updateCart = catchAsync(async (req, res) => {
    // 由于使用了protect中间件，用户信息已在req.user中
    const userInfo = req.user;

    const { id, count, selected } = req.body;

    if (!id) {
        return res.status(400).json({
            success: false,
            code: 400,
            message: '缺少购物车项ID'
        });
    }

    // 查找购物车项
    const cartItem = await Cart.findOne({
        where: {
            id,
            user_id: userInfo.id,
            is_delete: false
        },
        include: [{
            model: Goods,
            as: 'goods'
        }]
    });

    if (!cartItem) {
        return res.status(404).json({
            success: false,
            code: 404,
            message: '购物车项不存在'
        });
    }

    // 更新数据
    const updateData = {
        update_time: Math.floor(Date.now() / 1000)
    };

    if (count !== undefined) {
        // 检查库存
        if (count > cartItem.goods.stock) {
            return res.status(400).json({
                success: false,
                code: 400,
                message: '商品库存不足'
            });
        }
        updateData.count = count;
    }

    if (selected !== undefined) {
        updateData.selected = selected;
    }

    await cartItem.update(updateData);

    logger.info(`用户 ${userInfo.id} 更新购物车项 ${id}`);

    // 获取最新的购物车统计信息
    const cartData = await getCartStatistics(userInfo.id);

    res.status(200).json({
        success: true,
        code: 200,
        message: '更新购物车成功',
        data: cartData
    });
});

/**
 * @swagger
 * /api/cart/delete:
 *   post:
 *     summary: 删除购物车项
 *     tags: [购物车]
 *     description: 从购物车中删除指定的商品
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 购物车项ID数组
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 删除成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     cartList:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CartItem'
 *                     totalPrice:
 *                       type: number
 *                     totalCount:
 *                       type: integer
 *                     checkedTotalPrice:
 *                       type: number
 *                     checkedTotalCount:
 *                       type: integer
 *       400:
 *         description: 参数错误
 *       500:
 *         description: 服务器错误
 */
const deleteCart = catchAsync(async (req, res) => {
    // 由于使用了protect中间件，用户信息已在req.user中
    const userInfo = req.user;

    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
            success: false,
            code: 400,
            message: '请选择要删除的购物车项'
        });
    }

    // 软删除购物车项
    await Cart.update(
        {
            is_delete: true,
            update_time: Math.floor(Date.now() / 1000)
        },
        {
            where: {
                id: { [Op.in]: ids },
                user_id: userInfo.id
            }
        }
    );

    logger.info(`用户 ${userInfo.id} 删除购物车项 ${ids.join(', ')}`);

    // 获取最新的购物车统计信息
    const cartData = await getCartStatistics(userInfo.id);

    res.status(200).json({
        success: true,
        code: 200,
        message: '删除购物车成功',
        data: cartData
    });
});

/**
 * @swagger
 * /api/cart/clear:
 *   post:
 *     summary: 清空购物车
 *     tags: [购物车]
 *     description: 清空用户的购物车
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 清空成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 清空成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     cartList:
 *                       type: array
 *                       items: {}
 *                     totalPrice:
 *                       type: number
 *                       example: 0
 *                     totalCount:
 *                       type: integer
 *                       example: 0
 *                     checkedTotalPrice:
 *                       type: number
 *                       example: 0
 *                     checkedTotalCount:
 *                       type: integer
 *                       example: 0
 *       500:
 *         description: 服务器错误
 */
const clearCart = catchAsync(async (req, res) => {
    // 由于使用了protect中间件，用户信息已在req.user中
    const userInfo = req.user;

    // 软删除所有购物车项
    await Cart.update(
        {
            is_delete: true,
            update_time: Math.floor(Date.now() / 1000)
        },
        {
            where: {
                user_id: userInfo.id,
                is_delete: false
            }
        }
    );

    logger.info(`用户 ${userInfo.id} 清空购物车`);

    res.status(200).json({
        success: true,
        code: 200,
        message: '清空购物车成功',
        data: {
            cartList: [],
            totalPrice: 0,
            totalCount: 0,
            checkedTotalPrice: 0,
            checkedTotalCount: 0
        }
    });
});

/**
 * @swagger
 * /api/cart/check:
 *   post:
 *     summary: 更新购物车商品选中状态
 *     tags: [购物车]
 *     description: 批量更新购物车中商品的选中状态
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isSelectAll
 *             properties:
 *               isSelectAll:
 *                 type: boolean
 *                 description: 是否全选
 *               goodsId:
 *                 type: integer
 *                 description: 商品ID(可选，指定则只更新该商品)
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 更新成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     cartList:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CartItem'
 *                     totalPrice:
 *                       type: number
 *                     totalCount:
 *                       type: integer
 *                     checkedTotalPrice:
 *                       type: number
 *                     checkedTotalCount:
 *                       type: integer
 *       500:
 *         description: 服务器错误
 */
const checkCart = catchAsync(async (req, res) => {
    // 由于使用了protect中间件，用户信息已在req.user中
    const userInfo = req.user;

    const { isSelectAll, goodsId } = req.body;

    // 更新条件
    const whereClause = {
        user_id: userInfo.id,
        is_delete: false
    };

    // 如果指定了商品ID，则只更新该商品
    if (goodsId) {
        whereClause.goods_id = goodsId;
    }

    // 更新选中状态
    await Cart.update(
        {
            selected: !!isSelectAll,
            update_time: Math.floor(Date.now() / 1000)
        },
        { where: whereClause }
    );

    logger.info(`用户 ${userInfo.id} 更新购物车选中状态: ${isSelectAll ? '全选' : '取消全选'}`);

    // 获取最新的购物车统计信息
    const cartData = await getCartStatistics(userInfo.id);

    res.status(200).json({
        success: true,
        code: 200,
        message: '更新选中状态成功',
        data: cartData
    });
});

/**
 * 获取购物车统计信息
 * @param {number} userId 用户ID
 * @returns {Object} 购物车统计信息
 */
const getCartStatistics = async (userId) => {
    // 查询购物车信息
    const cartList = await Cart.findAll({
        where: {
            user_id: userId,
            is_delete: false
        },
        include: [{
            model: Goods,
            as: 'goods',
            attributes: ['id', 'name', 'description', 'price', 'main_image', 'stock']
        }],
        order: [['add_time', 'DESC']]
    });

    // 计算总价和总数
    let totalPrice = 0;
    let totalCount = 0;
    let checkedTotalPrice = 0;
    let checkedTotalCount = 0;

    const formattedCartList = cartList.map(item => {
        const cartItem = {
            id: item.id,
            goodsId: item.goods_id,
            count: item.count,
            selected: item.selected,
            goodsInfo: item.goods
        };

        totalCount += item.count;
        totalPrice += item.count * (item.goods?.price || 0);

        if (item.selected) {
            checkedTotalCount += item.count;
            checkedTotalPrice += item.count * (item.goods?.price || 0);
        }

        return cartItem;
    });

    return {
        cartList: formattedCartList,
        totalPrice,
        totalCount,
        checkedTotalPrice,
        checkedTotalCount
    };
};

/**
 * @swagger
 * /api/cart/check-goods/{goodsId}:
 *   get:
 *     summary: 检查商品是否在购物车中
 *     tags: [购物车]
 *     description: 检查指定商品是否已在购物车中
 *     parameters:
 *       - in: path
 *         name: goodsId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 商品ID
 *     responses:
 *       200:
 *         description: 检查结果
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 获取成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     inCart:
 *                       type: boolean
 *                       description: 是否在购物车中
 *                     count:
 *                       type: integer
 *                       description: 购物车中的数量
 *       400:
 *         description: 参数错误
 *       500:
 *         description: 服务器错误
 */
const checkGoodsInCart = catchAsync(async (req, res) => {
    // 尝试从请求头中获取token并验证用户
    let userInfo = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.split(' ')[1];
            userInfo = verifyToken(token);
        } catch (err) {
            // Token验证失败，当作未登录处理
            logger.info('Token验证失败，视为未登录用户');
        }
    }

    // 如果未登录或token无效，返回商品不在购物车中
    if (!userInfo) {
        return res.status(200).json({
            success: true,
            code: 200,
            message: '未登录用户',
            data: {
                inCart: false,
                count: 0
            }
        });
    }

    const { goodsId } = req.params;

    if (!goodsId) {
        return res.status(400).json({
            success: false,
            code: 400,
            message: '缺少商品ID'
        });
    }

    // 查询购物车中是否存在该商品
    const cartItem = await Cart.findOne({
        where: {
            user_id: userInfo.id,
            goods_id: goodsId,
            is_delete: false
        }
    });

    logger.info(`用户 ${userInfo.id} 检查商品 ${goodsId} 是否在购物车: ${cartItem ? '是' : '否'}`);

    res.status(200).json({
        success: true,
        code: 200,
        message: '检查成功',
        data: {
            inCart: !!cartItem,
            count: cartItem ? cartItem.count : 0
        }
    });
});

/**
 * @swagger
 * /api/cart/count:
 *   get:
 *     summary: 获取购物车数量
 *     tags: [购物车]
 *     description: 获取当前用户购物车中的商品总数量
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 获取成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     cartCount:
 *                       type: integer
 *                       description: 购物车商品总数量
 *       500:
 *         description: 服务器错误
 */
const getCartCount = catchAsync(async (req, res) => {
    // 尝试从请求头中获取token并验证用户
    let userInfo = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.split(' ')[1];
            userInfo = verifyToken(token);
        } catch (err) {
            // Token验证失败，当作未登录处理
            logger.info('Token验证失败，视为未登录用户');
        }
    }

    // 如果未登录或token无效，返回购物车数量为0
    if (!userInfo) {
        return res.status(200).json({
            success: true,
            code: 200,
            message: '未登录用户',
            data: {
                cartCount: 0
            }
        });
    }

    // 查询购物车数量
    const cartCount = await Cart.sum('count', {
        where: {
            user_id: userInfo.id,
            is_delete: false
        }
    }) || 0;

    logger.info(`用户 ${userInfo.id} 获取购物车数量: ${cartCount}`);

    res.status(200).json({
        success: true,
        code: 200,
        message: '获取成功',
        data: {
            cartCount
        }
    });
});

/**
 * @swagger
 * /api/cart/checked:
 *   get:
 *     summary: 获取购物车中已选中的商品
 *     tags: [购物车]
 *     description: 获取当前用户购物车中已选中的商品列表
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取已选中商品列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
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
 *                       goodsId:
 *                         type: integer
 *                       quantity:
 *                         type: integer
 *                       goods:
 *                         type: object
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
const getCheckedCartGoods = catchAsync(async (req, res) => {
    // 由于使用了protect中间件，用户信息已在req.user中
    const userInfo = req.user;

    // 查询已选中的购物车商品
    const checkedCartItems = await Cart.findAll({
        where: {
            user_id: userInfo.id,
            selected: true,
            is_delete: false
        },
        include: [{
            model: Goods,
            as: 'goods',
            attributes: ['id', 'name', 'description', 'price', 'main_image', 'stock']
        }],
        order: [['add_time', 'DESC']]
    });

    // 格式化返回数据
    const formattedItems = checkedCartItems.map(item => ({
        id: item.id,
        goodsId: item.goods_id,
        quantity: item.count,
        goods: item.goods
    }));

    logger.info(`用户 ${userInfo.id} 获取已选中的购物车商品，共 ${formattedItems.length} 项`);

    res.status(200).json({
        success: true,
        code: 200,
        message: '获取成功',
        data: formattedItems
    });
});

module.exports = {
    getCartList,
    addToCart,
    updateCart,
    deleteCart,
    clearCart,
    checkCart,
    checkGoodsInCart,
    getCartCount,
    getCheckedCartGoods
}; 