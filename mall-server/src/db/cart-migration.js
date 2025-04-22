/**
 * 购物车数据库迁移脚本
 * 创建cart表
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

async function migrateCartTable() {
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

        console.log('连接到数据库成功，开始检查购物车表结构...');

        // 查看数据库中存在的表
        console.log('检查数据库中的表结构...');
        const [tables] = await connection.execute('SHOW TABLES');
        const tableNames = tables.map(table => Object.values(table)[0]);
        console.log('当前数据库中的表:', tableNames.join(', '));

        // 检查用户表和商品表的主键类型
        console.log('检查用户表和商品表结构以确保兼容性...');
        let userIdType = 'INT'; // 默认
        let goodsIdType = 'INT'; // 默认

        try {
            // 查询用户表的id字段类型
            const [userColumns] = await connection.execute('DESCRIBE users id');
            if (userColumns.length > 0) {
                userIdType = userColumns[0].Type;
                console.log(`用户表ID字段类型: ${userIdType}`);
            }
        } catch (err) {
            console.warn('无法获取用户表结构，使用默认INT类型:', err.message);
        }

        try {
            // 查询商品表的id字段类型
            const [goodsColumns] = await connection.execute('DESCRIBE goods id');
            if (goodsColumns.length > 0) {
                goodsIdType = goodsColumns[0].Type;
                console.log(`商品表ID字段类型: ${goodsIdType}`);
            }
        } catch (err) {
            console.warn('无法获取商品表结构，使用默认INT类型:', err.message);
        }

        // 检查cart表是否存在
        const [cartTables] = await connection.execute(
            "SHOW TABLES LIKE 'cart'"
        );

        if (cartTables.length === 0) {
            console.log('创建购物车表...');

            // 创建购物车表，根据users和goods表的ID类型自动调整
            const createTableSQL = `
                CREATE TABLE cart (
                    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
                    user_id ${userIdType} NOT NULL COMMENT '用户ID',
                    goods_id ${goodsIdType} NOT NULL COMMENT '商品ID',
                    count INT UNSIGNED NOT NULL DEFAULT 1 COMMENT '商品数量',
                    selected TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否选中',
                    add_time BIGINT NOT NULL COMMENT '添加时间',
                    update_time BIGINT NOT NULL COMMENT '更新时间',
                    is_delete TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否删除',
                    PRIMARY KEY (id),
                    INDEX idx_user_id (user_id),
                    INDEX idx_goods_id (goods_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='购物车表';
            `;

            await connection.execute(createTableSQL);
            console.log('购物车表创建成功（无外键约束）');

            // 尝试添加外键（如果索引数量允许）
            try {
                console.log('尝试添加外键约束...');

                // 添加用户外键
                await connection.execute(`
                    ALTER TABLE cart 
                    ADD CONSTRAINT fk_cart_user 
                    FOREIGN KEY (user_id) 
                    REFERENCES users(id) 
                    ON DELETE CASCADE
                `);
                console.log('用户外键添加成功');

                // 添加商品外键
                await connection.execute(`
                    ALTER TABLE cart 
                    ADD CONSTRAINT fk_cart_goods 
                    FOREIGN KEY (goods_id) 
                    REFERENCES goods(id) 
                    ON DELETE CASCADE
                `);
                console.log('商品外键添加成功');
            } catch (err) {
                console.warn('无法添加外键约束（可能是由于索引数量限制）:', err.message);
                console.log('购物车表已创建，但没有外键约束。这不会影响基本功能。');
            }
        } else {
            console.log('购物车表已存在，跳过创建');
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
migrateCartTable(); 