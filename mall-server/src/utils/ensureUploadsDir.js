/**
 * 确保上传目录存在
 * 这个工具用于创建必要的上传目录结构，并准备示例图片
 */
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * 确保目录存在，如果不存在则创建
 * @param {string} dirPath 目录路径
 */
const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        try {
            fs.mkdirSync(dirPath, { recursive: true });
            logger.info(`目录创建成功: ${dirPath}`);
        } catch (error) {
            logger.error(`创建目录失败: ${dirPath}，错误: ${error.message}`);
        }
    }
};

/**
 * 创建一个简单的示例图片
 * 注意：这只是为了演示，实际应用中通常会使用真实图片文件
 * @param {string} filePath 文件路径
 * @param {string} color 填充颜色
 * @param {string} text 显示文本
 */
const createSampleSVG = (filePath, color, text) => {
    if (!fs.existsSync(filePath)) {
        const svgContent = `<svg width="750" height="350" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="${color}" />
            <text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">${text}</text>
        </svg>`;

        try {
            fs.writeFileSync(filePath, svgContent);
            logger.info(`示例图片创建成功: ${filePath}`);
        } catch (error) {
            logger.error(`创建示例图片失败: ${filePath}，错误: ${error.message}`);
        }
    }
};

/**
 * 确保所有必要的上传目录存在
 */
const ensureUploadDirectories = () => {
    const publicDir = path.join(process.cwd(), 'public');
    const uploadsDir = path.join(publicDir, 'uploads');
    const bannersDir = path.join(uploadsDir, 'banners');

    // 创建目录结构
    ensureDirectoryExists(publicDir);
    ensureDirectoryExists(uploadsDir);
    ensureDirectoryExists(bannersDir);

    // 创建示例轮播图图片
    const bannerColors = ['#FF5733', '#33A8FF', '#33FF57', '#A033FF', '#FF33A8'];
    const bannerTexts = ['新品上市', '限时折扣', '热门推荐', '夏季专享', '品牌特卖'];

    for (let i = 1; i <= 5; i++) {
        const filePath = path.join(bannersDir, `banner${i}.jpg`);
        createSampleSVG(filePath, bannerColors[i - 1], bannerTexts[i - 1]);
    }

    logger.info('上传目录和示例文件准备完成');
};

module.exports = ensureUploadDirectories; 