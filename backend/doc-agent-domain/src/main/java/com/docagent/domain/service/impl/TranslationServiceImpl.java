package com.docagent.domain.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.docagent.domain.entity.Document;
import com.docagent.domain.entity.Translation;
import com.docagent.domain.repository.mysql.TranslationMapper;
import com.docagent.domain.service.AiService;
import com.docagent.domain.service.DocumentService;
import com.docagent.domain.service.TranslationService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 翻译服务实现类
 *
 * @author li.hongjian
 * @email lihongjian01@51talk.com
 * @date 2025-11-12
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TranslationServiceImpl extends ServiceImpl<TranslationMapper, Translation> implements TranslationService {

    private final DocumentService documentService;
    private final AiService aiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 开始翻译文档
     *
     * @param documentId 文档ID
     * @param targetLang 目标语言
     * @param style 翻译风格
     * @param sessionId 会话ID
     * @return 翻译记录ID
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long startTranslation(Long documentId, String targetLang, String style, String sessionId) {
        log.info("[翻译][开始]-开始翻译文档，文档ID={}，目标语言={}，风格={}", documentId, targetLang, style);

        // 1. 查询文档
        Document document = documentService.getByIdAndSessionId(documentId, sessionId);
        if (Objects.isNull(document)) {
            throw new RuntimeException("文档不存在");
        }

        // 2. 检查是否已有相同翻译（可使用缓存）
        Translation existTranslation = getLatestTranslation(documentId, targetLang, sessionId);
        if (Objects.nonNull(existTranslation) && existTranslation.getStatus() == 1) {
            log.info("[翻译][开始]-翻译已存在，直接返回，翻译ID={}", existTranslation.getId());
            return existTranslation.getId();
        }

        // 3. 创建翻译记录
        Translation translation = new Translation();
        translation.setDocumentId(documentId);
        translation.setSourceLang("auto"); // 自动检测
        translation.setTargetLang(targetLang);
        translation.setTranslateStyle(style);
        translation.setStatus(0); // 0-翻译中
        translation.setCreateTime(LocalDateTime.now());
        save(translation);

        // 4. 调用AI进行翻译（简化版：直接翻译全文）
        try {
            String textContent = document.getTextContent();

            // 如果文本太长，分段翻译
            List<String> paragraphs = splitTextIntoParagraphs(textContent);
            List<Map<String, String>> translatedParagraphs = new ArrayList<>();

            log.info("[翻译][执行]-文本分段数量={}", paragraphs.size());

            for (int i = 0; i < paragraphs.size(); i++) {
                String paragraph = paragraphs.get(i);
                log.info("[翻译][执行]-翻译第{}段，长度={}", i + 1, paragraph.length());

                String translatedText = aiService.translate(paragraph, null, targetLang, style);

                Map<String, String> paragraphMap = new HashMap<>();
                paragraphMap.put("index", String.valueOf(i));
                paragraphMap.put("original", paragraph);
                paragraphMap.put("translated", translatedText);
                translatedParagraphs.add(paragraphMap);
            }

            // 5. 保存翻译结果（JSON格式）
            String translatedContent = objectMapper.writeValueAsString(translatedParagraphs);
            translation.setTranslatedContent(translatedContent);
            translation.setStatus(1); // 1-已完成
            updateById(translation);

            log.info("[翻译][完成]-翻译完成，翻译ID={}", translation.getId());
            return translation.getId();

        } catch (JsonProcessingException e) {
            log.error("[翻译][失败]-翻译失败", e);
            translation.setStatus(2); // 2-失败
            updateById(translation);
            throw new RuntimeException("翻译失败: " + e.getMessage(), e);
        }
    }

    /**
     * 获取翻译结果
     *
     * @param translationId 翻译记录ID
     * @param sessionId 会话ID
     * @return 翻译记录
     */
    @Override
    public Translation getTranslationResult(Long translationId, String sessionId) {
        log.info("[翻译][结果]-获取翻译结果，翻译ID={}，会话ID={}", translationId, sessionId);

        Translation translation = getById(translationId);
        if (Objects.isNull(translation)) {
            throw new RuntimeException("翻译记录不存在");
        }

        // 验证权限（通过文档验证）
        Document document = documentService.getByIdAndSessionId(translation.getDocumentId(), sessionId);
        if (Objects.isNull(document)) {
            throw new RuntimeException("无权限访问该翻译");
        }

        return translation;
    }

    /**
     * 根据文档ID获取最新翻译
     *
     * @param documentId 文档ID
     * @param targetLang 目标语言
     * @param sessionId 会话ID
     * @return 翻译记录
     */
    @Override
    public Translation getLatestTranslation(Long documentId, String targetLang, String sessionId) {
        log.info("[翻译][查询]-查询最新翻译，文档ID={}，目标语言={}", documentId, targetLang);

        LambdaQueryWrapper<Translation> wrapper = Wrappers.lambdaQuery(Translation.class)
                .eq(Translation::getDocumentId, documentId)
                .eq(Translation::getTargetLang, targetLang)
                .orderByDesc(Translation::getCreateTime)
                .last("LIMIT 1");

        return getOne(wrapper);
    }

    /**
     * 将文本分段（简化版：按段落分割）
     */
    private List<String> splitTextIntoParagraphs(String text) {
        if (Objects.isNull(text) || text.isEmpty()) {
            return Collections.emptyList();
        }

        // 按双换行符分段
        String[] paragraphs = text.split("\n\n+");
        List<String> result = new ArrayList<>();

        for (String paragraph : paragraphs) {
            String trimmed = paragraph.trim();
            if (!trimmed.isEmpty()) {
                result.add(trimmed);
            }
        }

        // 如果没有双换行符，按单换行符分段
        if (result.isEmpty()) {
            String[] lines = text.split("\n");
            result = Arrays.asList(lines);
        }

        return result;
    }
}
