/**
 * 上传控制器
 * 处理文件上传相关的业务逻辑
 */
const path = require('path');
const fs = require('fs');
const catchAsync = require('../utils/catchAsync');
const { ValidationError } = require('../utils/errorTypes');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

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
 * 获取文件唯一标识，优先使用fileHash，如果没有则使用filename
 * 以保持向后兼容性
 * @param {Object} req - 请求对象
 * @returns {string} - 文件唯一标识
 */
const getFileKey = (req) => {
    return req.body.fileHash || req.body.filename;
};

/**
 * 获取最终文件名，使用fileHash+扩展名或自动生成唯一名称
 * @param {Object} req - 请求对象 
 * @returns {string} - 最终文件名
 */
const getFinalFileName = (req) => {
    const fileExt = path.extname(req.body.filename);

    if (req.body.fileHash) {
        // 如果有文件哈希，直接使用哈希作为文件名
        return `${req.body.fileHash}${fileExt}`;
    } else {
        // 否则使用时间戳+UUID生成唯一文件名
        return `${Date.now()}-${uuidv4()}${fileExt}`;
    }
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

/**
 * 验证文件上传状态及已上传分片
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.verifyUpload = catchAsync(async (req, res) => {
    const { filename, totalChunks, fileHash } = req.body;

    if (!filename || !totalChunks) {
        throw new ValidationError('参数不完整');
    }

    // 获取文件唯一标识（fileHash或filename）
    const fileKey = getFileKey(req);

    // 如果有fileHash，先检查是否可以秒传（完整文件是否已存在）
    if (fileHash) {
        const fileExt = path.extname(filename);
        const finalFilePath = path.join(__dirname, `../../public/uploads/${fileHash}${fileExt}`);

        if (fs.existsSync(finalFilePath)) {
            // 文件已存在，可以秒传
            const baseUrl = getBaseUrl(req);
            const fileUrl = `${baseUrl}/uploads/${fileHash}${fileExt}`;

            return res.status(200).json({
                code: 200,
                success: true,
                message: '文件已存在，可以秒传',
                data: {
                    uploaded: true,
                    url: fileUrl
                }
            });
        }
    }

    // 检查分片目录是否存在
    const chunkDir = path.join(__dirname, `../../public/uploads/chunks/${fileKey}`);
    const uploadedChunks = [];

    // 如果目录存在，检查已上传的分片
    if (fs.existsSync(chunkDir)) {
        // 读取目录中的所有文件
        const files = fs.readdirSync(chunkDir);

        // 检查每个分片是否存在，只处理有效的数字索引文件
        for (let i = 0; i < parseInt(totalChunks); i++) {
            const indexStr = i.toString();
            if (files.includes(indexStr)) {
                uploadedChunks.push(i);
            }
        }
    }

    res.status(200).json({
        code: 200,
        success: true,
        message: '验证成功',
        data: {
            uploaded: false,
            uploadedChunks
        }
    });
});

/**
 * 处理大文件上传的分片
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.uploadChunk = catchAsync(async (req, res) => {
    if (!req.file) {
        throw new ValidationError('没有接收到分片文件');
    }

    // 获取参数
    const { index, filename, totalChunks, fileHash } = req.body;

    if (!index || !filename || !totalChunks) {
        throw new ValidationError('参数不完整');
    }

    // 验证索引是有效的数字
    const chunkIndex = parseInt(index);
    if (isNaN(chunkIndex) || chunkIndex < 0 || chunkIndex >= parseInt(totalChunks)) {
        throw new ValidationError(`无效的分片索引: ${index}`);
    }

    // 获取文件唯一标识（fileHash或filename）
    const fileKey = getFileKey(req);

    // 创建临时目录，用于存储分片
    const chunkDir = path.join(__dirname, `../../public/uploads/chunks/${fileKey}`);
    if (!fs.existsSync(chunkDir)) {
        fs.mkdirSync(chunkDir, { recursive: true });
    }

    // 移动分片到目标目录，确保使用索引作为文件名
    const chunkPath = path.join(chunkDir, `${chunkIndex}`);
    fs.renameSync(req.file.path, chunkPath);

    // 检查已经上传的分片数量（只计算有效分片）
    const files = fs.readdirSync(chunkDir);
    const validFiles = files.filter(file => {
        const idx = parseInt(file);
        return !isNaN(idx) && idx >= 0 && idx < parseInt(totalChunks);
    });
    const uploadedCount = validFiles.length;

    res.status(200).json({
        code: 200,
        success: true,
        message: '分片上传成功',
        data: {
            uploadedCount,
            totalChunks: parseInt(totalChunks)
        }
    });
});

/**
 * 合并上传的文件分片
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.mergeChunks = catchAsync(async (req, res) => {
    const { filename, totalChunks, fileHash } = req.body;

    if (!filename || !totalChunks) {
        throw new ValidationError('参数不完整');
    }

    // 获取文件唯一标识（fileHash或filename）
    const fileKey = getFileKey(req);

    const chunkDir = path.join(__dirname, `../../public/uploads/chunks/${fileKey}`);
    if (!fs.existsSync(chunkDir)) {
        throw new ValidationError('没有找到分片文件');
    }

    // 获取目录中的所有文件
    const allFiles = fs.readdirSync(chunkDir);

    // 过滤出有效的数字索引文件
    const validFiles = allFiles.filter(file => {
        // 只保留能转换为有效数字的文件名，且数字在有效范围内
        const index = parseInt(file);
        return !isNaN(index) && index >= 0 && index < parseInt(totalChunks);
    });

    // 检查所有分片是否都已上传
    if (validFiles.length !== parseInt(totalChunks)) {
        // 记录日志，帮助排查问题
        logger.warn(`分片数量不匹配：目录中有 ${allFiles.length} 个文件，其中有效分片 ${validFiles.length}，预期分片 ${totalChunks}`);
        logger.warn(`目录中的所有文件: ${JSON.stringify(allFiles)}`);

        return res.status(200).json({
            code: 400,
            success: false,
            message: `分片数量不匹配，有效分片 ${validFiles.length}/${totalChunks}`,
            data: {
                uploadedChunks: validFiles.map(file => parseInt(file)),
                allFiles: allFiles // 返回所有文件，帮助前端调试
            }
        });
    }

    // 生成最终文件名
    const uniqueFileName = fileHash ?
        `${fileHash}${path.extname(filename)}` :
        `${Date.now()}-${uuidv4()}${path.extname(filename)}`;

    const filePath = path.join(__dirname, `../../public/uploads/${uniqueFileName}`);

    // 创建写入流
    const writeStream = fs.createWriteStream(filePath);

    // 按顺序合并分片
    for (let i = 0; i < parseInt(totalChunks); i++) {
        const chunkPath = path.join(chunkDir, `${i}`);
        if (fs.existsSync(chunkPath)) {
            // 同步读取分片内容并写入
            const chunkData = fs.readFileSync(chunkPath);
            writeStream.write(chunkData);

            // 删除已合并的分片
            fs.unlinkSync(chunkPath);
        } else {
            logger.error(`分片 ${i} 不存在`);
            // 关闭写入流，清理已生成的文件
            writeStream.end();
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            return res.status(200).json({
                code: 400,
                success: false,
                message: `合并失败，分片 ${i} 不存在`,
                data: {
                    uploadedChunks: validFiles.map(file => parseInt(file))
                }
            });
        }
    }

    // 关闭写入流
    writeStream.end();

    // 删除分片目录
    fs.rmdirSync(chunkDir, { recursive: true });

    // 生成文件URL
    const baseUrl = getBaseUrl(req);
    const fileUrl = `${baseUrl}/uploads/${uniqueFileName}`;

    // 记录日志
    logger.info(`大文件上传成功: ${filename} -> ${uniqueFileName}`);

    res.status(200).json({
        code: 200,
        success: true,
        url: fileUrl,
        message: '文件合并成功'
    });
}); 