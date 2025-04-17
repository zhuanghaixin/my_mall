/**
 * MySQL密码测试工具
 * 尝试不同的密码格式和认证方式
 */
require('dotenv').config({ path: './.env.development' });
const mysql = require('mysql2/promise');

// 测试不同的密码连接方式
async function testPasswords() {
    const host = process.env.DB_HOST || '127.0.0.1';
    const port = process.env.DB_PORT || 3306;
    const user = process.env.DB_USER || 'root';
    const originalPassword = process.env.DB_PASSWORD || '';

    // 创建测试密码数组
    const passwords = [
        { name: '原始密码', password: originalPassword },
        { name: '空密码', password: '' },
        { name: '密码1', password: 'root' },
        { name: '密码2', password: 'password' }
    ];

    console.log('MySQL连接测试');
    console.log(`主机: ${host}:${port}`);
    console.log(`用户: ${user}`);
    console.log('------------------------');

    for (const passObj of passwords) {
        try {
            console.log(`测试: ${passObj.name} = "${passObj.password}"`);
            const conn = await mysql.createConnection({
                host,
                port,
                user,
                password: passObj.password,
                connectTimeout: 5000,
            });

            console.log(`✅ 使用密码 "${passObj.password}" 连接成功!`);
            await conn.end();

            // 测试是否可以访问数据库
            try {
                const dbConn = await mysql.createConnection({
                    host,
                    port,
                    user,
                    password: passObj.password,
                    database: process.env.DB_NAME,
                    connectTimeout: 5000,
                });

                console.log(`✅ 使用密码 "${passObj.password}" 连接到数据库 "${process.env.DB_NAME}" 成功!`);
                await dbConn.end();
            } catch (dbErr) {
                console.log(`❌ 可以连接服务器，但无法连接到数据库 "${process.env.DB_NAME}": ${dbErr.message}`);
            }

        } catch (err) {
            console.log(`❌ 使用密码 "${passObj.password}" 连接失败: ${err.message}`);
        }
        console.log('------------------------');
    }
}

// 执行测试
testPasswords()
    .catch(err => {
        console.error('测试过程中发生错误:', err);
    }); 