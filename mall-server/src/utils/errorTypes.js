/**
 * 自定义错误类型模块
 * 定义系统中使用的所有自定义错误类型
 */

/**
 * 基础错误类，所有自定义错误继承此类
 */
class AppError extends Error {
    constructor(message, statusCode, errorCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode || 500;
        this.errorCode = errorCode || 'INTERNAL_ERROR';
        this.isOperational = isOperational; // 是否为可预期的操作错误

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * 验证错误 - 用于请求参数验证失败
 */
class ValidationError extends AppError {
    constructor(message) {
        super(
            message || '验证失败',
            400,
            'VALIDATION_ERROR'
        );
    }
}

/**
 * 未找到资源错误
 */
class NotFoundError extends AppError {
    constructor(message, resource) {
        super(
            message || `找不到${resource || '请求的资源'}`,
            404,
            'NOT_FOUND'
        );
        this.resource = resource;
    }
}

/**
 * 未授权错误 - 用户未登录
 */
class UnauthorizedError extends AppError {
    constructor(message) {
        super(
            message || '未授权，请先登录',
            401,
            'UNAUTHORIZED'
        );
    }
}

/**
 * 权限不足错误 - 用户已登录但权限不足
 */
class ForbiddenError extends AppError {
    constructor(message) {
        super(
            message || '权限不足，无法执行此操作',
            403,
            'FORBIDDEN'
        );
    }
}

/**
 * 业务逻辑错误 - 操作不符合业务规则
 */
class BusinessError extends AppError {
    constructor(message, errorCode = 'BUSINESS_ERROR') {
        super(
            message || '操作失败，不符合业务规则',
            400,
            errorCode
        );
    }
}

/**
 * 数据库错误
 */
class DatabaseError extends AppError {
    constructor(message, originalError) {
        super(
            message || '数据库操作失败',
            500,
            'DATABASE_ERROR',
            false // 数据库错误通常不是可预期的操作错误
        );
        this.originalError = originalError;
    }
}

/**
 * 第三方服务错误
 */
class ExternalServiceError extends AppError {
    constructor(message, service, originalError) {
        super(
            message || `第三方服务${service || ''}调用失败`,
            500,
            'EXTERNAL_SERVICE_ERROR',
            false
        );
        this.service = service;
        this.originalError = originalError;
    }
}

/**
 * 请求冲突错误 - 例如资源已存在
 */
class ConflictError extends AppError {
    constructor(message, resource) {
        super(
            message || `${resource || '资源'}已存在或冲突`,
            409,
            'CONFLICT'
        );
        this.resource = resource;
    }
}

/**
 * 请求过多错误 - 用于限流
 */
class TooManyRequestsError extends AppError {
    constructor(message, retryAfter) {
        super(
            message || '请求频率过高，请稍后再试',
            429,
            'TOO_MANY_REQUESTS'
        );
        this.retryAfter = retryAfter;
    }
}

module.exports = {
    AppError,
    ValidationError,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError,
    BusinessError,
    DatabaseError,
    ExternalServiceError,
    ConflictError,
    TooManyRequestsError
}; 