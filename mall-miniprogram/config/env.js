// 环境配置文件
const ENV = {
    // 开发环境
    development: {
        apiHost: 'http://192.168.0.131',
        apiPort: '8080',
        apiPrefix: '/api',
        envName: 'development',
        envVersion: 'develop'
    },
    // 测试环境
    testing: {
        apiHost: 'https://test-api.example.com',
        apiPort: '443',
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

// 存储当前手动设置的环境
let manualEnv = '';

// 从启动参数或全局变量中获取环境变量
const getEnvFromLaunchOptions = () => {
    let envFromOptions = null;

    // 1. 尝试从 wx.getLaunchOptionsSync 获取
    try {
        const launchOptions = wx.getLaunchOptionsSync();
        if (launchOptions && launchOptions.query && launchOptions.query.environment) {
            envFromOptions = launchOptions.query.environment;
            console.log('从启动参数获取环境:', envFromOptions);
        }
    } catch (e) {
        console.error('获取启动参数失败:', e);
    }

    // 2. 尝试从 __wxConfig 获取
    if (!envFromOptions && typeof __wxConfig !== 'undefined') {
        // 尝试从页面路径中获取条件编译环境
        try {
            if (__wxConfig.page && __wxConfig.page.window && __wxConfig.page.window.usingComponents) {
                // 这里可以添加更多逻辑来解析页面路径对应的编译条件
                console.log('当前页面配置:', __wxConfig.page);
            }
        } catch (e) {
            console.error('解析页面配置失败:', e);
        }
    }

    return envFromOptions;
};

// 获取当前环境
const getEnv = () => {
    // 如果有手动设置的环境，优先使用
    if (manualEnv && ENV[manualEnv]) {
        return ENV[manualEnv];
    }

    // 尝试从本地存储读取环境设置
    try {
        const savedEnv = wx.getStorageSync('currentEnv');
        if (savedEnv && ENV[savedEnv]) {
            return ENV[savedEnv];
        }
    } catch (e) {
        console.error('读取环境设置失败', e);
    }

    // 尝试从启动参数或全局变量中获取环境
    const envFromLaunch = getEnvFromLaunchOptions();
    if (envFromLaunch && ENV[envFromLaunch]) {
        return ENV[envFromLaunch];
    }

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

// 手动设置当前环境
const setEnv = (envName) => {
    if (!ENV[envName]) {
        console.error(`环境 ${envName} 不存在`);
        return false;
    }

    manualEnv = envName;

    // 保存到本地存储
    try {
        wx.setStorageSync('currentEnv', envName);
    } catch (e) {
        console.error('保存环境设置失败', e);
    }

    return true;
};

// 获取所有可用环境
const getAllEnvs = () => {
    return Object.keys(ENV).map(key => ({
        name: key,
        ...ENV[key]
    }));
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
    setEnv,
    getAllEnvs,
    getApiBaseUrl
}; 