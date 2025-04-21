/**
 * 数据库连接模块
 * 配置和管理与MySQL数据库的连接
 */
const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2'); // 使用mysql2驱动
const logger = require('../utils/logger');

// 从环境变量获取数据库配置
const {
    DB_HOST,
    DB_PORT,
    DB_NAME,
    DB_USER,
    DB_PASSWORD
} = process.env;

// 使用特定的配置确保连接成功
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: '127.0.0.1', // 强制使用IP而不是域名
    port: parseInt(DB_PORT, 10),
    dialect: 'mysql',
    dialectModule: mysql2,
    logging: (msg) => logger.debug(msg),
    dialectOptions: {
        connectTimeout: 60000,
        // MySQL 8.0+严格模式设置
        dateStrings: true,
        typeCast: true
    },
    // 设置时区
    timezone: '+08:00',
    // 添加更宽松的日期时间处理
    define: {
        timestamps: true,
        underscored: true,
        freezeTableName: false,
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci'
    },
    // 减少连接池大小以避免过多连接
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

/**
 * 连接数据库并同步模型
 * @returns {Promise} 数据库连接promise
 */
const connectToDatabase = async () => {
    let retries = 3;

    while (retries > 0) {
        try {
            logger.debug(`尝试连接数据库 (${4 - retries}/3)...`);
            logger.debug(`连接配置: 127.0.0.1:${DB_PORT}, 数据库: ${DB_NAME}, 用户: ${DB_USER}`);

            await sequelize.authenticate();
            logger.info('数据库连接成功');

            // 开发环境下同步模型 - 启用alter模式更新表结构
            if (process.env.NODE_ENV === 'development') {
                // 更改为true的alter，使模型变更能够同步到数据库表结构
                await sequelize.sync({ force: false, alter: true });
                logger.info('数据库模型同步完成，表结构已根据模型定义更新');
            }

            return sequelize;
        } catch (error) {
            retries--;

            if (retries === 0) {
                logger.error(`数据库操作失败 (已尝试3次): ${error.message}`);
                logger.error('错误详情:', error.original || error);
                throw error;
            }

            logger.warn(`数据库操作失败，将在3秒后重试 (剩余${retries}次): ${error.message}`);
            // 延迟3秒后重试
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
};

module.exports = sequelize;
module.exports.connectToDatabase = connectToDatabase; 