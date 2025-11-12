/**
 * API类型定义
 */

/**
 * 文档实体
 */
export interface Document {
  id: number;
  sessionId: string;
  fileName: string;
  fileSize: number;
  filePath: string;
  fileMd5: string;
  pageCount: number;
  textContent: string;
  status: number; // 0-上传中, 1-已完成, 2-失败
  createTime: string;
  updateTime: string;
}

/**
 * 翻译记录实体
 */
export interface Translation {
  id: number;
  documentId: number;
  sourceLang: string;
  targetLang: string;
  translatedContent: string; // JSON格式的段落映射
  translateStyle: string;
  status: number; // 0-翻译中, 1-已完成, 2-失败
  createTime: string;
}

/**
 * 翻译段落映射
 */
export interface TranslationParagraph {
  index: string;
  original: string;
  translated: string;
}

/**
 * 对话历史实体
 */
export interface ChatHistory {
  id: number;
  documentId: number;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  selectedText?: string;
  createTime: string;
}

/**
 * 翻译请求参数
 */
export interface TranslateRequest {
  documentId: number;
  targetLang: string;
  style?: 'accurate' | 'fluent' | 'concise';
}

/**
 * 对话请求参数
 */
export interface ChatRequest {
  documentId: number;
  message: string;
  selectedText?: string;
}
