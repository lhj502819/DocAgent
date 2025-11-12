import { useState, useEffect } from 'react';
import { Button, Select, Spin, Empty, message } from 'antd';
import { TranslationOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  translateApiWithMock as translateApi,
  Translation,
  TranslationParagraph,
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
}

/**
 * 翻译查看器组件
 */
function TranslationView({ documentId, onParagraphSelect }: TranslationViewProps) {
  const [translation, setTranslation] = useState<Translation | null>(null);
  const [paragraphs, setParagraphs] = useState<TranslationParagraph[]>([]);
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<string | null>(null);

  // 翻译配置
  const [targetLang, setTargetLang] = useState<string>('zh');
  const [translateStyle, setTranslateStyle] = useState<string>('fluent');

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
        setParagraphs(parsedParagraphs);
      }
    } catch (error: any) {
      console.log('[翻译查看器]-暂无翻译记录');
      setTranslation(null);
      setParagraphs([]);
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
            setParagraphs(parsedParagraphs);
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
   * 处理段落点击
   */
  const handleParagraphClick = (paragraph: TranslationParagraph) => {
    setSelectedIndex(paragraph.index);
    if (onParagraphSelect) {
      onParagraphSelect(paragraph);
    }
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

      {/* 翻译内容区域 */}
      <div className="translation-content">
        {loading ? (
          <div className="translation-loading">
            <Spin tip="加载翻译中..." />
          </div>
        ) : paragraphs.length > 0 ? (
          <div className="paragraphs-container">
            {paragraphs.map((paragraph) => (
              <div
                key={paragraph.index}
                className={`paragraph-item ${
                  selectedIndex === paragraph.index ? 'selected' : ''
                }`}
                onClick={() => handleParagraphClick(paragraph)}
              >
                <div className="paragraph-index">段落 {parseInt(paragraph.index) + 1}</div>
                <div className="paragraph-original">{paragraph.original}</div>
                <div className="paragraph-divider"></div>
                <div className="paragraph-translated">{paragraph.translated}</div>
              </div>
            ))}
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
