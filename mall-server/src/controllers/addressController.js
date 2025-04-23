/**
 * 收货地址控制器
 * 处理地址相关的业务逻辑
 */
const { Address } = require('../models');
const catchAsync = require('../utils/catchAsync');
const { ValidationError, NotFoundError } = require('../utils/errorTypes');
const logger = require('../utils/logger');

/**
 * 获取用户收货地址列表
 * @route GET /api/address/list
 * @access Private
 */
exports.getAddressList = catchAsync(async (req, res) => {
    const userId = req.user.id;

    try {
        const addresses = await Address.findAll({
            where: { user_id: userId },
            order: [
                ['is_default', 'DESC'],
                ['id', 'DESC']
            ]
        });

        logger.info(`用户(ID: ${userId})获取地址列表成功，共${addresses.length}条记录`);

        res.status(200).json({
            code: 200,
            message: '获取成功',
            data: addresses
        });
    } catch (error) {
        logger.error(`获取地址列表失败: ${error.message}`);
        throw error;
    }
});

/**
 * 添加收货地址
 * @route POST /api/address/add
 * @access Private
 */
exports.addAddress = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { name, phone, province, city, district, detail, is_default } = req.body;

    // 验证参数
    if (!name || !phone || !province || !city || !district || !detail) {
        throw new ValidationError('请填写完整的地址信息');
    }

    try {
        // 如果设置为默认地址，先将其他地址设为非默认
        if (parseInt(is_default) === 1) {
            await Address.update(
                { is_default: 0 },
                { where: { user_id: userId } }
            );
        }

        // 创建新地址
        const address = await Address.create({
            user_id: userId,
            name,
            phone,
            province,
            city,
            district,
            detail,
            is_default: parseInt(is_default) || 0,
            create_time: new Date(),
            update_time: new Date()
        });

        logger.info(`用户(ID: ${userId})添加地址成功，地址ID: ${address.id}`);

        res.status(201).json({
            code: 200,
            message: '添加成功',
            data: {
                id: address.id
            }
        });
    } catch (error) {
        logger.error(`添加地址失败: ${error.message}`);
        throw error;
    }
});

/**
 * 更新收货地址
 * @route PUT /api/address/update/:id
 * @access Private
 */
exports.updateAddress = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const addressId = req.params.id;
    const { name, phone, province, city, district, detail, is_default } = req.body;

    // 验证参数
    if (!name && !phone && !province && !city && !district && !detail && is_default === undefined) {
        throw new ValidationError('未提供任何更新数据');
    }

    try {
        // 检查地址是否存在且属于该用户
        const address = await Address.findOne({
            where: {
                id: addressId,
                user_id: userId
            }
        });

        if (!address) {
            throw new NotFoundError('地址不存在');
        }

        // 如果设置为默认地址，先将其他地址设为非默认
        if (parseInt(is_default) === 1) {
            await Address.update(
                { is_default: 0 },
                { where: { user_id: userId } }
            );
        }

        // 准备更新数据
        const updateData = {};

        if (name !== undefined) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;
        if (province !== undefined) updateData.province = province;
        if (city !== undefined) updateData.city = city;
        if (district !== undefined) updateData.district = district;
        if (detail !== undefined) updateData.detail = detail;
        if (is_default !== undefined) updateData.is_default = parseInt(is_default);

        updateData.update_time = new Date();

        // 更新地址
        await address.update(updateData);

        logger.info(`用户(ID: ${userId})更新地址成功，地址ID: ${addressId}`);

        res.status(200).json({
            code: 200,
            message: '更新成功',
            data: null
        });
    } catch (error) {
        logger.error(`更新地址失败: ${error.message}`);
        throw error;
    }
});

/**
 * 删除收货地址
 * @route DELETE /api/address/delete/:id
 * @access Private
 */
exports.deleteAddress = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const addressId = req.params.id;

    try {
        // 检查地址是否存在且属于该用户
        const address = await Address.findOne({
            where: {
                id: addressId,
                user_id: userId
            }
        });

        if (!address) {
            throw new NotFoundError('地址不存在');
        }

        // 判断是否为默认地址
        const isDefault = address.is_default === 1;

        // 删除地址
        await address.destroy();

        // 如果删除的是默认地址，则将最新添加的地址设为默认地址
        if (isDefault) {
            const remainingAddress = await Address.findOne({
                where: { user_id: userId },
                order: [['id', 'DESC']]
            });

            if (remainingAddress) {
                await remainingAddress.update({ is_default: 1 });
            }
        }

        logger.info(`用户(ID: ${userId})删除地址成功，地址ID: ${addressId}`);

        res.status(200).json({
            code: 200,
            message: '删除成功',
            data: null
        });
    } catch (error) {
        logger.error(`删除地址失败: ${error.message}`);
        throw error;
    }
});

/**
 * 设置默认收货地址
 * @route PUT /api/address/default/:id
 * @access Private
 */
exports.setDefaultAddress = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const addressId = req.params.id;

    try {
        // 检查地址是否存在且属于该用户
        const address = await Address.findOne({
            where: {
                id: addressId,
                user_id: userId
            }
        });

        if (!address) {
            throw new NotFoundError('地址不存在');
        }

        // 将所有地址设为非默认
        await Address.update(
            { is_default: 0 },
            { where: { user_id: userId } }
        );

        // 设置当前地址为默认
        await address.update({ is_default: 1 });

        logger.info(`用户(ID: ${userId})设置默认地址成功，地址ID: ${addressId}`);

        res.status(200).json({
            code: 200,
            message: '设置成功',
            data: null
        });
    } catch (error) {
        logger.error(`设置默认地址失败: ${error.message}`);
        throw error;
    }
});

/**
 * 获取默认收货地址
 * @route GET /api/address/default
 * @access Private
 */
exports.getDefaultAddress = catchAsync(async (req, res) => {
    const userId = req.user.id;

    try {
        // 查找默认地址
        let address = await Address.findOne({
            where: {
                user_id: userId,
                is_default: 1
            }
        });

        // 如果没有默认地址，返回最新添加的地址
        if (!address) {
            address = await Address.findOne({
                where: { user_id: userId },
                order: [['id', 'DESC']]
            });

            if (!address) {
                return res.status(200).json({
                    code: 200,
                    message: '暂无收货地址',
                    data: null
                });
            }
        }

        logger.info(`用户(ID: ${userId})获取默认地址成功，地址ID: ${address.id}`);

        res.status(200).json({
            code: 200,
            message: '获取成功',
            data: address
        });
    } catch (error) {
        logger.error(`获取默认地址失败: ${error.message}`);
        throw error;
    }
});

/**
 * 获取收货地址详情
 * @route GET /api/address/:id
 * @access Private
 */
exports.getAddressDetail = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const addressId = req.params.id;

    try {
        // 查找地址
        const address = await Address.findOne({
            where: {
                id: addressId,
                user_id: userId
            }
        });

        if (!address) {
            throw new NotFoundError('地址不存在');
        }

        logger.info(`用户(ID: ${userId})获取地址详情成功，地址ID: ${addressId}`);

        res.status(200).json({
            code: 200,
            message: '获取成功',
            data: address
        });
    } catch (error) {
        logger.error(`获取地址详情失败: ${error.message}`);
        throw error;
    }
}); 