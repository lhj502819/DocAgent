/**
 * Mock数据和Mock API服务
 * 用于在没有后端服务时测试前端功能
 */

import { Document, Translation, ChatHistory } from '../api/types';

/**
 * Mock文档数据
 */
export const mockDocuments: Document[] = [
  {
    id: 1,
    sessionId: 'mock-session-1',
    fileName: 'AI技术白皮书.pdf',
    fileSize: 2048576, // 2MB
    filePath: '/mock/ai-whitepaper.pdf',
    fileMd5: 'mock-md5-1',
    pageCount: 15,
    textContent: '这是一份关于AI技术的白皮书...',
    status: 1,
    createTime: '2025-11-12T08:00:00',
    updateTime: '2025-11-12T08:00:00',
  },
  {
    id: 2,
    sessionId: 'mock-session-1',
    fileName: '深度学习入门指南.pdf',
    fileSize: 3145728, // 3MB
    filePath: '/mock/deep-learning.pdf',
    fileMd5: 'mock-md5-2',
    pageCount: 25,
    textContent: '深度学习是机器学习的一个分支...',
    status: 1,
    createTime: '2025-11-11T10:30:00',
    updateTime: '2025-11-11T10:30:00',
  },
  {
    id: 3,
    sessionId: 'mock-session-1',
    fileName: '神经网络基础.pdf',
    fileSize: 1572864, // 1.5MB
    filePath: '/mock/neural-networks.pdf',
    fileMd5: 'mock-md5-3',
    pageCount: 10,
    textContent: '神经网络是深度学习的基础...',
    status: 1,
    createTime: '2025-11-10T14:20:00',
    updateTime: '2025-11-10T14:20:00',
  },
];

/**
 * Mock翻译数据
 */
export const mockTranslations: Translation[] = [
  {
    id: 1,
    documentId: 1,
    sourceLang: 'en',
    targetLang: 'zh',
    translatedContent: JSON.stringify([
      {
        index: '0',
        original:
          'Artificial Intelligence (AI) is revolutionizing the way we live and work. From autonomous vehicles to intelligent assistants, AI technologies are transforming industries across the globe.',
        translated:
          '人工智能（AI）正在彻底改变我们的生活和工作方式。从自动驾驶汽车到智能助手，人工智能技术正在改变全球各行各业。',
      },
      {
        index: '1',
        original:
          'Machine learning, a subset of AI, enables computers to learn from data without being explicitly programmed. This capability has led to breakthrough applications in image recognition, natural language processing, and predictive analytics.',
        translated:
          '机器学习作为人工智能的一个子集，使计算机能够从数据中学习而无需明确编程。这种能力带来了图像识别、自然语言处理和预测分析领域的突破性应用。',
      },
      {
        index: '2',
        original:
          'Deep learning, powered by neural networks with multiple layers, has achieved remarkable success in complex tasks such as speech recognition, computer vision, and game playing. The advent of deep learning has pushed the boundaries of what machines can accomplish.',
        translated:
          '深度学习由具有多个层次的神经网络驱动，在语音识别、计算机视觉和游戏对弈等复杂任务中取得了显著成功。深度学习的出现推动了机器能力的边界。',
      },
      {
        index: '3',
        original:
          'As we look to the future, AI promises to bring even more transformative changes. Ethical considerations, data privacy, and responsible AI development will be critical as we navigate this technological revolution.',
        translated:
          '展望未来，人工智能承诺带来更多变革性的变化。在我们驾驭这场技术革命时，道德考量、数据隐私和负责任的人工智能发展将至关重要。',
      },
    ]),
    translateStyle: 'fluent',
    status: 1,
    createTime: '2025-11-12T08:05:00',
  },
];

/**
 * Mock对话历史
 */
