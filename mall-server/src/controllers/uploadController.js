/**
 * 上传控制器
 * 处理文件上传相关的业务逻辑
 */
const path = require('path');
const fs = require('fs');
const catchAsync = require('../utils/catchAsync');
const { ValidationError } = require('../utils/errorTypes');
const logger = require('../utils/logger');

// 获取配置的服务器基础URL，用于生成访问地址
const getBaseUrl = (req) => {
    // 如果设置了SERVER_BASE_URL环境变量，优先使用它
    if (process.env.SERVER_BASE_URL) {
        return process.env.SERVER_BASE_URL;
    }

    // 如果设置了SERVER_DOMAIN环境变量（备案后），使用标准域名形式
    if (process.env.SERVER_DOMAIN) {
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        // 使用标准端口时不显示端口号
        return `${protocol}://${process.env.SERVER_DOMAIN}`;
    }

    // 如果设置了SERVER_IP环境变量（备案前），使用IP+端口形式
    if (process.env.SERVER_IP) {
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const port = process.env.NODE_ENV === 'production' ? '8443' : '8080';
        return `${protocol}://${process.env.SERVER_IP}:${port}`;
    }

    // 回退到请求中的host
    return `${req.protocol}://${req.get('host')}`;
};

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
    const baseUrl = getBaseUrl(req);
    const fileUrl = `${baseUrl}/${relativeFilePath.replace(/\\/g, '/')}`;

    logger.info(`文件上传成功: ${req.file.originalname} -> ${req.file.filename}, URL: ${fileUrl}`);

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
    const baseUrl = getBaseUrl(req);
    const fileUrls = req.files.map(file => {
        const relativeFilePath = path.relative(path.join(__dirname, '../../public'), file.path);
        return `${baseUrl}/${relativeFilePath.replace(/\\/g, '/')}`;
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

/**
 * @swagger
 * /api/upload/list:
 *   get:
 *     summary: 获取上传文件列表
 *     description: 获取已上传的图片文件列表
 *     tags: [上传]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
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
 *                   example: 获取成功
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       filename:
 *                         type: string
 *                         description: 文件名
 *                       url:
 *                         type: string
 *                         description: 文件访问URL
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
exports.getUploadList = catchAsync(async (req, res) => {
    const uploadDir = path.join(__dirname, '../../public/uploads');
    const limit = 20; // 最多返回20个文件

    // 读取上传目录文件
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            logger.error('读取上传目录失败:', err);
            return res.status(500).json({
                code: 500,
                message: '读取文件列表失败',
                error: err.message
            });
        }

        // 过滤出图片文件并按修改时间倒序排序
        const imageFiles = files
            .filter(file => {
                const ext = path.extname(file).toLowerCase();
                return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
            })
            .map(file => {
                const filePath = path.join(uploadDir, file);
                const stats = fs.statSync(filePath);
                return {
                    filename: file,
                    path: filePath,
                    mtime: stats.mtime.getTime()
                };
            })
            .sort((a, b) => b.mtime - a.mtime) // 按修改时间倒序
            .slice(0, limit); // 限制返回数量

        // 构建文件URL
        const baseUrl = getBaseUrl(req);
        const fileList = imageFiles.map(file => {
            const relativeFilePath = path.relative(path.join(__dirname, '../../public'), file.path);
            const fileUrl = `${baseUrl}/${relativeFilePath.replace(/\\/g, '/')}`;

            return {
                filename: file.filename,
                url: fileUrl,
                uploadTime: new Date(file.mtime).toISOString()
            };
        });

        res.status(200).json({
            code: 200,
            message: '获取成功',
            data: fileList
        });
    });
}); 