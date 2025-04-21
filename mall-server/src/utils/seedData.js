/**
 * 数据库初始化工具
 * 负责填充基础数据，确保系统首次运行时有基本的数据支持
 */
const { Category, Banner, User, Goods, Order, OrderGoods } = require('../models');
const logger = require('./logger');
const { Op } = require('sequelize');

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
                    avatar: '/uploads/avatars/avatar1.jpg',
                    phone: '13812345678',
                    gender: 1,
                    status: 1
                },
                {
                    nickname: '李四',
                    openid: 'wx_openid_23456',
                    avatar: '/uploads/avatars/avatar2.jpg',
                    phone: '13987654321',
                    gender: 1,
                    status: 1
                },
                {
                    nickname: '王五',
                    openid: 'wx_openid_34567',
                    avatar: '/uploads/avatars/avatar3.jpg',
                    phone: '13500123456',
                    gender: 1,
                    status: 0
                },
                {
                    nickname: '赵六',
                    openid: 'wx_openid_45678',
                    avatar: '/uploads/avatars/avatar4.jpg',
                    phone: '13611112222',
                    gender: 1,
                    status: 1
                },
                {
                    nickname: '小红',
                    openid: 'wx_openid_56789',
                    avatar: '/uploads/avatars/avatar5.jpg',
                    phone: '13922223333',
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
        logger.error('错误详情:', error);
    }
};

/**
 * 初始化商品数据
 * 只在商品表为空时添加初始数据
 */
const initGoods = async () => {
    try {
        // 检查商品表是否为空
        const count = await Goods.count();

        if (count === 0) {
            logger.info('商品表为空，开始初始化示例商品数据...');

            // 获取所有二级分类ID作为商品分类ID
            const subCategories = await Category.findAll({
                where: {
                    parent_id: { [Op.ne]: 0 }
                }
            });

            if (subCategories.length === 0) {
                logger.warn('未找到二级分类数据，请先初始化分类数据');
                return;
            }

            // 定义示例商品数据
            const goods = [];

            // 男装分类商品
            const menCategoryId = subCategories.find(cat => cat.name === '男装')?.id;
            if (menCategoryId) {
                goods.push(
                    {
                        category_id: menCategoryId,
                        name: '男士休闲T恤',
                        price: 99.00,
                        original_price: 129.00,
                        stock: 100,
                        sales: 50,
                        main_image: '/uploads/goods/men-tshirt.jpg',
                        images: '/uploads/goods/men-tshirt.jpg,/uploads/goods/men-tshirt-2.jpg',
                        description: '舒适透气，时尚百搭',
                        detail: '<p>产品材质：纯棉</p><p>尺码：M, L, XL, XXL</p><p>颜色：黑色、白色、灰色</p>',
                        status: 1
                    },
                    {
                        category_id: menCategoryId,
                        name: '男士牛仔裤',
                        price: 159.00,
                        original_price: 199.00,
                        stock: 80,
                        sales: 30,
                        main_image: '/uploads/goods/men-jeans.jpg',
                        images: '/uploads/goods/men-jeans.jpg,/uploads/goods/men-jeans-2.jpg',
                        description: '弹力修身，经典百搭',
                        detail: '<p>产品材质：牛仔布</p><p>尺码：29, 30, 31, 32, 33, 34</p><p>颜色：蓝色、黑色</p>',
                        status: 1
                    }
                );
            }

            // 女装分类商品
            const womenCategoryId = subCategories.find(cat => cat.name === '女装')?.id;
            if (womenCategoryId) {
                goods.push(
                    {
                        category_id: womenCategoryId,
                        name: '女士连衣裙',
                        price: 199.00,
                        original_price: 259.00,
                        stock: 120,
                        sales: 80,
                        main_image: '/uploads/goods/women-dress.jpg',
                        images: '/uploads/goods/women-dress.jpg,/uploads/goods/women-dress-2.jpg',
                        description: '优雅气质，修身显瘦',
                        detail: '<p>产品材质：聚酯纤维</p><p>尺码：S, M, L, XL</p><p>颜色：粉色、蓝色、白色</p>',
                        status: 1
                    },
                    {
                        category_id: womenCategoryId,
                        name: '女士针织衫',
                        price: 139.00,
                        original_price: 169.00,
                        stock: 90,
                        sales: 60,
                        main_image: '/uploads/goods/women-sweater.jpg',
                        images: '/uploads/goods/women-sweater.jpg,/uploads/goods/women-sweater-2.jpg',
                        description: '保暖舒适，百搭款式',
                        detail: '<p>产品材质：羊毛混纺</p><p>尺码：S, M, L</p><p>颜色：米色、灰色、黑色</p>',
                        status: 1
                    }
                );
            }

            // 手机分类商品
            const phoneCategoryId = subCategories.find(cat => cat.name === '手机')?.id;
            if (phoneCategoryId) {
                goods.push(
                    {
                        category_id: phoneCategoryId,
                        name: '智能手机Pro',
                        price: 4999.00,
                        original_price: 5299.00,
                        stock: 50,
                        sales: 100,
                        main_image: '/uploads/goods/smartphone.jpg',
                        images: '/uploads/goods/smartphone.jpg,/uploads/goods/smartphone-2.jpg',
                        description: '全新一代处理器，超强性能',
                        detail: '<p>屏幕尺寸：6.5英寸</p><p>处理器：A15仿生芯片</p><p>存储：128GB/256GB</p><p>颜色：黑色、白色、蓝色</p>',
                        status: 1
                    },
                    {
                        category_id: phoneCategoryId,
                        name: '轻薄智能手机',
                        price: 2999.00,
                        original_price: 3299.00,
                        stock: 70,
                        sales: 120,
                        main_image: '/uploads/goods/phone-lite.jpg',
                        images: '/uploads/goods/phone-lite.jpg,/uploads/goods/phone-lite-2.jpg',
                        description: '轻薄机身，长效续航',
                        detail: '<p>屏幕尺寸：6.1英寸</p><p>处理器：骁龙780G</p><p>存储：64GB/128GB</p><p>颜色：绿色、白色、黑色</p>',
                        status: 1
                    }
                );
            }

            // 零食分类商品
            const snackCategoryId = subCategories.find(cat => cat.name === '零食')?.id;
            if (snackCategoryId) {
                goods.push(
                    {
                        category_id: snackCategoryId,
                        name: '混合坚果礼盒',
                        price: 68.00,
                        original_price: 88.00,
                        stock: 200,
                        sales: 150,
                        main_image: '/uploads/goods/nuts.jpg',
                        images: '/uploads/goods/nuts.jpg,/uploads/goods/nuts-2.jpg',
                        description: '多种坚果，营养丰富',
                        detail: '<p>产品规格：600g/盒</p><p>成分：核桃、腰果、杏仁、榛子</p><p>保质期：12个月</p>',
                        status: 1
                    }
                );
            }

            // 批量创建商品
            await Goods.bulkCreate(goods);
            logger.info(`成功初始化 ${goods.length} 条商品数据`);
        } else {
            logger.info(`商品表已存在 ${count} 条数据，跳过初始化`);
        }
    } catch (error) {
        logger.error('初始化商品数据失败:', error.message);
        logger.error('错误详情:', error);
    }
};

