/**
 * 中间件索引文件
 * 集中导出所有中间件
 */

const { errorHandler } = require('./errorHandler');
const { protect, restrictTo } = require('./authMiddleware');

module.exports = {
    errorHandler,
    protect,
    restrictTo
}; 