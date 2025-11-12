package com.docagent.domain.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.docagent.domain.entity.ChatHistory;
import com.docagent.domain.entity.Document;
import com.docagent.domain.repository.mysql.ChatHistoryMapper;
import com.docagent.domain.service.AiService;
import com.docagent.domain.service.ChatService;
import com.docagent.domain.service.DocumentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 对话服务实现类
 *
 * @author li.hongjian
 * @email lihongjian01@51talk.com
 * @date 2025-11-12
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChatServiceImpl extends ServiceImpl<ChatHistoryMapper, ChatHistory> implements ChatService {

    private final DocumentService documentService;
    private final AiService aiService;

    /**
     * 发送对话消息
     *
     * @param documentId 文档ID
     * @param message 用户消息
     * @param selectedText 选中的文本（可选）
     * @param sessionId 会话ID
     * @return AI回复内容
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public String sendMessage(Long documentId, String message, String selectedText, String sessionId) {
        log.info("[对话][发送]-用户发送消息，文档ID={}，消息={}", documentId, message);

        // 1. 验证文档权限
        Document document = documentService.getByIdAndSessionId(documentId, sessionId);
        if (Objects.isNull(document)) {
            throw new RuntimeException("文档不存在或无权限访问");
        }

        // 2. 保存用户消息
        ChatHistory userMessage = new ChatHistory();
        userMessage.setDocumentId(documentId);
        userMessage.setSessionId(sessionId);
        userMessage.setRole("user");
        userMessage.setContent(message);
        userMessage.setSelectedText(selectedText);
        userMessage.setCreateTime(LocalDateTime.now());
        save(userMessage);

        // 3. 构建上下文消息列表
        List<Map<String, String>> messages = buildContextMessages(documentId, sessionId, document, selectedText, message);

        // 4. 调用AI获取回复
        String aiReply = aiService.chat(messages);

        // 5. 保存AI回复
        ChatHistory assistantMessage = new ChatHistory();
        assistantMessage.setDocumentId(documentId);
        assistantMessage.setSessionId(sessionId);
        assistantMessage.setRole("assistant");
        assistantMessage.setContent(aiReply);
        assistantMessage.setCreateTime(LocalDateTime.now());
        save(assistantMessage);

        log.info("[对话][完成]-AI回复成功，回复长度={}", aiReply.length());
        return aiReply;
    }

    /**
     * 获取对话历史
     *
     * @param documentId 文档ID
     * @param sessionId 会话ID
     * @return 对话历史列表
     */
    @Override
    public List<ChatHistory> getChatHistory(Long documentId, String sessionId) {
        log.info("[对话][历史]-获取对话历史，文档ID={}，会话ID={}", documentId, sessionId);

        LambdaQueryWrapper<ChatHistory> wrapper = Wrappers.lambdaQuery(ChatHistory.class)
                .eq(ChatHistory::getDocumentId, documentId)
                .eq(ChatHistory::getSessionId, sessionId)
                .orderByAsc(ChatHistory::getCreateTime);

        List<ChatHistory> history = list(wrapper);
        log.info("[对话][历史]-获取成功，消息数量={}", history.size());

        return history;
    }

    /**
     * 清空对话历史
     *
     * @param documentId 文档ID
     * @param sessionId 会话ID
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void clearChatHistory(Long documentId, String sessionId) {
        log.info("[对话][清空]-清空对话历史，文档ID={}，会话ID={}", documentId, sessionId);

        LambdaQueryWrapper<ChatHistory> wrapper = Wrappers.lambdaQuery(ChatHistory.class)
                .eq(ChatHistory::getDocumentId, documentId)
                .eq(ChatHistory::getSessionId, sessionId);

        remove(wrapper);
        log.info("[对话][清空]-清空成功");
    }

    /**
     * 构建上下文消息列表
     */
    private List<Map<String, String>> buildContextMessages(
            Long documentId,
            String sessionId,
            Document document,
            String selectedText,
            String userMessage) {

        List<Map<String, String>> messages = new ArrayList<>();

        // 1. 系统提示词
        String systemPrompt = buildSystemPrompt(document, selectedText);
        messages.add(Map.of("role", "system", "content", systemPrompt));

        // 2. 获取历史对话（最近10条）
        LambdaQueryWrapper<ChatHistory> wrapper = Wrappers.lambdaQuery(ChatHistory.class)
                .eq(ChatHistory::getDocumentId, documentId)
                .eq(ChatHistory::getSessionId, sessionId)
                .orderByDesc(ChatHistory::getCreateTime)
                .last("LIMIT 10");

        List<ChatHistory> recentHistory = list(wrapper);

        // 反转顺序（从旧到新）
        Collections.reverse(recentHistory);

        for (ChatHistory history : recentHistory) {
            messages.add(Map.of("role", history.getRole(), "content", history.getContent()));
        }

        // 3. 当前用户消息
        messages.add(Map.of("role", "user", "content", userMessage));

        return messages;
    }

    /**
     * 构建系统提示词
     */
    private String buildSystemPrompt(Document document, String selectedText) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("你是一个智能文档阅读助手，帮助用户理解和分析文档内容。\n\n");

        // 文档信息
        prompt.append("当前文档信息：\n");
        prompt.append("- 文件名：").append(document.getFileName()).append("\n");
        prompt.append("- 页数：").append(document.getPageCount()).append("\n\n");

        // 如果有选中文本，优先基于选中文本回答
        if (StringUtils.isNotBlank(selectedText)) {
            prompt.append("用户选中的文本内容：\n");
            prompt.append("```\n").append(selectedText).append("\n```\n\n");
            prompt.append("请主要针对用户选中的这段文本内容进行回答。\n\n");
        } else {
            // 提供文档的部分内容作为上下文
            String textContent = document.getTextContent();
            if (StringUtils.isNotBlank(textContent)) {
                // 只提供前2000字符作为上下文
                String contextText = textContent.length() > 2000
                        ? textContent.substring(0, 2000) + "..."
                        : textContent;

                prompt.append("文档内容摘要：\n");
                prompt.append("```\n").append(contextText).append("\n```\n\n");
            }
        }

        prompt.append("请根据以上文档信息和用户的问题，提供准确、有帮助的回答。");

        return prompt.toString();
    }
}
