/**
 * 文件上传中间件
 * 使用multer处理文件上传
 */
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 确保分片上传目录存在
const chunksDir = path.join(__dirname, '../../public/uploads/chunks');
if (!fs.existsSync(chunksDir)) {
    fs.mkdirSync(chunksDir, { recursive: true });
}

// 确保临时上传目录存在
const tempDir = path.join(__dirname, '../../public/uploads/temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// 配置存储
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // 生成唯一文件名，避免文件名冲突
        const uniqueSuffix = uuidv4();
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
    }
});

// 配置分片存储
const chunkStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        // 使用临时文件名
        const uniqueSuffix = uuidv4();
        cb(null, `${uniqueSuffix}-chunk`);
    }
});

// 过滤文件类型
const fileFilter = (req, file, cb) => {
    // 只接受图片文件
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('只允许上传图片文件!'), false);
    }
};

// 不过滤文件类型，用于大文件上传
const chunkFileFilter = (req, file, cb) => {
    cb(null, true);
};

// 创建multer实例
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // 限制2MB
    }
});

// 创建处理分片的multer实例
const chunkUpload = multer({
    storage: chunkStorage,
    fileFilter: chunkFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 限制单个分片5MB
    }
});

module.exports = upload;
module.exports.chunkUpload = chunkUpload; 