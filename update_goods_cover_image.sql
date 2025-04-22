-- 更新现有商品的封面图（cover_image）字段
-- 为已存在的商品设置封面图
UPDATE goods 
SET cover_image = CASE MOD(id, 10)
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
END
WHERE cover_image IS NULL OR cover_image = '';

-- 对于封面图为空但主图不为空的商品，将主图复制到封面图
UPDATE goods
SET cover_image = main_image
WHERE (cover_image IS NULL OR cover_image = '') AND main_image IS NOT NULL AND main_image != ''; 