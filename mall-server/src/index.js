// 首先加载环境变量
require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

const app = require('./app');
const https = require('https');
const fs = require('fs');
const path = require('path');
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
const SSL_PORT = process.env.SSL_PORT || 8443;
const SSL_ENABLED = process.env.SSL_ENABLED === 'true';

// 连接到数据库
connectToDatabase()
    .then(async () => {
        // 创建初始管理员账号
        await createInitialAdmin();

        // 初始化种子数据
        await initAllSeedData();

        // 启动HTTP服务器
        app.listen(PORT, '0.0.0.0', () => {
            logger.info(`HTTP服务器运行在 http://localhost:${PORT}`);
            logger.info(`服务器在局域网可通过 http://192.168.0.131:${PORT} 访问`);
            logger.info(`API前缀: ${process.env.API_PREFIX}`);
            logger.info(`环境: ${process.env.NODE_ENV}`);
        });

        // 如果启用了SSL，启动HTTPS服务器
        if (SSL_ENABLED) {
            try {
                // 尝试查找SSL证书文件
                let sslOptions = {};

                // 优先使用环境变量中指定的证书路径
                if (process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH) {
                    sslOptions = {
                        key: fs.readFileSync(process.env.SSL_KEY_PATH),
                        cert: fs.readFileSync(process.env.SSL_CERT_PATH)
                    };
                    logger.info('使用环境变量指定的SSL证书');
                }
                // 尝试使用项目根目录下的ssl-certs目录
                else {
                    const rootDir = path.resolve(__dirname, '../../');
                    const keyPath = path.join(rootDir, 'ssl-certs/js101.fun.key');
                    const certPath = path.join(rootDir, 'ssl-certs/js101.fun_bundle.crt');

                    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
                        sslOptions = {
                            key: fs.readFileSync(keyPath),
                            cert: fs.readFileSync(certPath)
                        };
                        logger.info('使用项目根目录的SSL证书');
                    } else {
                        throw new Error('SSL证书文件不存在');
                    }
                }

                // 创建HTTPS服务器
                https.createServer(sslOptions, app).listen(SSL_PORT, '0.0.0.0', () => {
                    logger.info(`HTTPS服务器运行在 https://localhost:${SSL_PORT}`);
                    logger.info(`服务器在局域网可通过 https://192.168.0.131:${SSL_PORT} 访问`);
                });
            } catch (error) {
                logger.error('无法启动HTTPS服务器:', error.message);
                logger.info('继续使用HTTP服务器');
            }
        }
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