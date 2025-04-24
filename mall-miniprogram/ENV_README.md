# 小程序环境配置说明

本项目实现了基于 `project.config.json` 和环境变量的多环境配置方案，支持开发、测试和生产三种环境。

## 环境配置文件

环境配置定义在 `config/env.js` 文件中，包含以下三种环境：

1. **开发环境 (development)**：
   - API主机：`http://192.168.0.131`
   - API端口：`8080`
   - API路径前缀：`/api`
   - 环境版本：`develop`

2. **测试环境 (testing)**：
   - API主机：`https://test-api.example.com`
   - API端口：`443` (HTTPS默认端口)
   - API路径前缀：`/api`
   - 环境版本：`trial`

3. **生产环境 (production)**：
   - API主机：`https://api.example.com`
   - API端口：`443` (HTTPS默认端口)
   - API路径前缀：`/api`
   - 环境版本：`release`

## 如何切换环境

### 方法一：使用微信开发者工具的"编译模式"

1. 打开微信开发者工具
2. 点击工具栏中的"普通编译"下拉菜单
3. 选择对应的环境：
   - 开发环境
   - 测试环境
   - 生产环境

### 方法二：通过条件编译切换

在 `project.config.json` 中已配置好三种环境的条件编译，可以直接使用。

## 环境识别机制

系统通过以下方式识别当前环境：

1. 在本地开发时，通过微信开发者工具的编译模式确定环境
2. 在真机预览或体验版中，根据小程序的 `__wxConfig.envVersion` 自动识别环境：
   - `develop` → 开发环境
   - `trial` → 测试环境
   - `release` → 生产环境

## 环境提示功能

- 在**开发环境**和**测试环境**下，应用启动时会显示环境提示，并设置不同的导航栏颜色
- 在**生产环境**下，不会显示任何环境提示

## 环境相关工具函数

`utils/env-util.js` 提供了以下工具函数：

- `getCurrentEnv()`：获取当前环境信息
- `showEnvInfo()`：显示当前环境信息（仅在非生产环境）
- `isDev()`：判断是否为开发环境
- `isTest()`：判断是否为测试环境
- `isProd()`：判断是否为生产环境

`config/env.js` 提供的核心函数：

- `getEnv()`：获取当前环境配置
- `getApiBaseUrl(env)`：根据环境配置生成完整的API基础URL

## 如何修改环境配置

如需修改环境配置，只需在 `config/env.js` 文件中修改相应环境的配置项：

```javascript
// 开发环境示例
development: {
    apiHost: 'http://192.168.0.131',  // 修改为你的开发服务器IP
    apiPort: '8080',                  // 修改为你的开发服务器端口
    apiPrefix: '/api',                // API路径前缀
    envName: 'development',
    envVersion: 'develop'
}
```

## 使用示例

```javascript
// 引入环境工具
const envUtil = require('../../utils/env-util');

Page({
  onLoad() {
    // 获取当前环境
    const currentEnv = envUtil.getCurrentEnv();
    console.log('当前环境:', currentEnv.envName);
    console.log('API主机:', currentEnv.apiHost);
    console.log('API端口:', currentEnv.apiPort);
    
    // 根据环境执行不同操作
    if (envUtil.isDev()) {
      console.log('这是开发环境特有的代码');
    } else if (envUtil.isTest()) {
      console.log('这是测试环境特有的代码');
    } else if (envUtil.isProd()) {
      console.log('这是生产环境特有的代码');
    }
  }
})
``` 