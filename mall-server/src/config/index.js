/**
 * 系统配置
 */
module.exports = {
    // 服务器配置
    server: {
        port: process.env.PORT || 8080,
        host: process.env.HOST || 'localhost'
    },

    // 数据库配置
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        database: process.env.DB_NAME || 'mall_db',
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'password',
        dialect: 'mysql',
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        logging: process.env.NODE_ENV === 'development'
    },

    // JWT配置
    jwt: {
        secret: process.env.JWT_SECRET || 'mall-api-secret',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    },

    // 微信小程序配置
    wx: {
        appId: process.env.WX_APP_ID || 'your_app_id', // 从环境变量中读取小程序appId
        appSecret: process.env.WX_APP_SECRET || 'your_app_secret' // 从环境变量中读取小程序appSecret
    },

    // 短信配置
    sms: {
        // 短信服务商配置
        provider: process.env.SMS_PROVIDER || 'aliyun', // 短信提供商，例如：aliyun, tencent
        accessKeyId: process.env.SMS_ACCESS_KEY_ID || '',
        accessKeySecret: process.env.SMS_ACCESS_KEY_SECRET || '',
        signName: process.env.SMS_SIGN_NAME || '商城',
        templateCode: process.env.SMS_TEMPLATE_CODE || ''
    },

    // 上传文件配置
    upload: {
        path: process.env.UPLOAD_DIR || 'uploads',
        maxSize: process.env.MAX_FILE_SIZE || 2 * 1024 * 1024, // 2MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif']
    },

    // 跨域配置
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    },

    // 日志配置
    log: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || 'logs/app.log'
    }
}; 