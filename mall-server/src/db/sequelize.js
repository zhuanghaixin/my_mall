const { Sequelize } = require('sequelize');
require('dotenv').config();

// 从环境变量获取数据库配置
const {
    DB_HOST,
    DB_PORT,
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    DB_DIALECT
} = process.env;

// 创建Sequelize实例
const sequelize = new Sequelize(
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    {
        host: DB_HOST || '127.0.0.1',
        port: parseInt(DB_PORT, 10) || 3306,
        dialect: DB_DIALECT || 'mysql',
        timezone: '+08:00', // 中国时区
        logging: (process.env.NODE_ENV === 'development')
            ? console.log
            : false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            // 不自动添加时间戳字段
            timestamps: false,
            // 禁止修改表名为复数
            freezeTableName: true,
            // 下划线命名
            underscored: true,
            // 字符集
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci'
        }
    }
);

// 测试连接
sequelize.authenticate()
    .then(() => {
        console.log('数据库连接成功');
    })
    .catch(err => {
        console.error('数据库连接失败:', err);
    });

module.exports = sequelize; 