/**
 * 微信数据解密工具
 * 用于解密微信登录后获取的加密数据
 */

const crypto = require('crypto');

/**
 * WXBizDataCrypt构造函数
 * @param {string} appId - 小程序appId
 * @param {string} sessionKey - 微信登录后获取的session_key
 */
class WXBizDataCrypt {
    constructor(appId, sessionKey) {
        this.appId = appId;
        this.sessionKey = sessionKey;
    }

    /**
     * 解密数据
     * @param {string} encryptedData - 加密的数据
     * @param {string} iv - 加密算法的初始向量
     * @returns {Object} 解密后的数据
     */
    decryptData(encryptedData, iv) {
        // Base64解码
        const sessionKey = Buffer.from(this.sessionKey, 'base64');
        encryptedData = Buffer.from(encryptedData, 'base64');
        iv = Buffer.from(iv, 'base64');

        try {
            // 解密
            const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, iv);
            // 设置自动padding为true，删除填充补位
            decipher.setAutoPadding(true);
            let decoded = decipher.update(encryptedData, 'binary', 'utf8');
            decoded += decipher.final('utf8');

            const decodedData = JSON.parse(decoded);

            // 校验数据中的appid是否与当前appid一致
            if (decodedData.watermark.appid !== this.appId) {
                throw new Error('数据水印校验失败');
            }

            return decodedData;
        } catch (err) {
            throw new Error('数据解密失败: ' + err.message);
        }
    }
}

module.exports = {
    WXBizDataCrypt
}; 