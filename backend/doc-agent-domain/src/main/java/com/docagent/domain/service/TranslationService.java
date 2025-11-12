package com.docagent.domain.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.docagent.domain.entity.Translation;

/**
 * 翻译服务接口
 *
 * @author li.hongjian
 * @email lihongjian01@51talk.com
 * @date 2025-11-12
 */
public interface TranslationService extends IService<Translation> {

    /**
     * 开始翻译文档
     *
     * @param documentId 文档ID
     * @param targetLang 目标语言
     * @param style 翻译风格
     * @param sessionId 会话ID
     * @return 翻译记录ID
     */
    Long startTranslation(Long documentId, String targetLang, String style, String sessionId);

    /**
     * 获取翻译结果
     *
     * @param translationId 翻译记录ID
     * @param sessionId 会话ID
     * @return 翻译记录
     */
    Translation getTranslationResult(Long translationId, String sessionId);

    /**
     * 根据文档ID获取最新翻译
     *
     * @param documentId 文档ID
     * @param targetLang 目标语言
     * @param sessionId 会话ID
     * @return 翻译记录
     */
    Translation getLatestTranslation(Long documentId, String targetLang, String sessionId);
}
