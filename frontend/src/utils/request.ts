import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { message } from 'antd';

/**
 * 统一响应格式
 */
export interface Result<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

/**
 * 创建axios实例
 */
const request: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 携带Cookie（用于sessionId）
});

/**
 * 请求拦截器
 */
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 可以在这里添加token等认证信息
    // 暂时不需要，因为使用sessionId（存储在Cookie中）
    return config;
  },
  (error: AxiosError) => {
    console.error('[请求拦截器]-请求失败:', error);
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 */
request.interceptors.response.use(
  (response: AxiosResponse<Result>) => {
    const res = response.data;

    // 检查业务状态码
    if (res.code === 200) {
      // 成功，直接返回数据
      return res.data;
    } else {
      // 业务错误
      message.error(res.message || '操作失败');
      return Promise.reject(new Error(res.message || '操作失败'));
    }
  },
  (error: AxiosError<Result>) => {
    console.error('[响应拦截器]-响应错误:', error);

    // 处理不同的HTTP错误状态码
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          message.error(data?.message || '请求参数错误');
          break;
        case 401:
          message.error('未授权，请重新登录');
          // TODO: 跳转到登录页（后续实现用户系统）
          break;
        case 403:
          message.error('拒绝访问');
          break;
        case 404:
          message.error(data?.message || '请求的资源不存在');
          break;
        case 500:
          message.error(data?.message || '服务器内部错误');
          break;
        default:
          message.error(data?.message || `请求失败: ${status}`);
      }
    } else if (error.request) {
      // 请求已发送但未收到响应
      message.error('网络错误，请检查网络连接');
    } else {
      // 其他错误
      message.error(error.message || '请求失败');
    }

    return Promise.reject(error);
  }
);

export default request;
