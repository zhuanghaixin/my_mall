#!/usr/bin/env node

/**
 * 环境变量验证脚本
 * 确保所有必要的环境变量都已正确定义
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// 获取命令行参数中的环境名称
const envMode = process.argv[2] || 'development';
console.log(`验证 ${envMode} 环境配置...`);

// 需要验证的环境变量列表
const requiredEnvVars = [
    'VITE_APP_TITLE',
    'VITE_API_URL',
    'VITE_USE_MOCK',
    'VITE_USE_DEVTOOLS'
];

// 加载环境文件
const envFile = `.env.${envMode}`;
const envPath = path.resolve(process.cwd(), envFile);

// 检查环境文件是否存在
if (!fs.existsSync(envPath)) {
    console.error(`错误: 环境配置文件 ${envFile} 不存在!`);
    process.exit(1);
}

// 加载环境变量
const envConfig = dotenv.parse(fs.readFileSync(envPath));

// 验证必要的环境变量
const missingVars = [];
for (const envVar of requiredEnvVars) {
    if (!envConfig[envVar]) {
        missingVars.push(envVar);
    }
}

// 如果有缺失的环境变量，输出错误信息并退出
if (missingVars.length > 0) {
    console.error(`错误: 在 ${envFile} 中缺少以下环境变量:`);
    missingVars.forEach(variable => console.error(`- ${variable}`));
    process.exit(1);
}

// 验证通过
console.log(`√ 环境配置验证通过: ${envFile}`);
console.log('环境变量:');
for (const envVar of requiredEnvVars) {
    // 隐藏敏感信息
    const value = envVar.includes('SECRET') || envVar.includes('PASSWORD')
        ? '******'
        : envConfig[envVar];
    console.log(`- ${envVar}: ${value}`);
}

process.exit(0); 