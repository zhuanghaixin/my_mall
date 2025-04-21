// 工具函数

/**
 * 格式化时间
 * @param {Date} date - 日期对象
 * @param {string} format - 格式字符串，如'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的时间字符串
 */
const formatTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
    if (!date) {
        return '';
    }

    if (typeof date === 'string') {
        date = new Date(date.replace(/-/g, '/'));
    }

    if (typeof date === 'number') {
        date = new Date(date);
    }

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();

    return format
        .replace('YYYY', year)
        .replace('MM', formatNumber(month))
        .replace('DD', formatNumber(day))
        .replace('HH', formatNumber(hour))
        .replace('mm', formatNumber(minute))
        .replace('ss', formatNumber(second));
};

/**
 * 格式化数字
 * @param {number} n - 数字
 * @returns {string} 格式化后的字符串，如1 => '01'
 */
const formatNumber = (n) => {
    n = n.toString();
    return n[1] ? n : `0${n}`;
};

/**
 * 获取查询参数
 * @param {string} url - URL字符串
 * @returns {Object} 查询参数对象
 */
const getQueryParams = (url) => {
    if (!url || url.indexOf('?') === -1) {
        return {};
    }

    const search = url.split('?')[1];
    const pairs = search.split('&');
    const params = {};

    pairs.forEach(pair => {
        const [key, value] = pair.split('=');
        params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });

    return params;
};

/**
 * 提示框
 * @param {string} title - 提示内容
 * @param {string} icon - 图标类型，可选值为'success', 'error', 'loading', 'none'
 * @param {number} duration - 提示框显示时间，单位ms
 */
const showToast = (title, icon = 'none', duration = 1500) => {
    return new Promise((resolve) => {
        wx.showToast({
            title,
            icon,
            duration,
            success: resolve
        });
    });
};

/**
 * 确认框
 * @param {string} title - 标题
 * @param {string} content - 内容
 * @param {boolean} showCancel - 是否显示取消按钮
 * @param {string} confirmText - 确认按钮文本
 * @param {string} cancelText - 取消按钮文本
 * @returns {Promise<boolean>} 确认框结果，true表示点击确认，false表示点击取消
 */
const showConfirm = (title, content, showCancel = true, confirmText = '确定', cancelText = '取消') => {
    return new Promise((resolve) => {
        wx.showModal({
            title,
            content,
            showCancel,
            confirmText,
            cancelText,
            success: (res) => {
                resolve(res.confirm);
            }
        });
    });
};

/**
 * 深度克隆对象
 * @param {*} obj - 要克隆的对象
 * @returns {*} 克隆后的对象
 */
const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }

    if (obj instanceof Array) {
        return obj.map(item => deepClone(item));
    }

    if (obj instanceof Object) {
        const copy = {};
        Object.keys(obj).forEach(key => {
            copy[key] = deepClone(obj[key]);
        });
        return copy;
    }

    throw new Error('无法深度克隆该对象');
};

/**
 * 格式化价格
 * @param {number} price - 价格
 * @param {number} digits - 小数位数
 * @returns {string} 格式化后的价格字符串
 */
const formatPrice = (price, digits = 2) => {
    if (typeof price !== 'number') {
        price = parseFloat(price) || 0;
    }

    return price.toFixed(digits);
};

module.exports = {
    formatTime,
    formatNumber,
    getQueryParams,
    showToast,
    showConfirm,
    deepClone,
    formatPrice
}; 