/**
 * 初始化订单数据
 * 只在订单表为空时添加初始数据
 */
const initOrders = async () => {
    try {
        // 检查订单表是否为空
        const count = await Order.count();

        if (count === 0) {
            logger.info('订单表为空，开始初始化示例订单数据...');

            // 获取用户
            const users = await User.findAll({
                where: { status: 1 }  // 只使用状态正常的用户
            });

            if (users.length === 0) {
                logger.warn('未找到可用用户数据，请先初始化用户数据');
                return;
            }

            // 获取商品
            const goodsList = await Goods.findAll({
                where: { status: 1, stock: { [Op.gt]: 0 } }  // 只使用上架并且有库存的商品
            });

            if (goodsList.length === 0) {
                logger.warn('未找到可用商品数据，请先初始化商品数据');
                return;
            }

            // 物流公司列表
            const deliveryCompanies = ['顺丰速运', '圆通快递', '中通快递', '韵达快递', '申通快递'];

            // 订单状态与对应的时间逻辑
            const statusTimeMap = {
                0: { pay_time: null, delivery_time: null, receive_time: null },  // 待付款
                1: { pay_time: true, delivery_time: null, receive_time: null },  // 待发货
                2: { pay_time: true, delivery_time: true, receive_time: null },  // 待收货
                3: { pay_time: true, delivery_time: true, receive_time: true },  // 已完成
                4: { pay_time: null, delivery_time: null, receive_time: null }   // 已取消
            };

            // 生成随机日期（最多前30天）
            const getRandomDate = (daysAgo = 30) => {
                const date = new Date();
                date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
                return date;
            };

            // 生成随机订单号
            const generateOrderNo = () => {
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
                return `${year}${month}${day}${randomNum}${Date.now().toString().slice(-4)}`;
            };

            // 创建20个示例订单
            const orders = [];
            const orderGoodsList = [];

            for (let i = 0; i < 20; i++) {
                // 随机选取用户
                const user = users[Math.floor(Math.random() * users.length)];

                // 订单状态：0待付款，1待发货，2待收货，3已完成，4已取消
                // 权重分配：待付款1份，待发货2份，待收货3份，已完成3份，已取消1份
                const statusWeights = [1, 2, 3, 3, 1];
                const statusSum = statusWeights.reduce((a, b) => a + b, 0);
                let randomValue = Math.random() * statusSum;

                let orderStatus = 0;
                for (let j = 0; j < statusWeights.length; j++) {
                    randomValue -= statusWeights[j];
                    if (randomValue <= 0) {
                        orderStatus = j;
                        break;
                    }
                }

                // 创建日期（最多前30天）
                const createDate = getRandomDate(30);

                // 获取付款、发货、收货时间
                const times = statusTimeMap[orderStatus];
                let payTime = null;
                let deliveryTime = null;
                let receiveTime = null;

                if (times.pay_time) {
                    // 付款时间为创建后0-2小时
                    payTime = new Date(createDate);
                    payTime.setHours(payTime.getHours() + Math.random() * 2);
                }

                if (times.delivery_time && payTime) {
                    // 发货时间为付款后1-24小时
                    deliveryTime = new Date(payTime);
                    deliveryTime.setHours(deliveryTime.getHours() + 1 + Math.random() * 23);
                }

                if (times.receive_time && deliveryTime) {
                    // 收货时间为发货后1-3天
                    receiveTime = new Date(deliveryTime);
                    receiveTime.setDate(receiveTime.getDate() + 1 + Math.floor(Math.random() * 3));
                }

                // 随机选择1-3个商品
                const itemCount = Math.floor(Math.random() * 3) + 1;
                const selectedGoods = [];
                let totalAmount = 0;

                // 确保不重复选择商品
                const availableGoods = [...goodsList];
                for (let j = 0; j < itemCount && availableGoods.length > 0; j++) {
                    const randomIndex = Math.floor(Math.random() * availableGoods.length);
                    const good = availableGoods.splice(randomIndex, 1)[0];

                    // 随机数量1-3
                    const quantity = Math.floor(Math.random() * 3) + 1;

                    selectedGoods.push({
                        goods: good,
                        quantity: quantity
                    });

                    totalAmount += parseFloat(good.price) * quantity;
                }

                // 生成运费金额（0-10元）
                const freightAmount = Math.round(Math.random() * 10 * 100) / 100;

                // 总价加上运费
                const payAmount = totalAmount + freightAmount;

                // 创建订单
                const order = {
                    order_no: generateOrderNo(),
                    user_id: user.id,
                    total_amount: totalAmount.toFixed(2),
                    pay_amount: payAmount.toFixed(2),
                    freight_amount: freightAmount.toFixed(2),
                    pay_type: 1, // 微信支付
                    status: orderStatus,
                    address_id: 1, // 假设地址ID为1
                    remark: Math.random() > 0.7 ? '请尽快发货，谢谢！' : null,
                    pay_time: payTime,
                    delivery_time: deliveryTime,
                    receive_time: receiveTime,
                    delivery_company: deliveryTime ? deliveryCompanies[Math.floor(Math.random() * deliveryCompanies.length)] : null,
                    delivery_number: deliveryTime ? `SF${Math.floor(Math.random() * 10000000000)}` : null,
                    create_time: createDate,
                    update_time: receiveTime || deliveryTime || payTime || createDate
                };

                orders.push(order);
            }

            // 批量创建订单
            const createdOrders = await Order.bulkCreate(orders);
            logger.info(`成功创建 ${createdOrders.length} 条订单数据`);

            // 为每个订单创建订单商品记录
            for (let i = 0; i < createdOrders.length; i++) {
                const order = createdOrders[i];

                // 随机选择1-3个商品
                const itemCount = Math.floor(Math.random() * 3) + 1;
                const selectedGoods = [];

                // 确保不重复选择商品
                const availableGoods = [...goodsList];
                for (let j = 0; j < itemCount && availableGoods.length > 0; j++) {
                    const randomIndex = Math.floor(Math.random() * availableGoods.length);
                    const good = availableGoods.splice(randomIndex, 1)[0];

                    // 随机数量1-3
                    const quantity = Math.floor(Math.random() * 3) + 1;

                    orderGoodsList.push({
                        order_id: order.id,
                        goods_id: good.id,
                        goods_name: good.name,
                        goods_image: good.main_image,
                        price: good.price,
                        quantity: quantity,
                        create_time: order.create_time
                    });
                }
            }

            // 批量创建订单商品
            if (orderGoodsList.length > 0) {
                await OrderGoods.bulkCreate(orderGoodsList);
                logger.info(`成功创建 ${orderGoodsList.length} 条订单商品数据`);
            }
        } else {
            logger.info(`订单表已存在 ${count} 条数据，跳过初始化`);
        }
    } catch (error) {
        logger.error('初始化订单数据失败:', error.message);
        logger.error('错误详情:', error);
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
    await initGoods();
    await initOrders();
    // 可以添加其他数据初始化函数
    // await initProducts();
    // 等等...
};

module.exports = {
    initAllSeedData,
    initCategories,
    initBanners,
    initUsers,
    initGoods,
    initOrders
}; 