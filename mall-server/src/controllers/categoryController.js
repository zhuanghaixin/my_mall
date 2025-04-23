/**
 * 商品分类控制器
 * 处理商品分类相关的业务逻辑
 */
const { Op } = require('sequelize');
const sequelize = require('../db'); // 直接导入sequelize实例
const { Category } = require('../models');
const catchAsync = require('../utils/catchAsync');
const { ValidationError, NotFoundError } = require('../utils/errorTypes');
const logger = require('../utils/logger');

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 分类ID
 *         parent_id:
 *           type: integer
 *           description: 父分类ID，0表示顶级分类
 *         name:
 *           type: string
 *           description: 分类名称
 *         icon:
 *           type: string
 *           description: 分类图标URL
 *         sort:
 *           type: integer
 *           description: 排序值
 *         status:
 *           type: integer
 *           description: 状态：0禁用，1正常
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *         children:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Category'
 *           description: 子分类列表
 *
 *     CategoryListResponse:
 *       type: object
 *       properties:
 *         code:
 *           type: integer
 *           example: 200
 *         message:
 *           type: string
 *           example: 获取成功
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Category'
 *
 *     CategoryDetailResponse:
 *       type: object
 *       properties:
 *         code:
 *           type: integer
 *           example: 200
 *         message:
 *           type: string
 *           example: 获取成功
 *         data:
 *           $ref: '#/components/schemas/Category'
 *
 *     CategoryCreateRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: 分类名称
 *         parent_id:
 *           type: integer
 *           description: 父分类ID，0表示顶级分类
 *           default: 0
 *         icon:
 *           type: string
 *           description: 分类图标URL
 *         sort:
 *           type: integer
 *           description: 排序值
 *           default: 0
 *         status:
 *           type: integer
 *           description: 状态：0禁用，1正常
 *           default: 1
 */

/**
 * @swagger
 * /api/admin/category/list:
 *   get:
 *     summary: 获取分类列表
 *     description: 获取所有分类列表，返回树形结构，支持按名称和状态筛选
 *     tags: [分类管理]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 搜索关键词，模糊匹配分类名称
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *         description: 分类状态，0禁用，1启用
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取分类列表
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryListResponse'
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
exports.getCategoryList = catchAsync(async (req, res) => {
    // 获取查询参数
    const { keyword, status } = req.query;

    // 构建查询条件
    const where = {};

    // 关键词搜索
    if (keyword) {
        where.name = { [Op.like]: `%${keyword}%` };
    }

    // 状态筛选
    if (status !== undefined) {
        where.status = parseInt(status);
    }

    // 获取所有分类
    // 使用 Sequelize 的 findAll 方法查询分类数据
    // where: 包含查询条件(关键词搜索和状态筛选)
    // order: 指定排序规则
    //   - 首先按 sort 字段升序排序(ASC)
    //   - 当 sort 相同时按 id 升序排序(ASC)
    const categories = await Category.findAll({
        where,
        order: [
            ['sort', 'ASC'],  // 优先按排序字段升序
            ['id', 'ASC']     // 其次按ID升序  
        ]
    });

    // 构建分类树形结构
    const categoryTree = buildCategoryTree(categories);

    res.status(200).json({
        code: 200,
        message: '获取成功',
        data: categoryTree
    });
});

/**
 * @swagger
 * /api/admin/category/{id}:
 *   get:
 *     summary: 获取分类详情
 *     description: 根据ID获取分类详细信息
 *     tags: [分类管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 分类ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取分类详情
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryDetailResponse'
 *       401:
 *         description: 未授权
 *       404:
 *         description: 分类不存在
 *       500:
 *         description: 服务器错误
 */
exports.getCategoryDetail = catchAsync(async (req, res) => {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
        throw new NotFoundError('分类不存在');
    }

    res.status(200).json({
        code: 200,
        message: '获取成功',
        data: category
    });
});

/**
 * @swagger
 * /api/admin/category:
 *   post:
 *     summary: 创建分类
 *     description: 创建新分类
 *     tags: [分类管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryCreateRequest'
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
 *                       description: 创建的分类ID
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
exports.createCategory = catchAsync(async (req, res) => {
    const {
        name,
        parent_id = 0,
        icon,
        sort = 0,
        status = 1
    } = req.body;

    // 验证必要字段
    if (!name) {
        throw new ValidationError('分类名称必须提供');
    }

    // 创建分类
    const category = await Category.create({
        name,
        parent_id,
        icon,
        sort,
        status
    });

    logger.info(`分类创建成功: ${category.id}`);

    res.status(201).json({
        code: 200,
        message: '创建成功',
        data: {
            id: category.id
        }
    });
});

/**
 * @swagger
 * /api/admin/category/{id}:
 *   put:
 *     summary: 更新分类
 *     description: 更新分类信息
 *     tags: [分类管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 分类ID
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryCreateRequest'
 *     responses:
 *       200:
 *         description: 更新成功
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
 *                 data:
 *                   type: object
 *                   nullable: true
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 分类不存在
 *       500:
 *         description: 服务器错误
 */
exports.updateCategory = catchAsync(async (req, res) => {
    const { id } = req.params;
    const {
        name,
        parent_id,
        icon,
        sort,
        status
    } = req.body;

    // 查找分类
    const category = await Category.findByPk(id);

    if (!category) {
        throw new NotFoundError('分类不存在');
    }

    // 禁止将分类的父级设置为自己
    if (parent_id && parseInt(parent_id) === parseInt(id)) {
        throw new ValidationError('父级分类不能设置为自己');
    }

    // 更新分类信息
    await category.update({
        name,
        parent_id,
        icon,
        sort,
        status
    });

    logger.info(`分类更新成功: ${id}`);

    res.status(200).json({
        code: 200,
        message: '更新成功',
        data: null
    });
});

