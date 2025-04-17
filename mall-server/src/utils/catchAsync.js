/**
 * 异步函数错误捕获工具
 * 包装异步控制器函数，自动捕获并传递错误到全局错误处理中间件
 * @param {Function} fn - 需要包装的异步控制器函数
 * @returns {Function} - 返回包装后的异步函数
 */
const catchAsync = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

module.exports = catchAsync; 