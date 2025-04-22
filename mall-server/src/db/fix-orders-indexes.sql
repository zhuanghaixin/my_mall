-- 修复orders表的索引问题
-- MySQL限制每个表最多只能有64个索引
-- 当前orders表有很多冗余的order_no索引

-- 显示修复前的索引情况
SHOW INDEX FROM orders;

-- 删除order_no的冗余索引
-- 注意：某些索引可能不存在，会报错，可以忽略这些错误
DROP INDEX order_no ON orders;
DROP INDEX order_no_2 ON orders;
DROP INDEX order_no_3 ON orders;
DROP INDEX order_no_4 ON orders;
DROP INDEX orders_order_no ON orders;
DROP INDEX order_no_5 ON orders;
DROP INDEX order_no_6 ON orders;
DROP INDEX order_no_7 ON orders;
DROP INDEX order_no_8 ON orders;
DROP INDEX order_no_9 ON orders;
DROP INDEX order_no_10 ON orders;
DROP INDEX order_no_11 ON orders;
DROP INDEX order_no_12 ON orders;
DROP INDEX order_no_13 ON orders;
DROP INDEX order_no_14 ON orders;
DROP INDEX order_no_15 ON orders;
DROP INDEX order_no_16 ON orders;
DROP INDEX order_no_17 ON orders;
DROP INDEX order_no_18 ON orders;
DROP INDEX order_no_19 ON orders;
DROP INDEX order_no_20 ON orders;
DROP INDEX order_no_21 ON orders;
DROP INDEX order_no_22 ON orders;
DROP INDEX order_no_23 ON orders;
DROP INDEX order_no_24 ON orders;
DROP INDEX order_no_25 ON orders;
DROP INDEX order_no_26 ON orders;
DROP INDEX order_no_27 ON orders;
DROP INDEX order_no_28 ON orders;
DROP INDEX order_no_29 ON orders;
DROP INDEX order_no_30 ON orders;
DROP INDEX order_no_31 ON orders;
DROP INDEX order_no_32 ON orders;
DROP INDEX order_no_33 ON orders;
DROP INDEX order_no_34 ON orders;
DROP INDEX order_no_35 ON orders;
DROP INDEX order_no_36 ON orders;
DROP INDEX order_no_37 ON orders;
DROP INDEX order_no_38 ON orders;
DROP INDEX order_no_39 ON orders;
DROP INDEX order_no_40 ON orders;
DROP INDEX order_no_41 ON orders;
DROP INDEX order_no_42 ON orders;
DROP INDEX order_no_43 ON orders;
DROP INDEX order_no_44 ON orders;
DROP INDEX order_no_45 ON orders;
DROP INDEX order_no_46 ON orders;
DROP INDEX order_no_47 ON orders;
DROP INDEX order_no_48 ON orders;
DROP INDEX order_no_49 ON orders;
DROP INDEX order_no_50 ON orders;
DROP INDEX order_no_51 ON orders;
DROP INDEX order_no_52 ON orders;
DROP INDEX order_no_53 ON orders;
DROP INDEX order_no_54 ON orders;
DROP INDEX order_no_55 ON orders;
DROP INDEX order_no_56 ON orders;
DROP INDEX order_no_57 ON orders;

-- 保留一个唯一索引idx_order_no
-- 如果idx_order_no不存在，创建它
-- ALTER TABLE orders ADD UNIQUE INDEX idx_order_no (order_no);

-- 删除冗余的user_id和status索引
DROP INDEX orders_user_id ON orders;
DROP INDEX orders_status ON orders;

-- 查看修复后的索引情况
SHOW INDEX FROM orders;

-- 预期的索引结构：
-- 1. PRIMARY KEY on id
-- 2. UNIQUE INDEX idx_order_no on order_no
-- 3. INDEX idx_user on user_id
-- 4. INDEX idx_status on status 