/**
 * @swagger
 * /api/admin/category/{id}:
 *   delete:
 *     summary: 删除分类
 *     description: 根据ID删除分类及其所有子分类
 *     tags: [分类管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 分类ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 删除成功
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
 *                 data:
 *                   type: object
 *                   nullable: true
 *       401:
 *         description: 未授权
 *       404:
 *         description: 分类不存在
 *       500:
 *         description: 服务器错误
 */
exports.deleteCategory = catchAsync(async (req, res) => {
    const { id } = req.params;

    // 查找分类
    const category = await Category.findByPk(id);

    if (!category) {
        throw new NotFoundError('分类不存在');
    }

    // 查找所有子分类ID（包括孙子分类）
    const allChildIds = await findAllChildCategoryIds(id);

    // 执行事务，确保所有删除操作要么全部成功，要么全部失败
    await sequelize.transaction(async (t) => {
        // 先删除所有子分类
        if (allChildIds.length > 0) {
            await Category.destroy({
                where: {
                    id: {
                        [Op.in]: allChildIds
                    }
                },
                transaction: t
            });

            logger.info(`删除了 ${allChildIds.length} 个子分类`);
        }

        // 最后删除自身
        await category.destroy({ transaction: t });
    });

    logger.info(`分类及其子分类删除成功: ${id}`);

    res.status(200).json({
        code: 200,
        message: '删除成功',
        data: null
    });
});

/**
 * 递归查找所有子分类ID
 * @param {Number} parentId - 父分类ID
 * @returns {Promise<Array>} 所有子分类ID数组
 */
const findAllChildCategoryIds = async (parentId) => {
    // 查找直接子分类
    const children = await Category.findAll({
        where: { parent_id: parentId },
        attributes: ['id']
    });

    const childIds = children.map(child => child.id);

    // 递归查找每个子分类的子分类
    const grandChildPromises = childIds.map(childId => findAllChildCategoryIds(childId));
    const grandChildIdsArrays = await Promise.all(grandChildPromises);

    // 合并所有子分类ID（扁平化）
    const allGrandChildIds = grandChildIdsArrays.flatMap(ids => ids);

    // 返回所有子分类ID（包括直接子分类和所有后代）
    return [...childIds, ...allGrandChildIds];
};

/**
 * @swagger
 * /api/admin/category/{id}/status:
 *   put:
 *     summary: 更新分类状态
 *     description: 启用或禁用分类
 *     tags: [分类管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 分类ID
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
 *                 description: 分类状态，0禁用，1正常
 *     responses:
 *       200:
 *         description: 状态更新成功
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
 *                 data:
 *                   type: object
 *                   nullable: true
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 分类不存在
 *       500:
 *         description: 服务器错误
 */
exports.updateCategoryStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (status === undefined || ![0, 1].includes(parseInt(status))) {
        throw new ValidationError('状态值无效，应为0或1');
    }

    // 查找分类
    const category = await Category.findByPk(id);

    if (!category) {
        throw new NotFoundError('分类不存在');
    }

    // 更新状态
    await category.update({ status });

    logger.info(`分类状态更新成功: ${id}, 状态: ${status}`);

    res.status(200).json({
        code: 200,
        message: '状态更新成功',
        data: null
    });
});

/**
 * 构建分类树形结构
 * @param {Array} categories - 所有分类数据
 * @param {Number} parentId - 父分类ID
 * @param {Number} level - 当前层级，顶级为0
 * @returns {Array} 树形结构的分类数据
 */
const buildCategoryTree = (categories, parentId = 0, level = 0) => {
    const result = [];

    for (const category of categories) {
        if (category.parent_id === parentId) {
            // 递归构建子分类树，层级+1
            const children = buildCategoryTree(categories, category.id, level + 1);

            // 提取纯对象并添加正确的层级信息
            const plainCategory = category.get({ plain: true });

            const treeNode = {
                ...plainCategory,
                level: level, // 确保存在层级信息
                children: children.length > 0 ? children : undefined
            };

            result.push(treeNode);
        }
    }

    return result;
};

/**
 * @swagger
 * /api/admin/category/sub/{parentId}:
 *   get:
 *     summary: 获取子分类列表
 *     description: 获取指定父分类下的所有子分类
 *     tags: [分类管理]
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 父分类ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取子分类列表
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
 *                     $ref: '#/components/schemas/Category'
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
exports.getSubCategories = catchAsync(async (req, res) => {
    const { parentId } = req.params;

    // 验证父分类ID是否有效
    if (!parentId || isNaN(parseInt(parentId))) {
        return res.status(400).json({
            success: false,
            code: 400,
            message: '无效的父分类ID'
        });
    }

    // 查询指定父分类ID下的所有子分类
    const subCategories = await Category.findAll({
        where: {
            parent_id: parseInt(parentId),
            status: 1 // 只获取状态为启用的分类
        },
        order: [
            ['sort', 'ASC'], // 优先按排序字段升序
            ['id', 'ASC']    // 其次按ID升序
        ]
    });

    logger.info(`获取父分类 ${parentId} 下的子分类列表，共 ${subCategories.length} 项`);

    res.status(200).json({
        success: true,
        code: 200,
        message: '获取成功',
        data: subCategories
    });
}); 