export const mockChatHistory: ChatHistory[] = [
  {
    id: 1,
    documentId: 1,
    sessionId: 'mock-session-1',
    role: 'user',
    content: '这份文档主要讲了什么？',
    createTime: '2025-11-12T08:10:00',
  },
  {
    id: 2,
    documentId: 1,
    sessionId: 'mock-session-1',
    role: 'assistant',
    content:
      '这份文档是一份关于人工智能技术的白皮书，主要介绍了：\n\n1. **AI的革命性影响**：人工智能正在改变我们的生活和工作方式，从自动驾驶到智能助手，影响各行各业。\n\n2. **机器学习**：作为AI的子集，机器学习使计算机能够从数据中学习，在图像识别、自然语言处理等领域取得突破。\n\n3. **深度学习**：通过多层神经网络，深度学习在语音识别、计算机视觉等复杂任务中表现出色。\n\n4. **未来展望**：文档强调了AI发展中需要关注的伦理、隐私和责任问题。',
    createTime: '2025-11-12T08:10:05',
  },
  {
    id: 3,
    documentId: 1,
    sessionId: 'mock-session-1',
    role: 'user',
    content: '什么是深度学习？',
    selectedText: 'Deep learning, powered by neural networks...',
    createTime: '2025-11-12T08:11:00',
  },
  {
    id: 4,
    documentId: 1,
    sessionId: 'mock-session-1',
    role: 'assistant',
    content:
      '深度学习是机器学习的一个重要分支，它的主要特点是：\n\n**核心技术**：\n- 使用具有多个层次的神经网络（深层神经网络）\n- 能够自动学习数据的层次化特征表示\n\n**应用领域**：\n1. 语音识别：如Siri、Alexa等智能助手\n2. 计算机视觉：人脸识别、物体检测\n3. 游戏对弈：如AlphaGo击败人类围棋冠军\n\n**技术优势**：\n深度学习不需要人工设计特征，可以从原始数据中自动学习复杂的模式和特征，这使得它在处理图像、语音、文本等非结构化数据时特别强大。',
    createTime: '2025-11-12T08:11:10',
  },
];

/**
 * 模拟延迟（网络请求）
 */
export const delay = (ms: number = 1000): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Mock文档上传
 */
export const mockUploadDocument = async (file: File): Promise<number> => {
  console.log('[Mock] 上传文档:', file.name);
  await delay(2000); // 模拟上传时间

  const newDoc: Document = {
    id: mockDocuments.length + 1,
    sessionId: 'mock-session-1',
    fileName: file.name,
    fileSize: file.size,
    filePath: `/mock/${file.name}`,
    fileMd5: `mock-md5-${Date.now()}`,
    pageCount: 10,
    textContent: '这是上传的文档内容...',
    status: 1,
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString(),
  };

  mockDocuments.unshift(newDoc);
  return newDoc.id;
};

/**
 * Mock获取文档列表
 */
export const mockGetDocumentList = async (): Promise<Document[]> => {
  console.log('[Mock] 获取文档列表');
  await delay(500);
  return [...mockDocuments];
};

/**
 * Mock获取文档详情
 */
export const mockGetDocumentDetail = async (documentId: number): Promise<Document> => {
  console.log('[Mock] 获取文档详情:', documentId);
  await delay(500);
  const doc = mockDocuments.find((d) => d.id === documentId);
  if (!doc) {
    throw new Error('文档不存在');
  }
  return { ...doc };
};

/**
 * Mock开始翻译
 */
export const mockStartTranslation = async (params: {
  documentId: number;
  targetLang: string;
  style?: string;
}): Promise<number> => {
  console.log('[Mock] 开始翻译:', params);
  await delay(1000);

  const newTranslation: Translation = {
    id: mockTranslations.length + 1,
    documentId: params.documentId,
    sourceLang: 'en',
    targetLang: params.targetLang,
    translatedContent: mockTranslations[0].translatedContent,
    translateStyle: params.style || 'fluent',
    status: 0, // 翻译中
    createTime: new Date().toISOString(),
  };

  mockTranslations.unshift(newTranslation);

  // 模拟翻译完成
  setTimeout(() => {
    newTranslation.status = 1; // 已完成
  }, 3000);

  return newTranslation.id;
};

