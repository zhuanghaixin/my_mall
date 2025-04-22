-- 插入200条商品数据
INSERT INTO goods (category_id, name, price, original_price, stock, sales, main_image, cover_image, images, description, detail, status, created_at, update_time, is_recommend, sale_count)
SELECT 
    -- 随机选择分类ID (从6到18)
    FLOOR(6 + RAND() * 13) as category_id,
    -- 生成商品名称
    CONCAT(
        CASE FLOOR(RAND() * 5)
            WHEN 0 THEN '时尚'
            WHEN 1 THEN '精品'
            WHEN 2 THEN '高端'
            WHEN 3 THEN '新款'
            WHEN 4 THEN '热销'
        END,
        CASE FLOOR(RAND() * 5)
            WHEN 0 THEN '男装'
            WHEN 1 THEN '女装'
            WHEN 2 THEN '童装'
            WHEN 3 THEN '手机'
            WHEN 4 THEN '电脑'
        END,
        FLOOR(RAND() * 1000)
    ) as name,
    -- 生成价格 (10-1000之间)
    ROUND(10 + RAND() * 990, 2) as price,
    -- 原价 (比现价高10%-30%)
    ROUND((10 + RAND() * 990) * (1.1 + RAND() * 0.2), 2) as original_price,
    -- 库存 (0-100之间)
    FLOOR(RAND() * 100) as stock,
    -- 销量 (0-1000之间)
    FLOOR(RAND() * 1000) as sales,
    -- 主图 (使用随机商品图片)
    CASE FLOOR(RAND() * 10)
        WHEN 0 THEN 'https://picsum.photos/id/1/800/800'
        WHEN 1 THEN 'https://picsum.photos/id/10/800/800'
        WHEN 2 THEN 'https://picsum.photos/id/100/800/800'
        WHEN 3 THEN 'https://picsum.photos/id/1000/800/800'
        WHEN 4 THEN 'https://picsum.photos/id/1001/800/800'
        WHEN 5 THEN 'https://picsum.photos/id/1002/800/800'
        WHEN 6 THEN 'https://picsum.photos/id/1003/800/800'
        WHEN 7 THEN 'https://picsum.photos/id/1004/800/800'
        WHEN 8 THEN 'https://picsum.photos/id/1005/800/800'
        WHEN 9 THEN 'https://picsum.photos/id/1006/800/800'
    END as main_image,
    -- 封面图 (使用随机商品图片，与主图不同)
    CASE FLOOR(RAND() * 10)
        WHEN 0 THEN 'https://picsum.photos/id/20/800/800'
        WHEN 1 THEN 'https://picsum.photos/id/21/800/800'
        WHEN 2 THEN 'https://picsum.photos/id/22/800/800'
        WHEN 3 THEN 'https://picsum.photos/id/23/800/800'
        WHEN 4 THEN 'https://picsum.photos/id/24/800/800'
        WHEN 5 THEN 'https://picsum.photos/id/25/800/800'
        WHEN 6 THEN 'https://picsum.photos/id/26/800/800'
        WHEN 7 THEN 'https://picsum.photos/id/27/800/800'
        WHEN 8 THEN 'https://picsum.photos/id/28/800/800'
        WHEN 9 THEN 'https://picsum.photos/id/29/800/800'
    END as cover_image,
    -- 图片集 (使用多个商品图片，用逗号分隔)
    CONCAT(
        CASE FLOOR(RAND() * 10)
            WHEN 0 THEN 'https://picsum.photos/id/1/800/800'
            WHEN 1 THEN 'https://picsum.photos/id/10/800/800'
            WHEN 2 THEN 'https://picsum.photos/id/100/800/800'
            WHEN 3 THEN 'https://picsum.photos/id/1000/800/800'
            WHEN 4 THEN 'https://picsum.photos/id/1001/800/800'
            WHEN 5 THEN 'https://picsum.photos/id/1002/800/800'
            WHEN 6 THEN 'https://picsum.photos/id/1003/800/800'
            WHEN 7 THEN 'https://picsum.photos/id/1004/800/800'
            WHEN 8 THEN 'https://picsum.photos/id/1005/800/800'
            WHEN 9 THEN 'https://picsum.photos/id/1006/800/800'
        END,
        ',',
        CASE FLOOR(RAND() * 10)
            WHEN 0 THEN 'https://picsum.photos/id/1/800/800'
            WHEN 1 THEN 'https://picsum.photos/id/10/800/800'
            WHEN 2 THEN 'https://picsum.photos/id/100/800/800'
            WHEN 3 THEN 'https://picsum.photos/id/1000/800/800'
            WHEN 4 THEN 'https://picsum.photos/id/1001/800/800'
            WHEN 5 THEN 'https://picsum.photos/id/1002/800/800'
            WHEN 6 THEN 'https://picsum.photos/id/1003/800/800'
            WHEN 7 THEN 'https://picsum.photos/id/1004/800/800'
            WHEN 8 THEN 'https://picsum.photos/id/1005/800/800'
            WHEN 9 THEN 'https://picsum.photos/id/1006/800/800'
        END,
        ',',
        CASE FLOOR(RAND() * 10)
            WHEN 0 THEN 'https://picsum.photos/id/1/800/800'
            WHEN 1 THEN 'https://picsum.photos/id/10/800/800'
            WHEN 2 THEN 'https://picsum.photos/id/100/800/800'
            WHEN 3 THEN 'https://picsum.photos/id/1000/800/800'
            WHEN 4 THEN 'https://picsum.photos/id/1001/800/800'
            WHEN 5 THEN 'https://picsum.photos/id/1002/800/800'
            WHEN 6 THEN 'https://picsum.photos/id/1003/800/800'
            WHEN 7 THEN 'https://picsum.photos/id/1004/800/800'
            WHEN 8 THEN 'https://picsum.photos/id/1005/800/800'
            WHEN 9 THEN 'https://picsum.photos/id/1006/800/800'
        END
    ) as images,
    -- 商品描述
    CONCAT('这是第', n.n, '号商品的描述') as description,
    -- 商品详情
    CONCAT('<p>这是第', n.n, '号商品的详细描述</p>') as detail,
    -- 状态 (1表示上架)
    1 as status,
    -- 创建时间 (最近30天内)
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY) as created_at,
    -- 更新时间
    NOW() as update_time,
    -- 是否推荐 (前10条为推荐商品)
    CASE WHEN n.n <= 10 THEN 1 ELSE 0 END as is_recommend,
    -- 销售数量
    FLOOR(RAND() * 1000) as sale_count
FROM (
    SELECT a.N + b.N * 10 + 1 as n
    FROM (SELECT 0 AS N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) a,
         (SELECT 0 AS N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) b
    ORDER BY n
) n
WHERE n.n <= 200; 