import { Layout, Upload, Typography, List, Card, message, Spin } from 'antd'
import { InboxOutlined, FileTextOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { documentApiWithMock as documentApi, Document } from '../../api/mockApi'
import './Home.css'

const { Header, Content } = Layout
const { Title, Text } = Typography
const { Dragger } = Upload

/**
 * 首页 - 文档上传页
 */
function Home() {
  const navigate = useNavigate()
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  // 加载最近文档列表
  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const documents = await documentApi.getDocumentList()
      setRecentDocuments(documents)
    } catch (error) {
      console.error('[文档列表]-加载失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.pdf',
    showUploadList: false,
    beforeUpload: (file) => {
      // 检查文件大小（50MB）
      const isLt50M = file.size / 1024 / 1024 < 50
      if (!isLt50M) {
        message.error('文件大小不能超过50MB')
        return false
      }

      // 检查文件格式
      const isPDF = file.type === 'application/pdf'
      if (!isPDF) {
        message.error('只支持PDF格式文件')
        return false
      }

      return true
    },
    customRequest: async ({ file, onSuccess, onError, onProgress }) => {
      try {
        setUploading(true)
        message.loading({ content: '正在上传文档...', key: 'upload', duration: 0 })

        const documentId = await documentApi.uploadDocument(file as File)

        message.success({ content: '文档上传成功', key: 'upload', duration: 2 })
        onSuccess?.(documentId)

        // 跳转到阅读器页面
        navigate(`/reader/${documentId}`)
      } catch (error: any) {
        console.error('[文档上传]-上传失败:', error)
        message.error({ content: error.message || '文档上传失败', key: 'upload' })
        onError?.(error)
      } finally {
        setUploading(false)
      }
    },
  }

  /**
   * 格式化文件大小
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  }

  return (
    <Layout className="home-layout">
      <Header className="home-header">
        <Title level={2} className="home-title">
          DocAgent
        </Title>
      </Header>
      <Content className="home-content">
        <div className="upload-section">
          <Dragger {...uploadProps} className="upload-dragger" disabled={uploading}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              {uploading ? '正在上传...' : '点击或拖拽文件到此区域上传'}
            </p>
            <p className="ant-upload-hint">支持PDF格式，文件大小不超过50MB</p>
          </Dragger>
        </div>

        <div className="recent-section">
          <Title level={4}>最近文档</Title>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin tip="加载中..." />
            </div>
          ) : recentDocuments.length > 0 ? (
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }}
              dataSource={recentDocuments}
              renderItem={(item) => (
                <List.Item>
                  <Card
                    hoverable
                    onClick={() => navigate(`/reader/${item.id}`)}
                    className="document-card"
                  >
                    <div className="document-icon">
                      <FileTextOutlined style={{ fontSize: 48, color: '#5a8c7e' }} />
                    </div>
                    <Card.Meta
                      title={item.fileName}
                      description={
                        <>
                          <div>{item.pageCount} 页</div>
                          <div>{formatFileSize(item.fileSize)}</div>
                          <div className="document-time">
                            {new Date(item.createTime).toLocaleDateString('zh-CN')}
                          </div>
                        </>
                      }
                    />
                  </Card>
                </List.Item>
              )}
            />
          ) : (
            <div className="empty-state">
              <FileTextOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
              <Text type="secondary">暂无文档，请上传PDF文件开始使用</Text>
            </div>
          )}
        </div>
      </Content>
    </Layout>
  )
}

export default Home
