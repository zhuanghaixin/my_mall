// 首先加载环境变量
require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

const app = require('./app');
const logger = require('./utils/logger');
const { connectToDatabase } = require('./db');
const { createInitialAdmin } = require('./controllers/adminController');
const { initAllSeedData } = require('./utils/seedData');

// 打印环境变量以进行调试
logger.debug('数据库配置:', {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    password_length: process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0
});

const PORT = process.env.PORT || 8080;

// 连接到数据库
connectToDatabase()
    .then(async () => {
        // 创建初始管理员账号
        await createInitialAdmin();

        // 初始化种子数据
        await initAllSeedData();

        // 启动服务器
        app.listen(PORT, '0.0.0.0', () => {
            logger.info(`服务器运行在 http://localhost:${PORT}`);
            logger.info(`服务器在局域网可通过 http://192.168.0.131:${PORT} 访问`);
            logger.info(`API前缀: ${process.env.API_PREFIX}`);
            logger.info(`环境: ${process.env.NODE_ENV}`);
        });
    })
    .catch(err => {
        logger.error('无法连接到数据库:', err);
        process.exit(1);
    });

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
    logger.error('未捕获的异常:', err);
    process.exit(1);
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
    logger.error('未处理的Promise拒绝:', reason);
});

module.exports = app; 