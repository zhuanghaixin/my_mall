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

// 中间件
// 启用CORS跨域资源共享
app.use(cors());

// 解析JSON格式的请求体
app.use(express.json());

// 解析URL编码的请求体,extended:true允许解析复杂对象
app.use(express.urlencoded({ extended: true }));

// 配置日志中间件
// 生产环境使用combined格式(包含更多信息)
// 开发环境使用dev格式(着色的简洁输出)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// 静态文件目录
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// 配置Swagger文档UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "商城小程序API文档"
}));

// 提供swagger.json端点
app.get('/api-docs.json', (req, res) => {
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