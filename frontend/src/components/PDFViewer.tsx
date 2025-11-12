import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button, Space, Spin, message } from 'antd';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './PDFViewer.css';

// 配置 PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  /**
   * PDF文件URL或本地路径
   */
  file: string | File | null;
  /**
   * 文本选中回调
   */
  onTextSelect?: (text: string) => void;
}

/**
 * PDF查看器组件
 */
function PDFViewer({ file, onTextSelect }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * PDF文档加载成功回调
   */
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  /**
   * PDF文档加载错误回调
   */
  const onDocumentLoadError = (error: Error) => {
    console.error('[PDF查看器]-加载失败:', error);
    message.error('PDF文档加载失败');
    setLoading(false);
  };

  /**
   * 监听文本选中事件
   */
  useEffect(() => {
    const handleTextSelection = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();
      if (selectedText && onTextSelect) {
        onTextSelect(selectedText);
      }
    };

    document.addEventListener('mouseup', handleTextSelection);
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
    };
  }, [onTextSelect]);

  /**
   * 缩放控制
   */
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  /**
   * 翻页控制
   */
  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  if (!file) {
    return (
      <div className="pdf-viewer-empty">
        <p>请选择PDF文档</p>
      </div>
    );
  }

  return (
    <div className="pdf-viewer-container">
      {/* 工具栏 */}
      <div className="pdf-toolbar">
        <Space>
          <Button
            size="small"
            icon={<LeftOutlined />}
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
          >
            上一页
          </Button>
          <span className="page-info">
            {pageNumber} / {numPages}
          </span>
          <Button
            size="small"
            icon={<RightOutlined />}
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
          >
            下一页
          </Button>
        </Space>
        <Space>
          <Button
            size="small"
            icon={<ZoomOutOutlined />}
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
          >
            缩小
          </Button>
          <span>{Math.round(scale * 100)}%</span>
          <Button
            size="small"
            icon={<ZoomInOutlined />}
            onClick={handleZoomIn}
            disabled={scale >= 3.0}
          >
            放大
          </Button>
        </Space>
      </div>

      {/* PDF内容区域 */}
      <div className="pdf-content">
        <Spin spinning={loading} tip="加载中...">
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<Spin tip="加载PDF文档..." />}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        </Spin>
      </div>
    </div>
  );
}

export default PDFViewer;
