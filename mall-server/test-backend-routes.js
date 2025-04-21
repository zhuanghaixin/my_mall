/**
 * 后端路由测试脚本
 * 用于检查后端路由处理的实际路径
 */
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// 中间件
app.use(bodyParser.json());

// 模拟路由处理
// 先注册直接访问路径 (不带/api前缀)
app.get('/admin/user/list', (req, res) => {
    console.log('直接路径 /admin/user/list 被访问');
    res.json({
        code: 200,
        message: '通过直接路径 /admin/user/list 访问成功',
        data: {
            list: [],
            total: 0
        }
    });
});

// 然后注册带/api前缀的路径
app.get('/api/admin/user/list', (req, res) => {
    console.log('带前缀路径 /api/admin/user/list 被访问');
    res.json({
        code: 200,
        message: '通过带前缀路径 /api/admin/user/list 访问成功',
        data: {
            list: [],
            total: 0
        }
    });
});

// 打印请求处理详情的中间件
app.use((req, res, next) => {
    console.log(`收到请求: ${req.method} ${req.url}`);
    console.log('请求参数:', req.query);
    console.log('请求头:', req.headers);

    // 这里不会真正处理请求，只是用来记录请求信息
    res.status(404).json({
        code: 404,
        message: '路径未找到',
        path: req.url
    });
});

// 启动服务器
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`测试服务器运行在 http://localhost:${PORT}`);
    console.log('可用的测试路径:');
    console.log(`1. http://localhost:${PORT}/admin/user/list`);
    console.log(`2. http://localhost:${PORT}/api/admin/user/list`);
    console.log('\n试着访问这些路径，查看后端日志来确定哪个路径会被实际处理');
}); 