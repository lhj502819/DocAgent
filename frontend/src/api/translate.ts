import request from '../utils/request';
import { Translation, TranslateRequest } from './types';

/**
 * 翻译API服务
 */

/**
 * 开始翻译
 * @param params 翻译请求参数
 * @returns 翻译记录ID
 */
export const startTranslation = (params: TranslateRequest): Promise<number> => {
  return request.post<any, number>('/translate/start', params);
};

/**
 * 获取翻译结果
 * @param translationId 翻译记录ID
 * @returns 翻译记录
 */
export const getTranslation = (translationId: number): Promise<Translation> => {
  return request.get<any, Translation>(`/translate/${translationId}`);
};

/**
 * 获取文档最新翻译
 * @param documentId 文档ID
 * @param targetLang 目标语言
 * @returns 翻译记录
 */
export const getLatestTranslation = (
  documentId: number,
  targetLang: string
): Promise<Translation> => {
  return request.get<any, Translation>('/translate/latest', {
    params: { documentId, targetLang },
  });
};
