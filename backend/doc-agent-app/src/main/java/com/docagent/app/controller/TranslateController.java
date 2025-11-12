package com.docagent.app.controller;

import com.docagent.app.common.Result;
import com.docagent.domain.entity.Translation;
import com.docagent.domain.service.TranslationService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

/**
 * 翻译控制器
 *
 * @author li.hongjian
 * @email lihongjian01@51talk.com
 * @date 2025-11-12
 */
@Slf4j
@RestController
@RequestMapping("/translate")
@RequiredArgsConstructor
public class TranslateController {

    private final TranslationService translationService;

    /**
     * 开始翻译
     *
     * @param request 翻译请求
     * @param session HTTP会话
     * @return 翻译记录ID
     */
    @PostMapping("/start")
    public Result<Long> startTranslation(@RequestBody TranslateRequest request, HttpSession session) {
        String sessionId = session.getId();
        log.info("[翻译][Controller]-开始翻译，文档ID={}，目标语言={}，会话ID={}",
                request.getDocumentId(), request.getTargetLang(), sessionId);

        Long translationId = translationService.startTranslation(
                request.getDocumentId(),
                request.getTargetLang(),
                request.getStyle(),
                sessionId
        );
        return Result.success("翻译任务已启动", translationId);
    }

    /**
     * 获取翻译结果
     *
     * @param translationId 翻译记录ID
     * @param session HTTP会话
     * @return 翻译记录
     */
    @GetMapping("/{translationId}")
    public Result<Translation> getTranslation(@PathVariable Long translationId, HttpSession session) {
        String sessionId = session.getId();
        log.info("[翻译][Controller]-获取翻译结果，翻译ID={}，会话ID={}", translationId, sessionId);

        Translation translation = translationService.getTranslationResult(translationId, sessionId);
        return Result.success(translation);
    }

    /**
     * 获取文档最新翻译
     *
     * @param documentId 文档ID
     * @param targetLang 目标语言
     * @param session HTTP会话
     * @return 翻译记录
     */
    @GetMapping("/latest")
    public Result<Translation> getLatestTranslation(
            @RequestParam Long documentId,
            @RequestParam String targetLang,
            HttpSession session) {
        String sessionId = session.getId();
        log.info("[翻译][Controller]-获取最新翻译，文档ID={}，目标语言={}", documentId, targetLang);

        Translation translation = translationService.getLatestTranslation(documentId, targetLang, sessionId);
        return Result.success(translation);
    }

    /**
     * 翻译请求DTO
     */
    @lombok.Data
    public static class TranslateRequest {
        /**
         * 文档ID
         */
        private Long documentId;

        /**
         * 目标语言
         */
        private String targetLang;

        /**
         * 翻译风格: accurate-准确, fluent-流畅, concise-简洁
         */
        private String style = "fluent";
    }
}
