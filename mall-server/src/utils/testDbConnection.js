/**
 * 数据库连接测试工具
 * 用于单独测试数据库连接，不依赖于应用程序
 */
require('dotenv').config({ path: './.env.development' });
const mysql = require('mysql2/promise');
const logger = require('./logger');

// 从环境变量获取数据库配置
const {
    DB_HOST,
    DB_PORT,
    DB_NAME,
    DB_USER,
    DB_PASSWORD
} = process.env;

async function testConnection() {
    console.log('开始测试数据库连接...');
    console.log(`连接信息: ${DB_HOST}:${DB_PORT}, 数据库: ${DB_NAME}, 用户: ${DB_USER}`);

    try {
        // 先尝试不指定数据库名连接
        const rootConnection = await mysql.createConnection({
            host: DB_HOST,
            port: DB_PORT,
            user: DB_USER,
            password: DB_PASSWORD
        });

        console.log('基本连接成功!');

        // 检查数据库是否存在
        const [databases] = await rootConnection.query('SHOW DATABASES');
        const dbExists = databases.some(db => db.Database === DB_NAME);

        if (!dbExists) {
            console.log(`数据库 '${DB_NAME}' 不存在，正在创建...`);
            await rootConnection.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`);
            console.log(`数据库 '${DB_NAME}' 创建成功!`);
        } else {
            console.log(`数据库 '${DB_NAME}' 已存在`);
        }

        await rootConnection.end();

        // 尝试连接到指定数据库
        const dbConnection = await mysql.createConnection({
            host: DB_HOST,
            port: DB_PORT,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME
        });

        console.log(`成功连接到数据库 '${DB_NAME}'!`);
        await dbConnection.end();

        return true;
    } catch (error) {
        console.error('数据库连接失败:', error.message);
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('连接被拒绝: 用户名或密码错误');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('连接被拒绝: 请确认MySQL服务正在运行');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error(`数据库 '${DB_NAME}' 不存在`);
        }
        console.error('完整错误信息:', error);
        return false;
    }
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
    testConnection()
        .then(success => {
            if (success) {
                console.log('数据库连接测试完成: 成功');
                process.exit(0);
            } else {
                console.log('数据库连接测试完成: 失败');
                process.exit(1);
            }
        })
        .catch(err => {
            console.error('测试过程中出错:', err);
            process.exit(1);
        });
}

module.exports = testConnection; 