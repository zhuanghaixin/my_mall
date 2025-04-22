/**
 * Swagger配置文件
 * 提供API文档定义和配置
 */
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

// Swagger定义
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: '商城小程序API文档',
            version: '1.0.0',
            description: '商城小程序后端API服务接口文档',
            contact: {
                name: '开发团队',
                email: 'dev@example.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 8080}`,
                description: '开发环境服务器'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    // API文件路径
    apis: [
        path.join(__dirname, '../routes/*.js'),
        path.join(__dirname, '../routes/admin/*.js'),
        path.join(__dirname, '../routes/api/*.js'),
        path.join(__dirname, '../controllers/*.js'),
        path.join(__dirname, '../models/*.js')
    ]
};

// 初始化swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec; 