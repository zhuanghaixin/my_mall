/**
 * 数据库初始化工具
 * 负责填充基础数据，确保系统首次运行时有基本的数据支持
 */
const { Category, Banner, User } = require('../models');
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
 * 初始化轮播图数据
 * 清空轮播图表并重新初始化
 */
const initBanners = async () => {
    try {
        // 清空轮播图表并重新初始化
        await Banner.destroy({ where: {}, truncate: true });
        logger.info('轮播图表已清空，开始初始化轮播图数据...');

        // 定义示例轮播图数据，注意这里使用根路径开始的完整路径
        const banners = [
            {
                title: '新品上市',
                image: 'http://localhost:8080/uploads/banners/banner1.svg',
                url: '/pages/products?category=new',
                sort: 1,
                status: 1  // 启用状态
            },
            {
                title: '限时折扣',
                image: 'http://localhost:8080/uploads/banners/banner2.svg',
                url: '/pages/products?type=discount',
                sort: 2,
                status: 1  // 启用状态
            },
            {
                title: '热门推荐',
                image: 'http://localhost:8080/uploads/banners/banner3.svg',
                url: '/pages/products?type=hot',
                sort: 3,
                status: 1  // 启用状态
            },
            {
                title: '夏季专享',
                image: 'http://localhost:8080/uploads/banners/banner4.svg',
                url: '/pages/products?season=summer',
                sort: 4,
                status: 0  // 禁用状态
            },
            {
                title: '品牌特卖',
                image: 'http://localhost:8080/uploads/banners/banner5.svg',
                url: '/pages/products?type=brand',
                sort: 5,
                status: 0  // 禁用状态
            }
        ];

        // 批量创建轮播图
        await Banner.bulkCreate(banners);
        logger.info(`成功初始化 ${banners.length} 条轮播图数据`);
    } catch (error) {
        logger.error('初始化轮播图数据失败:', error.message);
    }
};

/**
 * 初始化用户数据
 * 只在用户表为空时添加初始数据
 */
const initUsers = async () => {
    try {
        // 检查用户表是否为空
        const count = await User.count();

        if (count === 0) {
            logger.info('用户表为空，开始初始化示例用户数据...');

            // 定义示例用户数据
            const users = [
                {
                    nickname: '张三',
                    openid: 'wx_openid_12345',
                    avatar: 'http://localhost:8080/uploads/avatars/avatar1.jpg',
                    phone: '13812345678',
                    email: 'zhangsan@example.com',
                    gender: 1,
                    status: 1
                },
                {
                    nickname: '李四',
                    openid: 'wx_openid_23456',
                    avatar: 'http://localhost:8080/uploads/avatars/avatar2.jpg',
                    phone: '13987654321',
                    email: 'lisi@example.com',
                    gender: 1,
                    status: 1
                },
                {
                    nickname: '王五',
                    openid: 'wx_openid_34567',
                    avatar: 'http://localhost:8080/uploads/avatars/avatar3.jpg',
                    phone: '13500123456',
                    email: 'wangwu@example.com',
                    gender: 1,
                    status: 0
                },
                {
                    nickname: '赵六',
                    openid: 'wx_openid_45678',
                    avatar: 'http://localhost:8080/uploads/avatars/avatar4.jpg',
                    phone: '13611112222',
                    email: 'zhaoliu@example.com',
                    gender: 1,
                    status: 1
                },
                {
                    nickname: '小红',
                    openid: 'wx_openid_56789',
                    avatar: 'http://localhost:8080/uploads/avatars/avatar5.jpg',
                    phone: '13922223333',
                    email: 'xiaohong@example.com',
                    gender: 2,
                    status: 1
                }
            ];

            // 批量创建用户
            await User.bulkCreate(users);
            logger.info(`成功初始化 ${users.length} 条用户数据`);
        } else {
            logger.info(`用户表已存在 ${count} 条数据，跳过初始化`);
        }
    } catch (error) {
        logger.error('初始化用户数据失败:', error.message);
    }
};

/**
 * 初始化所有种子数据
 * 按需添加其他数据初始化函数
 */
const initAllSeedData = async () => {
    await initCategories();
    await initBanners();
    await initUsers();
    // 可以添加其他数据初始化函数
    // await initProducts();
    // 等等...
};

module.exports = {
    initAllSeedData,
    initCategories,
    initBanners,
    initUsers
}; 