/**
 * 工具函数模块
 */

/**
 * 格式化时间
 */
const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

/**
 * 数字补零
 */
const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : `0${n}`
}

/**
 * 显示加载提示
 */
const showLoading = (title = '加载中...') => {
    wx.showLoading({
        title: title,
        mask: true
    })
}

/**
 * 隐藏加载提示
 */
const hideLoading = () => {
    wx.hideLoading()
}

/**
 * 显示成功提示
 */
const showSuccessToast = (msg = '成功') => {
    wx.showToast({
        title: msg,
        icon: 'success',
        duration: 1500
    })
}

/**
 * 显示错误提示
 */
const showErrorToast = (msg = '发生错误') => {
    wx.showToast({
        title: msg,
        icon: 'error',
        duration: 1500
    })
}

/**
 * 显示普通提示
 */
const showToast = (msg = '', icon = 'none') => {
    wx.showToast({
        title: msg,
        icon: icon,
        duration: 1500
    })
}

/**
 * 价格格式化，保留两位小数
 */
const formatPrice = (price) => {
    return parseFloat(price).toFixed(2)
}

/**
 * 判断对象是否为空
 */
const isEmptyObject = (obj) => {
    if (!obj) return true;
    for (let key in obj) {
        return false;
    }
    return true;
}

/**
 * 防抖函数
 */
const debounce = (func, wait = 500) => {
    let timeout;
    return function () {
        let context = this;
        let args = arguments;
        clearTimeout(timeout)
        timeout = setTimeout(() => {
            func.apply(context, args)
        }, wait)
    }
}

/**
 * 节流函数
 */
const throttle = (func, wait = 500) => {
    let timeout;
    return function () {
        let context = this;
        let args = arguments;
        if (!timeout) {
            timeout = setTimeout(() => {
                timeout = null;
                func.apply(context, args)
            }, wait)
        }
    }
}

/**
 * 获取当前页面路径
 */
const getCurrentPageUrl = () => {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const url = currentPage.route
    return url
}

/**
 * 获取当前页面带参数的完整路径
 */
const getCurrentPageUrlWithArgs = () => {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const url = currentPage.route
    const options = currentPage.options

    let urlWithArgs = `/${url}?`
    for (let key in options) {
        let value = options[key]
        urlWithArgs += `${key}=${value}&`
    }
    urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length - 1)
    return urlWithArgs
}

module.exports = {
    formatTime,
    formatNumber,
    showLoading,
    hideLoading,
    showSuccessToast,
    showErrorToast,
    showToast,
    formatPrice,
    isEmptyObject,
    debounce,
    throttle,
    getCurrentPageUrl,
    getCurrentPageUrlWithArgs
} 