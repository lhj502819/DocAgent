import request from '../utils/request';
import { ChatHistory, ChatRequest } from './types';

/**
 * 对话API服务
 */

/**
 * 发送对话消息
 * @param params 对话请求参数
 * @returns AI回复内容
 */
export const sendMessage = (params: ChatRequest): Promise<string> => {
  return request.post<any, string>('/chat/send', params);
};

/**
 * 获取对话历史
 * @param documentId 文档ID
 * @returns 对话历史列表
 */
export const getChatHistory = (documentId: number): Promise<ChatHistory[]> => {
  return request.get<any, ChatHistory[]>('/chat/history', {
    params: { documentId },
  });
};

/**
 * 清空对话历史
 * @param documentId 文档ID
 */
export const clearChatHistory = (documentId: number): Promise<void> => {
  return request.delete<any, void>('/chat/clear', {
    params: { documentId },
  });
};
