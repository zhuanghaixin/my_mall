-- 修复users表的索引问题
-- 确保users表有正确的索引结构

-- 显示修复前的索引情况
SHOW INDEX FROM users;

-- 删除所有可能存在的openid相关索引
-- 注意：某些索引可能不存在，会报错，可以忽略这些错误
DROP INDEX idx_openid ON users;
DROP INDEX openid ON users;
DROP INDEX openid_2 ON users;
DROP INDEX openid_3 ON users;

-- 添加一个唯一的openid索引
ALTER TABLE users ADD UNIQUE INDEX idx_openid (openid);

-- 显示修复后的索引情况
SHOW INDEX FROM users;

-- 预期的索引结构：
-- 1. PRIMARY KEY on id
-- 2. UNIQUE INDEX idx_openid on openid
-- 3. INDEX idx_phone on phone 