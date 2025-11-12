package com.docagent.domain.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.docagent.domain.entity.ChatHistory;

import java.util.List;

/**
 * 对话服务接口
 *
 * @author li.hongjian
 * @email lihongjian01@51talk.com
 * @date 2025-11-12
 */
public interface ChatService extends IService<ChatHistory> {

    /**
     * 发送对话消息
     *
     * @param documentId 文档ID
     * @param message 用户消息
     * @param selectedText 选中的文本（可选）
     * @param sessionId 会话ID
     * @return AI回复内容
     */
    String sendMessage(Long documentId, String message, String selectedText, String sessionId);

    /**
     * 获取对话历史
     *
     * @param documentId 文档ID
     * @param sessionId 会话ID
     * @return 对话历史列表
     */
    List<ChatHistory> getChatHistory(Long documentId, String sessionId);

    /**
     * 清空对话历史
     *
     * @param documentId 文档ID
     * @param sessionId 会话ID
     */
    void clearChatHistory(Long documentId, String sessionId);
}
