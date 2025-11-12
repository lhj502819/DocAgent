import * as documentApi from './document';
import * as translateApi from './translate';
import * as chatApi from './chat';
import * as mockData from '../utils/mockData';

/**
 * 是否使用Mock数据
 * 设置为true时使用Mock数据，false时使用真实API
 */
const USE_MOCK = true; // 可以通过环境变量控制：import.meta.env.VITE_USE_MOCK === 'true'

/**
 * Mock API封装
 * 根据USE_MOCK标志切换真实API或Mock API
 */

/**
 * 文档API（支持Mock）
 */
export const documentApiWithMock = {
  uploadDocument: USE_MOCK ? mockData.mockUploadDocument : documentApi.uploadDocument,
  getDocumentList: USE_MOCK ? mockData.mockGetDocumentList : documentApi.getDocumentList,
  getDocumentDetail: USE_MOCK
    ? mockData.mockGetDocumentDetail
    : documentApi.getDocumentDetail,
};

/**
 * 翻译API（支持Mock）
 */
export const translateApiWithMock = {
  startTranslation: USE_MOCK ? mockData.mockStartTranslation : translateApi.startTranslation,
  getTranslation: USE_MOCK ? mockData.mockGetTranslation : translateApi.getTranslation,
  getLatestTranslation: USE_MOCK
    ? mockData.mockGetLatestTranslation
    : translateApi.getLatestTranslation,
};

/**
 * 对话API（支持Mock）
 */
export const chatApiWithMock = {
  sendMessage: USE_MOCK ? mockData.mockSendMessage : chatApi.sendMessage,
  getChatHistory: USE_MOCK ? mockData.mockGetChatHistory : chatApi.getChatHistory,
  clearChatHistory: USE_MOCK ? mockData.mockClearChatHistory : chatApi.clearChatHistory,
};

// 重新导出类型
export * from './types';
