import request from './request';

export interface Banner {
  id?: number;
  title: string;
  image: string;
  url: string;
  sort: number;
  status: number;
  create_time?: string;
  update_time?: string;
}

export interface BannerListParams {
  page?: number;
  pageSize?: number;
  title?: string;
  status?: number;
}

export interface BannerListResponse {
  list: Banner[];
  total: number;
}

/**
 * 获取轮播图列表
 */
export function getBannerList(params?: BannerListParams) {
  return request({
    url: '/admin/banner/list',
    method: 'get',
    params
  });
}

/**
 * 获取轮播图详情
 * @param id 轮播图ID
 */
export function getBannerDetail(id: number) {
  return request({
    url: `/admin/banner/${id}`,
    method: 'get'
  });
}

/**
 * 添加轮播图
 * @param data 轮播图数据
 */
export function addBanner(data: Banner) {
  return request({
    url: '/admin/banner',
    method: 'post',
    data
  });
}

/**
 * 更新轮播图
 * @param id 轮播图ID
 * @param data 轮播图数据
 */
export function updateBanner(id: number, data: Partial<Banner>) {
  return request({
    url: `/admin/banner/${id}`,
    method: 'put',
    data
  });
}

/**
 * 删除轮播图
 * @param id 轮播图ID
 */
export function deleteBanner(id: number) {
  return request({
    url: `/admin/banner/${id}`,
    method: 'delete'
  });
}

/**
 * 更新轮播图状态
 * @param id 轮播图ID
 * @param status 状态：0禁用，1启用
 */
export function updateBannerStatus(id: number, status: number) {
  return request({
    url: `/admin/banner/${id}/status`,
    method: 'put',
    data: { status }
  });
}

/**
 * 更新轮播图排序
 * @param id 轮播图ID
 * @param sort 排序值
 */
export function updateBannerSort(id: number, sort: number) {
  return request({
    url: `/admin/banner/${id}/sort`,
    method: 'put',
    data: { sort }
  });
} 