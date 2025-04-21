const { Banner } = require('../models');
const { Op } = require('sequelize');
const catchAsync = require('../utils/catchAsync');

/**
 * 获取轮播图列表
 */
exports.getBannerList = catchAsync(async (req, res) => {
    const {
        page = 1,
        pageSize = 10,
        title,
        status
    } = req.query;

    // 构建查询条件
    const where = {};

    // 如果有标题搜索参数
    if (title) {
        where.title = {
            [Op.like]: `%${title}%`
        };
    }

    // 如果有状态筛选参数
    if (status !== undefined) {
        where.status = parseInt(status);
    }

    // 分页参数处理
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    // 执行查询，包含总数统计
    const { count, rows } = await Banner.findAndCountAll({
        where,
        order: [
            ['sort', 'ASC'],
            ['id', 'DESC']
        ],
        offset,
        limit
    });

    res.status(200).json({
        code: 200,
        message: '获取成功',
        data: {
            list: rows,
            total: count,
            page: parseInt(page),
            pageSize: parseInt(pageSize)
        }
    });
});

/**
 * 获取指定轮播图
 */
exports.getBanner = catchAsync(async (req, res) => {
    const { id } = req.params;

    const banner = await Banner.findByPk(id);

    if (!banner) {
        return res.status(404).json({
            code: 404,
            message: '轮播图不存在'
        });
    }

    res.status(200).json({
        code: 200,
        message: '获取成功',
        data: banner
    });
});

/**
 * 添加轮播图
 */
exports.addBanner = catchAsync(async (req, res) => {
    const { title, image, url, sort, status } = req.body;

    // 验证必填字段
    if (!title || !image || !url) {
        return res.status(400).json({
            code: 400,
            message: '标题、图片和链接为必填项'
        });
    }

    const banner = await Banner.create({
        title,
        image,
        url,
        sort: sort || 1,
        status: status === undefined ? 1 : status
    });

    res.status(201).json({
        code: 200,
        message: '添加成功',
        data: banner
    });
});

/**
 * 更新轮播图
 */
exports.updateBanner = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { title, image, url, sort, status } = req.body;

    const banner = await Banner.findByPk(id);

    if (!banner) {
        return res.status(404).json({
            code: 404,
            message: '轮播图不存在'
        });
    }

    // 更新轮播图
    await banner.update({
        ...(title && { title }),
        ...(image && { image }),
        ...(url && { url }),
        ...(sort !== undefined && { sort }),
        ...(status !== undefined && { status })
    });

    res.status(200).json({
        code: 200,
        message: '更新成功',
        data: banner
    });
});

/**
 * 删除轮播图
 */
exports.deleteBanner = catchAsync(async (req, res) => {
    const { id } = req.params;

    const banner = await Banner.findByPk(id);

    if (!banner) {
        return res.status(404).json({
            code: 404,
            message: '轮播图不存在'
        });
    }

    await banner.destroy();

    res.status(200).json({
        code: 200,
        message: '删除成功'
    });
});

/**
 * 更新轮播图状态
 */
exports.updateBannerStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (status === undefined) {
        return res.status(400).json({
            code: 400,
            message: '状态不能为空'
        });
    }

    const banner = await Banner.findByPk(id);

    if (!banner) {
        return res.status(404).json({
            code: 404,
            message: '轮播图不存在'
        });
    }

    await banner.update({ status });

    res.status(200).json({
        code: 200,
        message: '更新成功',
        data: banner
    });
});

/**
 * 更新轮播图排序
 */
exports.updateBannerSort = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { sort } = req.body;

    if (sort === undefined) {
        return res.status(400).json({
            code: 400,
            message: '排序值不能为空'
        });
    }

    const banner = await Banner.findByPk(id);

    if (!banner) {
        return res.status(404).json({
            code: 404,
            message: '轮播图不存在'
        });
    }

    await banner.update({ sort });

    res.status(200).json({
        code: 200,
        message: '更新成功',
        data: banner
    });
}); 