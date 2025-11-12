import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App'
import './styles/index.css'

// 水墨风格主题配置
const theme = {
  token: {
    colorPrimary: '#5a8c7e', // 竹青色
    colorError: '#c8553d', // 朱砂色
    colorTextBase: '#1a1a1a', // 墨黑色
    colorBgBase: '#f9f7f4', // 宣纸白
    borderRadius: 4,
    fontFamily: "'Noto Serif', 'Source Han Serif', serif",
  },
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider theme={theme} locale={zhCN}>
      <App />
    </ConfigProvider>
  </React.StrictMode>,
)
