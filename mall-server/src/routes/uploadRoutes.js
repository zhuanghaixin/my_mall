/**
 * 文件上传相关路由
 * 
 * @swagger
 * tags:
 *   - name: 上传
 *     description: 文件上传相关的操作
 */
const express = require('express');
const uploadController = require('../controllers/uploadController');
const upload = require('../middlewares/upload');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// 所有上传路由都需要用户身份验证
router.use(protect);

/**
 * @swagger
 * /api/upload/verify:
 *   post:
 *     summary: 验证文件上传状态及已上传分片
 *     tags: [上传]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: body
 *         name: verifyInfo
 *         description: 验证信息
 *         schema:
 *           type: object
 *           required:
 *             - filename
 *             - totalChunks
 *           properties:
 *             filename:
 *               type: string
 *             totalChunks:
 *               type: number
 */
router.post('/verify', uploadController.verifyUpload);

/**
 * @swagger
 * /api/upload/image:
 *   post:
 *     summary: 上传单张图片
 *     tags: [上传]
 *     security:
 *       - bearerAuth: []
 */
router.post('/image', upload.single('file'), uploadController.uploadImage);

/**
 * @swagger
 * /api/upload/images:
 *   post:
 *     summary: 上传多张图片
 *     tags: [上传]
 *     security:
 *       - bearerAuth: []
 */
router.post('/images', upload.array('files', 10), uploadController.uploadImages);

/**
 * @swagger
 * /api/upload/list:
 *   get:
 *     summary: 获取上传文件列表
 *     tags: [上传]
 *     security:
 *       - bearerAuth: []
 */
router.get('/list', uploadController.getUploadList);

/**
 * @swagger
 * /api/upload/chunk:
 *   post:
 *     summary: 上传文件分片
 *     tags: [上传]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: formData
 *         name: chunk
 *         type: file
 *         description: 文件分片
 *       - in: formData
 *         name: index
 *         type: string
 *         description: 分片索引
 *       - in: formData
 *         name: filename
 *         type: string
 *         description: 原始文件名
 *       - in: formData
 *         name: totalChunks
 *         type: string
 *         description: 总分片数
 */
router.post('/chunk', upload.chunkUpload.single('chunk'), uploadController.uploadChunk);

/**
 * @swagger
 * /api/upload/merge:
 *   post:
 *     summary: 合并文件分片
 *     tags: [上传]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: body
 *         name: mergeInfo
 *         description: 合并信息
 *         schema:
 *           type: object
 *           required:
 *             - filename
 *             - totalChunks
 *           properties:
 *             filename:
 *               type: string
 *             totalChunks:
 *               type: number
 */
router.post('/merge', uploadController.mergeChunks);

module.exports = router; 