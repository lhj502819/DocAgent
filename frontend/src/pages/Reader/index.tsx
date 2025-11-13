import { Layout, Button, Space, Spin, message } from 'antd'
import {
  ArrowLeftOutlined,
  TranslationOutlined,
  DownloadOutlined,
  SettingOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  documentApiWithMock as documentApi,
  translateApiWithMock as translateApi,
  Document as DocumentType,
  TranslationParagraph,
} from '../../api/mockApi'
import PDFViewer from '../../components/PDFViewer'
import TranslationView from '../../components/TranslationView'
import ChatPanel from '../../components/ChatPanel'
import './Reader.css'

const { Header, Content } = Layout

/**
 * 阅读页 - 文档阅读主界面
 */
function Reader() {
  const navigate = useNavigate()
  const { documentId } = useParams<{ documentId: string }>()
  const [document, setDocument] = useState<DocumentType | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedText, setSelectedText] = useState<string>('')
  const [selectedParagraph, setSelectedParagraph] = useState<TranslationParagraph | null>(
    null
  )
  const [originalTextParagraphs, setOriginalTextParagraphs] = useState<string[]>([])
  const [highlightedSentenceId, setHighlightedSentenceId] = useState<number | null>(null)

  // 加载文档信息和原文内容
  useEffect(() => {
    if (documentId) {
      loadDocument(parseInt(documentId))
      loadOriginalText(parseInt(documentId))
    }
  }, [documentId])

  const loadDocument = async (id: number) => {
    try {
      setLoading(true)
      const doc = await documentApi.getDocumentDetail(id)
      setDocument(doc)
    } catch (error: any) {
      console.error('[文档详情]-加载失败:', error)
      message.error('文档加载失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 加载原文内容（从翻译记录中提取）
   */
  const loadOriginalText = async (id: number) => {
    try {
      // 尝试获取翻译记录以获取原文
      const translation = await translateApi.getLatestTranslation(id, 'zh')
      if (translation && translation.translatedContent) {
        const paragraphs: TranslationParagraph[] = JSON.parse(translation.translatedContent)
        const originals = paragraphs.map(p => p.original)
        setOriginalTextParagraphs(originals)
      }
    } catch (error: any) {
      console.log('[原文加载]-暂无翻译记录，使用默认原文')
      // 如果没有翻译记录，显示占位文本
      setOriginalTextParagraphs([])
    }
  }

  /**
   * 将文本段落拆分为句子并分配ID
   */
  const splitParagraphsToSentences = (paragraphs: string[]) => {
    const sentences: { id: number; text: string }[] = []
    let sentenceId = 0
    const sentenceDelimiterRegex = /([.!?。!?]+[\s]*)/g

    paragraphs.forEach((paragraph) => {
      const parts = paragraph.split(sentenceDelimiterRegex).filter(s => s.trim())
      const merged: string[] = []

      for (let i = 0; i < parts.length; i++) {
        if (sentenceDelimiterRegex.test(parts[i])) {
          if (merged.length > 0) {
            merged[merged.length - 1] += parts[i]
          }
        } else {
          merged.push(parts[i])
        }
      }

      merged.forEach(text => {
        sentences.push({ id: sentenceId++, text: text.trim() })
      })
    })

    return sentences
  }

  /**
   * 处理原文句子hover事件
   */
  const handleOriginalSentenceHover = (sentenceId: number | null) => {
    setHighlightedSentenceId(sentenceId)
  }

  /**
   * 处理文本选择（通用）
   */
  const handleTextSelection = () => {
    const selection = window.getSelection()
    const text = selection?.toString().trim()
    if (text) {
      setSelectedText(text)
      console.log('[文本选中]:', text)
    }
  }

  const handleTranslate = () => {
    // TODO: 实现翻译功能
    console.log('开始翻译')
  }

  const handleDownload = () => {
    // TODO: 实现下载功能
    console.log('下载文档')
  }

  const handleSettings = () => {
    // TODO: 打开设置面板
    console.log('打开设置')
  }

  /**
   * 处理PDF文本选中
   */
  const handleTextSelect = (text: string) => {
    setSelectedText(text)
    console.log('[文本选中]:', text)
  }

  /**
   * 处理翻译段落选中
   */
  const handleParagraphSelect = (paragraph: TranslationParagraph) => {
    setSelectedParagraph(paragraph)
    console.log('[段落选中]:', paragraph)
  }

  /**
   * 获取PDF文件URL
   */
  const getPdfFileUrl = (): string | null => {
    if (!document || !document.filePath) return null
    // Mock模式下返回null（暂时不显示PDF）
    // 在真实环境中，通过后端API获取PDF文件
    return null // 在非Mock模式下改为: `/api/document/${document.id}/file`
  }

  return (
    <Layout className="reader-layout">
      <Header className="reader-header">
        <div className="header-left">
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>
            返回
          </Button>
          <span className="document-name">{document?.fileName || '加载中...'}</span>
        </div>
        <Space className="header-right">
          <Button icon={<TranslationOutlined />} onClick={handleTranslate}>
            翻译
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleDownload}>
            下载
          </Button>
          <Button icon={<SettingOutlined />} onClick={handleSettings}>
            设置
          </Button>
        </Space>
      </Header>
      <Content className="reader-content">
        {loading ? (
          <div className="loading-container">
            <Spin size="large" tip="加载文档中..." />
          </div>
        ) : (
          <div className="reader-container">
            <div className="pdf-viewer-section">
              {getPdfFileUrl() ? (
                <PDFViewer file={getPdfFileUrl()} onTextSelect={handleTextSelect} />
              ) : (
                <div className="mock-pdf-content">
                  <div className="mock-pdf-header">
                    <FileTextOutlined style={{ fontSize: 24, color: 'var(--color-bamboo-green)' }} />
                    <h3>{document?.fileName || '文档预览'}</h3>
                    <p className="mock-hint">Mock模式 - 显示文档原文</p>
                  </div>
                  <div className="mock-pdf-text" onMouseUp={handleTextSelection}>
                    {originalTextParagraphs.length > 0 ? (
                      <div className="original-sentences-container">
                        {splitParagraphsToSentences(originalTextParagraphs).map((sentence) => (
                          <span
                            key={sentence.id}
                            className={`original-sentence ${highlightedSentenceId === sentence.id ? 'highlighted' : ''}`}
                            onMouseEnter={() => handleOriginalSentenceHover(sentence.id)}
                            onMouseLeave={() => handleOriginalSentenceHover(null)}
                          >
                            {sentence.text}{' '}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="no-content-placeholder">
                        <p>暂无原文内容</p>
                        <p style={{ fontSize: 12, color: '#999' }}>
                          请先进行翻译，原文将从翻译记录中提取
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="translation-section">
              <TranslationView
                documentId={parseInt(documentId!)}
                highlightedSentenceId={highlightedSentenceId}
                onSentenceHover={handleOriginalSentenceHover}
                onTextSelect={handleTextSelection}
              />
            </div>
            <div className="chat-section">
              <ChatPanel
                documentId={parseInt(documentId!)}
                selectedText={selectedText}
              />
            </div>
          </div>
        )}
      </Content>
    </Layout>
  )
}

export default Reader
