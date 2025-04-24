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

module.exports = router; 