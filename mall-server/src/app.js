const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./utils/swagger');
const { errorHandler } = require('./middlewares/errorHandler');
const routes = require('./routes');

// 创建Express应用
const app = express();

// 获取允许的源
const getAllowedOrigins = () => {
    // 从环境变量获取允许的源
    const originsFromEnv = process.env.ALLOWED_ORIGINS ?
        process.env.ALLOWED_ORIGINS.split(',') : [];

    // 默认允许的源
    const defaultOrigins = [
        'http://localhost:3000',
        'http://localhost:8080',
        'https://localhost',
        'https://localhost:8443'
    ];

    // 合并环境变量中的源和默认源
    return [...new Set([...originsFromEnv, ...defaultOrigins])];
};

// 中间件
// 启用CORS跨域资源共享
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = getAllowedOrigins();

        // 允许没有来源的请求（如移动应用）或允许的来源
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS policy violation'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Disposition', 'API-Key'],
    credentials: true,
    maxAge: 86400 // 预检请求缓存24小时
}));

// 解析JSON格式的请求体
app.use(express.json({ limit: '50mb' }));

// 解析URL编码的请求体,extended:true允许解析复杂对象
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 配置日志中间件
// 生产环境使用combined格式(包含更多信息)
// 开发环境使用dev格式(着色的简洁输出)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// 静态文件目录
app.use(express.static(path.join(__dirname, '../public'), {
    maxAge: '1d', // 缓存一天
    etag: true,
    lastModified: true
}));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads'), {
    maxAge: '1d',
    etag: true
}));

// 配置Swagger文档UI
app.use('/mall-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "商城小程序API文档"
}));

// 提供swagger.json端点
app.get('/mall-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// API路由
app.use(process.env.API_PREFIX || '/api', routes);

// 404处理
app.use((req, res, next) => {
    res.status(404).json({
        status: 'fail',
        message: '请求的资源不存在'
    });
});

// 错误处理中间件
app.use(errorHandler);

module.exports = app; 