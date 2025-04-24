// 环境配置文件
const ENV = {
    // 开发环境
    development: {
        apiHost: 'http://127.0.0.1',
        apiPort: '8080',
        apiPrefix: '/api',
        envName: 'development',
        envVersion: 'develop'
    },
    // 测试环境
    testing: {
        apiHost: 'http://192.168.0.131',
        apiPort: '8080',
        apiPrefix: '/api',
        envName: 'testing',
        envVersion: 'trial'
    },
    // 生产环境
    production: {
        apiHost: 'https://api.example.com',
        apiPort: '443',
        apiPrefix: '/api',
        envName: 'production',
        envVersion: 'release'
    }
};

// 获取当前环境
const getEnv = () => {
    // 默认环境为开发环境
    let currentEnv = 'development';

    // 检查是否有全局环境变量设置
    if (typeof __wxConfig !== 'undefined' && __wxConfig.envVersion) {
        // 根据小程序运行环境判断
        switch (__wxConfig.envVersion) {
            case 'develop':
                currentEnv = 'development';
                break;
            case 'trial':
                currentEnv = 'testing';
                break;
            case 'release':
                currentEnv = 'production';
                break;
            default:
                currentEnv = 'development';
        }
    }

    // 返回当前环境的配置
    return ENV[currentEnv];
};

// 获取API基础URL
const getApiBaseUrl = (env) => {
    const config = env || getEnv();
    // 根据协议判断使用哪个端口格式
    const isHttps = config.apiHost.startsWith('https://');

    // 如果是标准端口(http:80, https:443)则不显示端口
    if ((isHttps && config.apiPort === '443') || (!isHttps && config.apiPort === '80')) {
        return `${config.apiHost}${config.apiPrefix}`;
    }

    return `${config.apiHost}:${config.apiPort}${config.apiPrefix}`;
};

module.exports = {
    ENV,
    getEnv,
    getApiBaseUrl
}; 