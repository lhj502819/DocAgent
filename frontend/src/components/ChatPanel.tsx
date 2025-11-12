import { useState, useEffect, useRef } from 'react';
import { Input, Button, Empty, Spin, message as antMessage } from 'antd';
import {
  SendOutlined,
  DeleteOutlined,
  RobotOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { chatApiWithMock as chatApi, ChatHistory } from '../api/mockApi';
import './ChatPanel.css';

const { TextArea } = Input;

interface ChatPanelProps {
  /**
   * 文档ID
   */
  documentId: number;
  /**
   * 选中的文本（可选）
   */
  selectedText?: string;
}

/**
 * 对话面板组件
 */
function ChatPanel({ documentId, selectedText }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatHistory[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * 加载对话历史
   */
  const loadChatHistory = async () => {
    try {
      setLoading(true);
      const history = await chatApi.getChatHistory(documentId);
      setMessages(history);
    } catch (error: any) {
      console.log('[对话面板]-加载历史失败:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 发送消息
   */
  const handleSendMessage = async () => {
    if (!inputValue.trim()) {
      antMessage.warning('请输入消息内容');
      return;
    }

    const userMessage = inputValue.trim();
    setInputValue('');

    try {
      setSending(true);

      // 添加用户消息到界面
      const userChatHistory: ChatHistory = {
        id: Date.now(),
        documentId,
        sessionId: '',
        role: 'user',
        content: userMessage,
        selectedText,
        createTime: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userChatHistory]);

      // 发送到后端
      const aiReply = await chatApi.sendMessage({
        documentId,
        message: userMessage,
        selectedText,
      });

      // 添加AI回复到界面
      const aiChatHistory: ChatHistory = {
        id: Date.now() + 1,
        documentId,
        sessionId: '',
        role: 'assistant',
        content: aiReply,
        createTime: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiChatHistory]);
    } catch (error: any) {
      console.error('[对话面板]-发送消息失败:', error);
      antMessage.error('发送消息失败');
    } finally {
      setSending(false);
    }
  };

  /**
   * 清空对话历史
   */
  const handleClearHistory = async () => {
    try {
      await chatApi.clearChatHistory(documentId);
      setMessages([]);
      antMessage.success('对话历史已清空');
    } catch (error: any) {
      console.error('[对话面板]-清空历史失败:', error);
      antMessage.error('清空历史失败');
    }
  };

  /**
   * 使用选中文本提问
   */
  useEffect(() => {
    if (selectedText) {
      setInputValue(`请解释这段文本：\n${selectedText}`);
    }
  }, [selectedText]);

  /**
   * 组件挂载时加载历史
   */
  useEffect(() => {
    if (documentId) {
      loadChatHistory();
    }
  }, [documentId]);

  /**
   * 滚动到底部
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * 按Enter发送消息
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-panel-container">
      {/* 对话历史区域 */}
      <div className="chat-messages">
        {loading ? (
          <div className="chat-loading">
            <Spin tip="加载对话历史..." />
          </div>
        ) : messages.length > 0 ? (
          <>
            {messages.map((msg) => (
              <div key={msg.id} className={`message-item ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                </div>
                <div className="message-content">
                  {msg.selectedText && (
                    <div className="message-context">
                      <div className="context-label">选中文本:</div>
                      <div className="context-text">{msg.selectedText}</div>
                    </div>
                  )}
                  <div className="message-text">{msg.content}</div>
                  <div className="message-time">
                    {new Date(msg.createTime).toLocaleTimeString('zh-CN')}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="chat-empty">
            <Empty description="暂无对话记录，开始提问吧" />
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="chat-input-area">
        <div className="chat-actions">
          <Button
            size="small"
            icon={<DeleteOutlined />}
            onClick={handleClearHistory}
            disabled={messages.length === 0}
          >
            清空历史
          </Button>
        </div>
        <div className="chat-input-wrapper">
          <TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息... (Shift+Enter换行，Enter发送)"
            autoSize={{ minRows: 2, maxRows: 6 }}
            disabled={sending}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            loading={sending}
            disabled={sending || !inputValue.trim()}
          >
            发送
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ChatPanel;
