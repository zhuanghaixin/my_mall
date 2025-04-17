const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { errorHandler } = require('./middlewares/errorHandler');
const routes = require('./routes');

// 创建Express应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// 静态文件目录
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

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