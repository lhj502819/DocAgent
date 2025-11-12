import request from '../utils/request';
import { Document } from './types';

/**
 * 文档API服务
 */

/**
 * 上传文档
 * @param file 文件对象
 * @returns 文档ID
 */
export const uploadDocument = (file: File): Promise<number> => {
  const formData = new FormData();
  formData.append('file', file);

  return request.post<any, number>('/document/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 300000, // 上传文件超时时间延长到5分钟
  });
};

/**
 * 获取文档列表
 * @returns 文档列表
 */
export const getDocumentList = (): Promise<Document[]> => {
  return request.get<any, Document[]>('/document/list');
};

/**
 * 获取文档详情
 * @param documentId 文档ID
 * @returns 文档详情
 */
export const getDocumentDetail = (documentId: number): Promise<Document> => {
  return request.get<any, Document>(`/document/${documentId}`);
};
