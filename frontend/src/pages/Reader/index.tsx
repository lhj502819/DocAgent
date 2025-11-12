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

  // 加载文档信息
  useEffect(() => {
    if (documentId) {
      loadDocument(parseInt(documentId))
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
                <div className="mock-pdf-placeholder">
                  <div className="mock-content">
                    <FileTextOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
                    <h3>PDF预览区域</h3>
                    <p>Mock模式下暂不显示PDF内容</p>
                    <p style={{ fontSize: 12, color: '#999' }}>
                      文档：{document?.fileName}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="translation-section">
              <TranslationView
                documentId={parseInt(documentId!)}
                onParagraphSelect={handleParagraphSelect}
              />
            </div>
            <div className="chat-section">
              <ChatPanel
                documentId={parseInt(documentId!)}
                selectedText={selectedText || selectedParagraph?.translated}
              />
            </div>
          </div>
        )}
      </Content>
    </Layout>
  )
}

export default Reader
