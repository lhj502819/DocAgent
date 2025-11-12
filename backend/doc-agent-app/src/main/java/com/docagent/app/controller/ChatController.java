package com.docagent.app.controller;

import com.docagent.app.common.Result;
import com.docagent.domain.entity.ChatHistory;
import com.docagent.domain.service.ChatService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 对话控制器
 *
 * @author li.hongjian
 * @email lihongjian01@51talk.com
 * @date 2025-11-12
 */
@Slf4j
@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    /**
     * 发送对话消息
     *
     * @param request 对话请求
     * @param session HTTP会话
     * @return AI回复内容
     */
    @PostMapping("/send")
    public Result<String> sendMessage(@RequestBody ChatRequest request, HttpSession session) {
        String sessionId = session.getId();
        log.info("[对话][Controller]-发送消息，文档ID={}，会话ID={}", request.getDocumentId(), sessionId);

        String reply = chatService.sendMessage(
                request.getDocumentId(),
                request.getMessage(),
                request.getSelectedText(),
                sessionId
        );
        return Result.success(reply);
    }

    /**
     * 获取对话历史
     *
     * @param documentId 文档ID
     * @param session HTTP会话
     * @return 对话历史列表
     */
    @GetMapping("/history")
    public Result<List<ChatHistory>> getChatHistory(
            @RequestParam Long documentId,
            HttpSession session) {
        String sessionId = session.getId();
        log.info("[对话][Controller]-获取对话历史，文档ID={}，会话ID={}", documentId, sessionId);

        List<ChatHistory> history = chatService.getChatHistory(documentId, sessionId);
        return Result.success(history);
    }

    /**
     * 清空对话历史
     *
     * @param documentId 文档ID
     * @param session HTTP会话
     */
    @DeleteMapping("/clear")
    public Result<Void> clearChatHistory(
            @RequestParam Long documentId,
            HttpSession session) {
        String sessionId = session.getId();
        log.info("[对话][Controller]-清空对话历史，文档ID={}，会话ID={}", documentId, sessionId);

        chatService.clearChatHistory(documentId, sessionId);
        return Result.success("对话历史已清空", null);
    }

    /**
     * 对话请求DTO
     */
    @lombok.Data
    public static class ChatRequest {
        /**
         * 文档ID
         */
        private Long documentId;

        /**
         * 用户消息
         */
        private String message;

        /**
         * 选中的文本（可选）
         */
        private String selectedText;
    }
}
