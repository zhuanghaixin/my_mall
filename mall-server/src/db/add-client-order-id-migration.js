/**
 * 订单表迁移脚本
 * 添加client_order_id列到orders表
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

async function migrateOrdersTable() {
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

        console.log('连接到数据库成功，开始检查orders表结构...');

        // 检查orders表是否存在
        const [ordersTables] = await connection.execute(
            "SHOW TABLES LIKE 'orders'"
        );

        if (ordersTables.length === 0) {
            console.error('错误: orders表不存在，请先创建订单表！');
            return;
        }

        // 检查client_order_id列是否已经存在
        const [columns] = await connection.execute('SHOW COLUMNS FROM orders LIKE "client_order_id"');
        
        if (columns.length === 0) {
            console.log('添加client_order_id列到orders表...');

            // 添加client_order_id列
            await connection.execute(`
                ALTER TABLE orders 
                ADD COLUMN client_order_id VARCHAR(100) DEFAULT NULL COMMENT '客户端订单ID，用于幂等性处理' 
                AFTER user_id
            `);
            
            console.log('client_order_id列添加成功');

            // 创建联合唯一索引 - 根据MySQL版本选择合适的语法
            try {
                console.log('尝试创建索引...');
                // 先检查MySQL版本
                const [versionResult] = await connection.execute('SELECT VERSION() as version');
                const mysqlVersion = versionResult[0].version;
                const majorVersion = parseInt(mysqlVersion.split('.')[0], 10);
                
                if (majorVersion >= 8) {
                    // MySQL 8.0+ 支持带WHERE条件的索引
                    await connection.execute(`
                        CREATE UNIQUE INDEX idx_user_client_order_id 
                        ON orders (user_id, client_order_id) 
                        WHERE client_order_id IS NOT NULL
                    `);
                } else {
                    // 较旧版本不支持WHERE条件，创建普通索引
                    await connection.execute(`
                        CREATE INDEX idx_user_client_order_id 
                        ON orders (user_id, client_order_id)
                    `);
                    console.log('警告: 创建了普通索引，请在应用代码中处理NULL值');
                }
                
                console.log('索引创建成功');
            } catch (err) {
                console.warn('创建索引失败:', err.message);
                console.log('列已添加，但索引创建失败。请手动创建索引或检查日志。');
            }
        } else {
            console.log('client_order_id列已存在，跳过添加');
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
migrateOrdersTable();
