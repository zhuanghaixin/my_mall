/**
 * 用户路由修复脚本
 * 用于排查和修复用户管理接口404问题
 */
const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

// 检查用户路由问题
console.log('=============== 检查用户路由问题 ===============');

// 记录当前工作目录
console.log('当前工作目录:', process.cwd());

// 1. 检查API前缀设置
console.log('\n1. 检查API前缀设置:');
try {
    const dotenvPath = path.resolve(process.cwd(), '.env.development');
    if (fs.existsSync(dotenvPath)) {
        const dotenvContent = fs.readFileSync(dotenvPath, 'utf8');
        console.log('环境变量文件内容:');
        console.log(dotenvContent);

        // 查找API_PREFIX
        const apiPrefixMatch = dotenvContent.match(/API_PREFIX\s*=\s*(.+)/);
        if (apiPrefixMatch) {
            console.log('API前缀设置为:', apiPrefixMatch[1]);
        } else {
            console.log('未找到API_PREFIX设置，使用默认值: /api');
        }
    } else {
        console.log('环境变量文件不存在:', dotenvPath);
    }
} catch (error) {
    console.error('检查环境变量文件时出错:', error.message);
}

// 2. 检查app.js中的路由挂载
console.log('\n2. 检查app.js中的路由挂载:');
try {
    const appJsPath = path.resolve(process.cwd(), 'src/app.js');
    if (fs.existsSync(appJsPath)) {
        const appJsContent = fs.readFileSync(appJsPath, 'utf8');
        console.log('app.js中的路由挂载代码片段:');

        // 查找路由挂载的行
        const routeMountMatch = appJsContent.match(/app\.use\((.+?), routes\);/);
        if (routeMountMatch) {
            console.log('路由挂载代码:', routeMountMatch[0]);
            console.log('路由前缀:', routeMountMatch[1]);
        } else {
            console.log('未找到路由挂载代码');
        }
    } else {
        console.log('app.js文件不存在:', appJsPath);
    }
} catch (error) {
    console.error('检查app.js文件时出错:', error.message);
}

// 3. 检查前端API调用
console.log('\n3. 检查前端API调用:');
try {
    const userApiPath = path.resolve(process.cwd(), '../mall-admin/src/api/user.ts');
    if (fs.existsSync(userApiPath)) {
        const userApiContent = fs.readFileSync(userApiPath, 'utf8');
        console.log('user.ts中的用户列表API调用:');

        // 查找getUserList函数中的url
        const getUserListMatch = userApiContent.match(/getUserList.+?url:\s*['"](.+?)['"]/s);
        if (getUserListMatch) {
            console.log('getUserList API URL:', getUserListMatch[1]);
        } else {
            console.log('未找到getUserList API调用');
        }
    } else {
        console.log('user.ts文件不存在:', userApiPath);
    }
} catch (error) {
    console.error('检查user.ts文件时出错:', error.message);
}

// 4. 检查后端路由注册
console.log('\n4. 检查后端路由注册:');
try {
    // 检查routes/index.js
    const indexRoutesPath = path.resolve(process.cwd(), 'src/routes/index.js');
    if (fs.existsSync(indexRoutesPath)) {
        const indexRoutesContent = fs.readFileSync(indexRoutesPath, 'utf8');
        console.log('routes/index.js中的路由注册:');

        // 查找adminModuleRoutes的注册
        const adminRoutesMatch = indexRoutesContent.match(/router\.use\(['"](\/admin)['"]\s*,\s*adminModuleRoutes\);/);
        if (adminRoutesMatch) {
            console.log('adminModuleRoutes注册路径:', adminRoutesMatch[1]);
        } else {
            console.log('未找到adminModuleRoutes的注册');
        }
    } else {
        console.log('routes/index.js文件不存在:', indexRoutesPath);
    }

    // 检查routes/admin/index.js
    const adminIndexPath = path.resolve(process.cwd(), 'src/routes/admin/index.js');
    if (fs.existsSync(adminIndexPath)) {
        const adminIndexContent = fs.readFileSync(adminIndexPath, 'utf8');
        console.log('\nroutes/admin/index.js中的用户路由注册:');

        // 查找userRoutes的注册
        const userRoutesMatch = adminIndexContent.match(/router\.use\(['"](\/user)['"]\s*,\s*userRoutes\);/);
        if (userRoutesMatch) {
            console.log('userRoutes注册路径:', userRoutesMatch[1]);
        } else {
            console.log('未找到userRoutes的注册');
        }
    } else {
        console.log('routes/admin/index.js文件不存在:', adminIndexPath);
    }
} catch (error) {
    console.error('检查路由注册文件时出错:', error.message);
}

// 问题分析和解决方案
console.log('\n=============== 问题分析和解决方案 ===============');
console.log('可能的问题和解决方案:');
console.log('1. API路径重复问题: 检查前端API调用是否有重复的/api前缀');
console.log('2. 路由注册问题: 确认后端是否正确注册了用户路由');
console.log('3. 用户控制器问题: 检查userController.js是否正确实现了所有方法');
console.log('4. 建议修复: 将前端API请求中的/api/admin/user修改为/admin/user，或在后端调整路由注册');

console.log('\n推荐修复:');
console.log('前端方案: 修改mall-admin/src/api/user.ts中的API路径，移除重复的/api前缀');
console.log('后端方案: 在src/routes/admin/index.js中确保用户路由正确注册，检查控制器方法实现'); 