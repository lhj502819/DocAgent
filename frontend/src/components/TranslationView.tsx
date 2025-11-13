import { useState, useEffect, useRef } from 'react';
import { Button, Select, Spin, Empty, message } from 'antd';
import { TranslationOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  translateApiWithMock as translateApi,
  Translation,
  TranslationParagraph,
  TranslationSentence,
} from '../api/mockApi';
import './TranslationView.css';

const { Option } = Select;

interface TranslationViewProps {
  /**
   * 文档ID
   */
  documentId: number;
  /**
   * 选中段落回调
   */
  onParagraphSelect?: (paragraph: TranslationParagraph) => void;
  /**
   * 当前高亮的句子ID（外部控制）
   */
  highlightedSentenceId?: number | null;
  /**
   * 句子hover回调
   */
  onSentenceHover?: (sentenceId: number | null) => void;
  /**
   * 文本选择回调
   */
  onTextSelect?: (text: string) => void;
}

/**
 * 翻译查看器组件
 */
function TranslationView({
  documentId,
  highlightedSentenceId: externalHighlightedId,
  onSentenceHover,
  onTextSelect
}: TranslationViewProps) {
  const [translation, setTranslation] = useState<Translation | null>(null);
  const [sentences, setSentences] = useState<TranslationSentence[]>([]);
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [internalHighlightedId, setInternalHighlightedId] = useState<number | null>(null);

  // 使用外部传入的高亮ID，如果没有则使用内部状态
  const highlightedSentenceId = externalHighlightedId !== undefined ? externalHighlightedId : internalHighlightedId;

  // 翻译配置
  const [targetLang, setTargetLang] = useState<string>('zh');
  const [translateStyle, setTranslateStyle] = useState<string>('fluent');

  // 引用
  const originalTextRef = useRef<HTMLDivElement>(null);
  const translatedTextRef = useRef<HTMLDivElement>(null);

  /**
   * 将段落拆分成句子
   */
  const splitIntoSentences = (paragraphs: TranslationParagraph[]): TranslationSentence[] => {
    const sentenceArray: TranslationSentence[] = [];
    let sentenceId = 0;

    // 句子分隔符正则（中英文句号、问号、感叹号）
    const sentenceDelimiterRegex = /([.!?。!?]+[\s]*)/g;

    paragraphs.forEach((paragraph) => {
      // 分割原文句子
      const originalSentences = paragraph.original.split(sentenceDelimiterRegex).filter(s => s.trim());
      const translatedSentences = paragraph.translated.split(sentenceDelimiterRegex).filter(s => s.trim());

      // 合并标点符号和句子
      const mergedOriginal: string[] = [];
      const mergedTranslated: string[] = [];

      for (let i = 0; i < originalSentences.length; i++) {
        if (sentenceDelimiterRegex.test(originalSentences[i])) {
          // 如果是标点符号，合并到上一个句子
          if (mergedOriginal.length > 0) {
            mergedOriginal[mergedOriginal.length - 1] += originalSentences[i];
          }
        } else {
          mergedOriginal.push(originalSentences[i]);
        }
      }

      for (let i = 0; i < translatedSentences.length; i++) {
        if (sentenceDelimiterRegex.test(translatedSentences[i])) {
          if (mergedTranslated.length > 0) {
            mergedTranslated[mergedTranslated.length - 1] += translatedSentences[i];
          }
        } else {
          mergedTranslated.push(translatedSentences[i]);
        }
      }

      // 对齐句子数量（取最小值）
      const minLength = Math.min(mergedOriginal.length, mergedTranslated.length);

      for (let i = 0; i < minLength; i++) {
        sentenceArray.push({
          id: sentenceId++,
          originalText: mergedOriginal[i].trim(),
          translatedText: mergedTranslated[i].trim(),
          startIndex: 0, // TODO: 计算实际位置
          endIndex: 0,
        });
      }
    });

    return sentenceArray;
  };

  /**
   * 加载最新翻译
   */
  const loadLatestTranslation = async () => {
    try {
      setLoading(true);
      const result = await translateApi.getLatestTranslation(documentId, targetLang);
      setTranslation(result);

      // 解析翻译内容
      if (result && result.translatedContent) {
        const parsedParagraphs: TranslationParagraph[] = JSON.parse(
          result.translatedContent
        );

        // 拆分成句子
        const sentenceArray = splitIntoSentences(parsedParagraphs);
        setSentences(sentenceArray);
      }
    } catch (error: any) {
      console.log('[翻译查看器]-暂无翻译记录');
      setTranslation(null);
      setSentences([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 开始翻译
   */
  const handleStartTranslation = async () => {
    try {
      setTranslating(true);
      message.loading({ content: '正在启动翻译任务...', key: 'translate', duration: 0 });

      const translationId = await translateApi.startTranslation({
        documentId,
        targetLang,
        style: translateStyle as any,
      });

      message.success({ content: '翻译任务已启动', key: 'translate', duration: 2 });

      // 轮询翻译状态
      pollTranslationStatus(translationId);
    } catch (error: any) {
      console.error('[翻译查看器]-启动翻译失败:', error);
      message.error({ content: '翻译启动失败', key: 'translate' });
      setTranslating(false);
    }
  };

  /**
   * 轮询翻译状态
   */
  const pollTranslationStatus = async (translationId: number) => {
    const maxAttempts = 60; // 最多轮询60次（5分钟）
    let attempts = 0;

    const poll = async () => {
      try {
        attempts++;
        const result = await translateApi.getTranslation(translationId);

        if (result.status === 1) {
          // 翻译完成
          message.success({ content: '翻译完成', key: 'translate', duration: 2 });
          setTranslating(false);
          setTranslation(result);

          // 解析翻译内容
          if (result.translatedContent) {
            const parsedParagraphs: TranslationParagraph[] = JSON.parse(
              result.translatedContent
            );

            // 拆分成句子
            const sentenceArray = splitIntoSentences(parsedParagraphs);
            setSentences(sentenceArray);
          }
        } else if (result.status === 2) {
          // 翻译失败
          message.error({ content: '翻译失败，请重试', key: 'translate' });
          setTranslating(false);
        } else if (attempts < maxAttempts) {
          // 继续轮询
          message.loading({
            content: `正在翻译中... (${attempts}/${maxAttempts})`,
            key: 'translate',
            duration: 0,
          });
          setTimeout(poll, 5000); // 5秒后再次轮询
        } else {
          // 超时
          message.warning({ content: '翻译超时，请刷新页面查看结果', key: 'translate' });
          setTranslating(false);
        }
      } catch (error: any) {
        console.error('[翻译查看器]-获取翻译状态失败:', error);
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000);
        } else {
          message.error({ content: '获取翻译状态失败', key: 'translate' });
          setTranslating(false);
        }
      }
    };

    poll();
  };

  /**
   * 处理句子鼠标悬停
   */
  const handleSentenceHover = (sentenceId: number | null) => {
    if (onSentenceHover) {
      // 如果有外部回调，调用外部回调（联动高亮）
      onSentenceHover(sentenceId);
    } else {
      // 否则使用内部状态
      setInternalHighlightedId(sentenceId);
    }
  };

  /**
   * 处理文本选择
   */
  const handleTextSelection = () => {
    if (onTextSelect) {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      if (text) {
        onTextSelect(text);
      }
    }
  };

  /**
   * 渲染译文内容（单栏模式）
   */
  const renderTranslatedText = () => {
    return (
      <div className="translation-text-content">
        {sentences.map((sentence) => (
          <span
            key={sentence.id}
            className={`translation-sentence ${highlightedSentenceId === sentence.id ? 'highlighted' : ''}`}
            onMouseEnter={() => handleSentenceHover(sentence.id)}
            onMouseLeave={() => handleSentenceHover(null)}
          >
            {sentence.translatedText}{' '}
          </span>
        ))}
      </div>
    );
  };

  /**
   * 组件挂载时加载最新翻译
   */
  useEffect(() => {
    if (documentId) {
      loadLatestTranslation();
    }
  }, [documentId]);

  return (
    <div className="translation-view-container">
      {/* 控制栏 */}
      <div className="translation-toolbar">
        <Select
          value={targetLang}
          onChange={setTargetLang}
          style={{ width: 120 }}
          disabled={translating}
        >
          <Option value="zh">中文</Option>
          <Option value="en">English</Option>
          <Option value="ja">日本語</Option>
          <Option value="ko">한국어</Option>
        </Select>
        <Select
          value={translateStyle}
          onChange={setTranslateStyle}
          style={{ width: 120 }}
          disabled={translating}
        >
          <Option value="accurate">准确</Option>
          <Option value="fluent">流畅</Option>
          <Option value="concise">简洁</Option>
        </Select>
        <Button
          type="primary"
          icon={<TranslationOutlined />}
          onClick={handleStartTranslation}
          loading={translating}
          disabled={translating}
        >
          {translation ? '重新翻译' : '开始翻译'}
        </Button>
        {translation && !translating && (
          <Button icon={<ReloadOutlined />} onClick={loadLatestTranslation}>
            刷新
          </Button>
        )}
      </div>

      {/* 翻译内容区域 - 单栏译文显示 */}
      <div className="translation-content">
        {loading ? (
          <div className="translation-loading">
            <Spin tip="加载翻译中..." />
          </div>
        ) : sentences.length > 0 ? (
          <div className="single-column-view">
            <div className="translation-text-panel" onMouseUp={handleTextSelection}>
              {renderTranslatedText()}
            </div>
          </div>
        ) : (
          <div className="translation-empty">
            <Empty
              description={
                translating
                  ? '翻译进行中，请稍候...'
                  : '暂无翻译内容，请点击"开始翻译"按钮'
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default TranslationView;
