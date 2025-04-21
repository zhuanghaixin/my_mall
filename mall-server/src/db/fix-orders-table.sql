-- 修复orders表缺少delivery_company和delivery_number字段的问题

-- 执行方法：mysql -u username -p mall_db < fix-orders-table.sql

-- 简单直接地添加缺少的字段
-- 注意：此语句会在字段不存在时添加，如果字段已存在则会报错
-- 如果你想避免报错，请先检查字段是否存在

-- 添加物流公司字段
ALTER TABLE orders ADD COLUMN delivery_company VARCHAR(50) COMMENT '物流公司' AFTER receive_time;

-- 添加物流单号字段
ALTER TABLE orders ADD COLUMN delivery_number VARCHAR(50) COMMENT '物流单号' AFTER delivery_company;

-- 完成信息
-- 如果以上语句成功执行，表结构已更新
-- 如果报错"Duplicate column name"，说明字段已存在，可以忽略该错误 