/**
 * 用户路由测试脚本
 * 用于排查用户管理接口404问题
 */
const express = require('express');
const app = express();

console.log('=============== 开始测试用户路由 ===============');

// 导入路由
console.log('正在导入路由文件...');
const indexRoutes = require('./src/routes/index');
const adminRoutes = require('./src/routes/admin');
const userRoutes = require('./src/routes/admin/userRoutes');

console.log('路由文件导入完成');
console.log(`indexRoutes是否存在: ${!!indexRoutes}`);
console.log(`adminRoutes是否存在: ${!!adminRoutes}`);
console.log(`userRoutes是否存在: ${!!userRoutes}`);

// 配置路由
app.use('/api', indexRoutes);

// 打印所有注册的路由
console.log('\n=============== 路由列表 ===============');
console.log('主路由：');
function printRoutes(stack, basePath = '') {
    stack.forEach(layer => {
        if (layer.route) {
            const methods = Object.keys(layer.route.methods)
                .filter(method => layer.route.methods[method])
                .map(method => method.toUpperCase())
                .join(', ');
            console.log(`${methods} ${basePath}${layer.route.path}`);
        } else if (layer.name === 'router' && layer.handle.stack) {
            // 递归打印子路由
            let routerPath = basePath;
            if (layer.regexp && typeof layer.regexp.toString === 'function') {
                const match = layer.regexp.toString().match(/^\/\^\\\/([^\\]+)/);
                if (match) {
                    routerPath = basePath + '/' + match[1];
                }
            }
            console.log(`\n子路由 (${routerPath}):`);
            printRoutes(layer.handle.stack, routerPath);
        }
    });
}

printRoutes(indexRoutes.stack, '/api');

console.log('\n=============== 用户路由注册检查 ===============');
console.log(`adminModuleRoutes 是否存在: ${!!adminRoutes}`);

if (adminRoutes && adminRoutes.stack) {
    console.log('管理后台路由堆栈中的路由器数量:', adminRoutes.stack.length);
    adminRoutes.stack.forEach((layer, index) => {
        console.log(`路由 ${index + 1}:`);
        console.log(`  路径: ${layer.regexp}`);
        console.log(`  处理程序: ${layer.name}`);
        console.log(`  处理程序类型: ${typeof layer.handle}`);

        // 尝试识别路由路径
        if (layer.regexp && typeof layer.regexp.toString === 'function') {
            const regexp = layer.regexp.toString();
            console.log(`  正则表达式: ${regexp}`);

            const match = regexp.match(/^\/\^\\\/([^\\]+)/);
            if (match) {
                console.log(`  匹配的路径: /${match[1]}`);
            }
        }

        if (layer.name === 'router' && layer.handle && layer.handle.stack) {
            console.log(`  子路由数量: ${layer.handle.stack.length}`);
            // 打印子路由信息
            layer.handle.stack.forEach((sublayer, subIndex) => {
                console.log(`    子路由 ${subIndex + 1}:`);
                console.log(`      路径: ${sublayer.regexp}`);
                if (sublayer.route) {
                    const methods = Object.keys(sublayer.route.methods)
                        .filter(method => sublayer.route.methods[method])
                        .map(method => method.toUpperCase())
                        .join(', ');
                    console.log(`      方法: ${methods}`);
                    console.log(`      路由路径: ${sublayer.route.path}`);
                }
            });
        }
    });
} else {
    console.log('管理后台路由对象不完整或为空');
}

// 单独检查用户路由
console.log('\n=============== 单独检查用户路由 ===============');
if (userRoutes && userRoutes.stack) {
    console.log('用户管理路由堆栈中的路由数量:', userRoutes.stack.length);
    userRoutes.stack.forEach((layer, index) => {
        console.log(`路由 ${index + 1}:`);
        if (layer.route) {
            const methods = Object.keys(layer.route.methods)
                .filter(method => layer.route.methods[method])
                .map(method => method.toUpperCase())
                .join(', ');
            console.log(`  方法: ${methods}`);
            console.log(`  路径: ${layer.route.path}`);
        }
    });
} else {
    console.log('用户路由对象不完整或为空');
}

console.log('\n=============== 检查预期URL路径 ===============');
console.log('预期路径1: /api/admin/user/list');
console.log('预期路径2: /api/admin/user/:id');
console.log('预期路径3: /api/admin/user/:id/status');
console.log('预期路径4: /api/admin/user/:id/reset-password');

console.log('\n测试完成. 如果您看不到用户路由注册，请检查路由文件的导出和导入。'); 