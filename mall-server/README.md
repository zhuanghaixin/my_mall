# 商城小程序后端API服务

## 数据库迁移

如果遇到数据库表结构不匹配的问题（例如 `Unknown column 'xxx' in 'field list'`），可以采用以下两种方法解决：

### 方法1：运行迁移脚本

```bash
npm run migrate
```

这个命令会检查数据库中是否缺少必要的字段，并自动添加这些字段。

### 方法2：启用自动同步

在开发环境中，可以修改 `src/db/index.js` 文件，将 `sync` 配置的 `alter` 参数设置为 `true`：

```js
await sequelize.sync({ force: false, alter: true });
```

这将使 Sequelize 在每次启动应用时自动更新表结构以匹配模型定义。

> **注意**：在生产环境中，建议不要启用 `alter: true`，以避免意外的数据库更改。生产环境应该使用正式的数据库迁移工具。

## 常见问题

### 1. Unknown column 'orders.delivery_company' in 'field list'

这个错误表示订单表中缺少 `delivery_company` 字段。解决方法：

- 运行迁移脚本：`npm run migrate`
- 或者手动执行 SQL：
  ```sql
  ALTER TABLE orders 
  ADD COLUMN delivery_company VARCHAR(50) COMMENT '物流公司' AFTER receive_time,
  ADD COLUMN delivery_number VARCHAR(50) COMMENT '物流单号' AFTER delivery_company;
  ``` 