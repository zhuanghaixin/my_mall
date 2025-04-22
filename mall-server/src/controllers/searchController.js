/**
 * 搜索控制器
 * 处理搜索相关的业务逻辑
 */
const { Op } = require('sequelize');
const { Goods, SearchHot, SearchHistory } = require('../models');
const logger = require('../utils/logger');

/**
 * 搜索商品
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.searchGoods = async (req, res) => {
    try {
        const { keyword, page = 1, pageSize = 10, sortType = 0 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(pageSize);

        // 如果没有关键词，返回空结果
        if (!keyword) {
            return res.status(200).json({
                code: 200,
                message: '搜索成功',
                data: {
                    total: 0,
                    items: []
                }
            });
        }

        // 构建查询条件
        const where = {
            status: 1, // 只查询上架商品
            name: {
                [Op.like]: `%${keyword}%`
            }
        };

        // 构建排序条件
        let order = [['id', 'DESC']]; // 默认按ID降序

        switch (parseInt(sortType)) {
            case 1: // 销量降序
                order = [['sale_count', 'DESC'], ['id', 'DESC']];
                break;
            case 2: // 价格升序
                order = [['price', 'ASC'], ['id', 'DESC']];
                break;
            case 3: // 价格降序
                order = [['price', 'DESC'], ['id', 'DESC']];
                break;
            // case 0 和其他情况使用默认排序
        }

        // 查询商品总数
        const count = await Goods.count({ where });

        // 查询商品列表
        const items = await Goods.findAll({
            where,
            attributes: ['id', 'name', 'price', 'original_price', 'cover_image', 'main_image', 'sale_count', 'status'],
            order,
            limit: parseInt(pageSize),
            offset
        });

        // 记录搜索历史（异步执行，不影响响应速度）
        try {
            // 从请求中获取用户标识（如果已登录则使用user_id，否则使用openid）
            const userId = req.user ? req.user.id : null;
            const openid = req.headers['x-user-openid'] || null;

            if (userId || openid) {
                // 先检查是否已存在相同的搜索记录
                const existingHistory = await SearchHistory.findOne({
                    where: {
                        ...(userId ? { user_id: userId } : {}),
                        ...(openid ? { openid } : {}),
                        keyword
                    }
                });

                if (existingHistory) {
                    // 如果存在，更新时间
                    await existingHistory.update({ updated_at: new Date() });
                } else {
                    // 如果不存在，创建新记录
                    await SearchHistory.create({
                        user_id: userId,
                        openid,
                        keyword
                    });
                }
            }

            // 增加热门搜索词的搜索次数
            let hotKeyword = await SearchHot.findOne({
                where: { keyword, status: 1 }
            });

            if (hotKeyword) {
                await hotKeyword.increment('search_count');
            } else {
                // 如果该关键词不在热门搜索中，且搜索结果数量大于0，可以考虑添加
                if (count > 0) {
                    // 获取当前热门搜索词数量
                    const hotCount = await SearchHot.count({ where: { status: 1 } });

                    // 如果热门搜索词数量少于20个，则添加该关键词（防止无限增长）
                    if (hotCount < 20) {
                        await SearchHot.create({
                            keyword,
                            search_count: 1,
                            sort: 0,
                            status: 1
                        });
                    }
                }
            }
        } catch (historyError) {
            // 记录历史出错不影响搜索结果返回
            logger.error('记录搜索历史失败:', historyError);
        }

        // 返回搜索结果
        res.status(200).json({
            code: 200,
            message: '搜索成功',
            data: {
                total: count,
                items
            }
        });
    } catch (error) {
        logger.error('搜索商品失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
            error: error.message
        });
    }
};

/**
 * 获取热门搜索词
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getHotKeywords = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        // 查询热门搜索词
        const hotKeywords = await SearchHot.findAll({
            where: { status: 1 },
            attributes: ['id', 'keyword', 'search_count'],
            order: [
                ['sort', 'DESC'],
                ['search_count', 'DESC'],
                ['id', 'DESC']
            ],
            limit
        });

        res.status(200).json({
            code: 200,
            message: '获取成功',
            data: hotKeywords
        });
    } catch (error) {
        logger.error('获取热门搜索词失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
            error: error.message
        });
    }
};

/**
 * 获取用户搜索历史
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getSearchHistory = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        // 从请求中获取用户标识
        const userId = req.user ? req.user.id : null;
        const openid = req.headers['x-user-openid'] || null;

        if (!userId && !openid) {
            return res.status(200).json({
                code: 200,
                message: '获取成功',
                data: []
            });
        }

        // 构建查询条件
        const where = {};
        if (userId) {
            where.user_id = userId;
        } else if (openid) {
            where.openid = openid;
        }

        // 查询搜索历史
        const searchHistory = await SearchHistory.findAll({
            where,
            attributes: ['id', 'keyword', 'created_at'],
            order: [['updated_at', 'DESC']],
            limit
        });

        res.status(200).json({
            code: 200,
            message: '获取成功',
            data: searchHistory
        });
    } catch (error) {
        logger.error('获取搜索历史失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
            error: error.message
        });
    }
};

/**
 * 清除用户搜索历史
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.clearSearchHistory = async (req, res) => {
    try {
        // 从请求中获取用户标识
        const userId = req.user ? req.user.id : null;
        const openid = req.headers['x-user-openid'] || null;

        if (!userId && !openid) {
            return res.status(400).json({
                code: 400,
                message: '未能识别用户身份',
                data: null
            });
        }

        // 构建删除条件
        const where = {};
        if (userId) {
            where.user_id = userId;
        } else if (openid) {
            where.openid = openid;
        }

        // 删除搜索历史
        await SearchHistory.destroy({ where });

        res.status(200).json({
            code: 200,
            message: '清除成功',
            data: null
        });
    } catch (error) {
        logger.error('清除搜索历史失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
            error: error.message
        });
    }
}; 