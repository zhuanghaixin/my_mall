/**
 * 数据库初始化工具
 * 负责填充基础数据，确保系统首次运行时有基本的数据支持
 */
const { Category } = require('../models');
const logger = require('./logger');

/**
 * 初始化基础分类数据
 * 只在分类表为空时添加初始数据
 */
const initCategories = async () => {
    try {
        // 检查分类表是否为空
        const count = await Category.count();

        if (count === 0) {
            logger.info('分类表为空，开始初始化基础分类数据...');

            // 定义基础分类数据
            const categories = [
                // 一级分类
                { name: '服装', parent_id: 0, icon: 'clothes.png', sort: 1, status: 1 },
                { name: '电子产品', parent_id: 0, icon: 'electronics.png', sort: 2, status: 1 },
                { name: '家居', parent_id: 0, icon: 'home.png', sort: 3, status: 1 },
                { name: '食品', parent_id: 0, icon: 'food.png', sort: 4, status: 1 },
                { name: '美妆', parent_id: 0, icon: 'beauty.png', sort: 5, status: 1 },
            ];

            // 批量创建分类
            const createdCategories = await Category.bulkCreate(categories);

            // 获取创建的主分类ID，用于创建子分类
            const parentIds = {};
            createdCategories.forEach(category => {
                parentIds[category.name] = category.id;
            });

            // 创建二级分类
            const subCategories = [
                // 服装子分类
                { name: '男装', parent_id: parentIds['服装'], icon: 'men.png', sort: 1, status: 1 },
                { name: '女装', parent_id: parentIds['服装'], icon: 'women.png', sort: 2, status: 1 },
                { name: '童装', parent_id: parentIds['服装'], icon: 'kids.png', sort: 3, status: 1 },

                // 电子产品子分类
                { name: '手机', parent_id: parentIds['电子产品'], icon: 'phone.png', sort: 1, status: 1 },
                { name: '电脑', parent_id: parentIds['电子产品'], icon: 'computer.png', sort: 2, status: 1 },
                { name: '智能设备', parent_id: parentIds['电子产品'], icon: 'smart.png', sort: 3, status: 1 },

                // 家居子分类
                { name: '家具', parent_id: parentIds['家居'], icon: 'furniture.png', sort: 1, status: 1 },
                { name: '厨具', parent_id: parentIds['家居'], icon: 'kitchen.png', sort: 2, status: 1 },

                // 食品子分类
                { name: '零食', parent_id: parentIds['食品'], icon: 'snack.png', sort: 1, status: 1 },
                { name: '饮料', parent_id: parentIds['食品'], icon: 'drink.png', sort: 2, status: 1 },

                // 美妆子分类
                { name: '护肤', parent_id: parentIds['美妆'], icon: 'skincare.png', sort: 1, status: 1 },
                { name: '彩妆', parent_id: parentIds['美妆'], icon: 'makeup.png', sort: 2, status: 1 },
            ];

            await Category.bulkCreate(subCategories);
            logger.info(`成功初始化 ${categories.length + subCategories.length} 条分类数据`);
        } else {
            logger.info(`分类表已存在 ${count} 条数据，跳过初始化`);
        }
    } catch (error) {
        logger.error('初始化分类数据失败:', error.message);
    }
};

/**
 * 初始化所有种子数据
 * 按需添加其他数据初始化函数
 */
const initAllSeedData = async () => {
    await initCategories();
    // 可以添加其他数据初始化函数
    // await initProducts();
    // await initBanners();
    // 等等...
};

module.exports = {
    initAllSeedData,
    initCategories,
}; 