/**
 * Mock获取翻译结果
 */
export const mockGetTranslation = async (translationId: number): Promise<Translation> => {
  console.log('[Mock] 获取翻译结果:', translationId);
  await delay(500);
  const translation = mockTranslations.find((t) => t.id === translationId);
  if (!translation) {
    throw new Error('翻译记录不存在');
  }
  return { ...translation };
};

/**
 * Mock获取最新翻译
 */
export const mockGetLatestTranslation = async (
  documentId: number,
  targetLang: string
): Promise<Translation> => {
  console.log('[Mock] 获取最新翻译:', documentId, targetLang);
  await delay(500);
  const translation = mockTranslations.find(
    (t) => t.documentId === documentId && t.targetLang === targetLang
  );
  if (!translation) {
    throw new Error('暂无翻译记录');
  }
  return { ...translation };
};

/**
 * Mock发送消息
 */
export const mockSendMessage = async (params: {
  documentId: number;
  message: string;
  selectedText?: string;
}): Promise<string> => {
  console.log('[Mock] 发送消息:', params);
  await delay(1500); // 模拟AI响应时间

  // 保存用户消息
  mockChatHistory.push({
    id: mockChatHistory.length + 1,
    documentId: params.documentId,
    sessionId: 'mock-session-1',
    role: 'user',
    content: params.message,
    selectedText: params.selectedText,
    createTime: new Date().toISOString(),
  });

  // 生成AI回复
  const aiReply = generateMockAiReply(params.message);

  // 保存AI回复
  mockChatHistory.push({
    id: mockChatHistory.length + 1,
    documentId: params.documentId,
    sessionId: 'mock-session-1',
    role: 'assistant',
    content: aiReply,
    createTime: new Date().toISOString(),
  });

  return aiReply;
};

/**
 * 生成Mock AI回复
 */
const generateMockAiReply = (userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('什么') || lowerMessage.includes('是什么')) {
    return '根据文档内容，这是一个关于AI技术的说明。具体来说，它涉及机器学习、深度学习等核心技术，以及它们在各个领域的应用。';
  }

  if (lowerMessage.includes('如何') || lowerMessage.includes('怎么')) {
    return '根据文档描述，实现这一目标需要以下步骤：\n1. 首先了解基础概念\n2. 掌握相关技术\n3. 进行实践应用\n\n建议您参考文档中的详细说明进行深入学习。';
  }

  if (lowerMessage.includes('为什么') || lowerMessage.includes('原因')) {
    return '根据文档分析，主要原因包括：\n- 技术的快速发展\n- 应用需求的增长\n- 研究投入的增加\n\n这些因素共同推动了相关领域的进步。';
  }

  if (lowerMessage.includes('解释') || lowerMessage.includes('说明')) {
    return '让我为您详细解释：\n\n这段内容主要讲述了AI技术的核心原理和应用场景。通过机器学习算法，系统能够从数据中学习模式，并应用于实际问题的解决。\n\n如果您需要了解更多细节，可以询问具体的技术点。';
  }

  // 默认回复
  return '感谢您的提问。根据文档内容，我理解您关心的问题。这份文档详细介绍了AI技术的相关内容，包括机器学习、深度学习等方面。如果您有更具体的问题，欢迎继续询问。';
};

/**
 * Mock获取对话历史
 */
export const mockGetChatHistory = async (documentId: number): Promise<ChatHistory[]> => {
  console.log('[Mock] 获取对话历史:', documentId);
  await delay(500);
  return mockChatHistory.filter((ch) => ch.documentId === documentId);
};

/**
 * Mock清空对话历史
 */
export const mockClearChatHistory = async (documentId: number): Promise<void> => {
  console.log('[Mock] 清空对话历史:', documentId);
  await delay(500);
  const index = mockChatHistory.findIndex((ch) => ch.documentId === documentId);
  if (index !== -1) {
    mockChatHistory.splice(index, mockChatHistory.length - index);
  }
};
