/**
 * 数据验证工具模块
 * 使用Joi库实现数据验证功能
 */

const Joi = require('joi');
const { ValidationError } = require('./errorTypes');
const logger = require('./logger');

/**
 * 通用验证函数
 * @param {Object} schema - Joi验证模式
 * @param {Object} data - 需要验证的数据
 * @param {boolean} abortEarly - 是否在第一个错误时停止验证
 * @returns {Object} 验证通过的数据
 * @throws {ValidationError} 验证失败时抛出错误
 */
function validate(schema, data, abortEarly = false) {
    const { error, value } = schema.validate(data, { abortEarly });

    if (error) {
        const errorMessage = error.details.map(detail => detail.message).join('; ');
        logger.debug(`验证失败: ${errorMessage}`, { data });
        throw new ValidationError(errorMessage);
    }

    return value;
}

/**
 * 常用验证规则
 */
const rules = {
    // 用户相关
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{6,30}$')).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required(),

    // 商品相关
    productName: Joi.string().min(2).max(100).required(),
    price: Joi.number().positive().required(),
    stock: Joi.number().integer().min(0).required(),

    // 订单相关
    orderId: Joi.string().required(),
    orderStatus: Joi.string().valid('pending', 'paid', 'shipped', 'delivered', 'cancelled').required(),

    // 通用ID
    id: Joi.string().required(),
    mongoid: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),

    // 分页
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),

    // 排序
    sortField: Joi.string(),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc')
};

/**
 * 创建验证器
 * @param {Object} schemaMap - 验证模式映射
 * @returns {Function} 验证函数
 */
function createValidator(schemaMap) {
    const schema = Joi.object(schemaMap);

    return (data) => validate(schema, data);
}

module.exports = {
    validate,
    rules,
    createValidator,
    Joi // 导出Joi实例，以便直接使用
}; 