/**
 * 上传控制器
 * 处理文件上传相关的业务逻辑
 */
const path = require('path');
const fs = require('fs');
const catchAsync = require('../utils/catchAsync');
const { ValidationError } = require('../utils/errorTypes');
const logger = require('../utils/logger');

/**
 * @swagger
 * /api/upload/image:
 *   post:
 *     summary: 上传单张图片
 *     description: 上传单张图片到服务器
 *     tags: [上传]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 图片文件
 *     responses:
 *       200:
 *         description: 上传成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 上传成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       description: 文件访问URL
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
exports.uploadImage = catchAsync(async (req, res) => {
    if (!req.file) {
        throw new ValidationError('没有上传文件或文件上传失败');
    }

    // 生成文件访问路径
    const relativeFilePath = path.relative(path.join(__dirname, '../../public'), req.file.path);
    const fileUrl = `${req.protocol}://${req.get('host')}/${relativeFilePath.replace(/\\/g, '/')}`;

    logger.info(`文件上传成功: ${req.file.originalname} -> ${req.file.filename}`);

    res.status(200).json({
        code: 200,
        message: '上传成功',
        data: {
            url: fileUrl,
            filename: req.file.filename,
            originalname: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        }
    });
});

/**
 * @swagger
 * /api/upload/images:
 *   post:
 *     summary: 上传多张图片
 *     description: 批量上传多张图片到服务器
 *     tags: [上传]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - files
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 图片文件数组
 *     responses:
 *       200:
 *         description: 上传成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 上传成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     urls:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: 文件访问URL数组
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
exports.uploadImages = catchAsync(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        throw new ValidationError('没有上传文件或文件上传失败');
    }

    // 生成所有文件的访问路径
    const fileUrls = req.files.map(file => {
        const relativeFilePath = path.relative(path.join(__dirname, '../../public'), file.path);
        return `${req.protocol}://${req.get('host')}/${relativeFilePath.replace(/\\/g, '/')}`;
    });

    logger.info(`批量上传成功: ${req.files.length}个文件`);

    res.status(200).json({
        code: 200,
        message: '上传成功',
        data: {
            urls: fileUrls,
            files: req.files.map(file => ({
                filename: file.filename,
                originalname: file.originalname,
                size: file.size,
                mimetype: file.mimetype
            }))
        }
    });
}); 