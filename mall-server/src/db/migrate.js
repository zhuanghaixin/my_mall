/**
 * 数据库迁移脚本
 * 添加orders表中缺少的字段
 */
require('dotenv').config();
const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

// 从环境变量获取数据库配置
const {
    DB_HOST,
    DB_PORT,
    DB_NAME,
    DB_USER,
    DB_PASSWORD
} = process.env;

async function migrateDatabase() {
    let connection;
    try {
        // 创建数据库连接
        connection = await mysql.createConnection({
            host: DB_HOST || '127.0.0.1',
            port: parseInt(DB_PORT, 10) || 3306,
            database: DB_NAME,
            user: DB_USER,
            password: DB_PASSWORD
        });

        console.log('连接到数据库成功，开始检查表结构...');

        // 检查delivery_company列是否存在
        const [checkColumns] = await connection.execute(
            "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'orders' AND COLUMN_NAME IN ('delivery_company', 'delivery_number')",
            [DB_NAME]
        );

        const existingColumns = new Set(checkColumns.map(col => col.COLUMN_NAME));

        // 如果缺少delivery_company列，添加它
        if (!existingColumns.has('delivery_company')) {
            console.log('添加 delivery_company 字段到 orders 表...');
            await connection.execute(
                "ALTER TABLE orders ADD COLUMN delivery_company VARCHAR(50) COMMENT '物流公司' AFTER receive_time"
            );
            console.log('delivery_company 字段添加成功');
        } else {
            console.log('delivery_company 字段已存在，跳过');
        }

        // 如果缺少delivery_number列，添加它
        if (!existingColumns.has('delivery_number')) {
            console.log('添加 delivery_number 字段到 orders 表...');
            await connection.execute(
                "ALTER TABLE orders ADD COLUMN delivery_number VARCHAR(50) COMMENT '物流单号' AFTER delivery_company"
            );
            console.log('delivery_number 字段添加成功');
        } else {
            console.log('delivery_number 字段已存在，跳过');
        }

        console.log('数据库迁移完成！');
    } catch (error) {
        console.error('数据库迁移失败:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// 执行迁移
migrateDatabase(); 