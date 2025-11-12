package com.docagent.domain.service.impl;

import com.docagent.domain.config.AiConfig;
import com.docagent.domain.service.AiService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.TimeUnit;

/**
 * AI服务实现类（基于OpenAI协议）
 *
 * @author li.hongjian
 * @email lihongjian01@51talk.com
 * @date 2025-11-12
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiServiceImpl implements AiService {

    private final AiConfig aiConfig;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");

    /**
     * 调用AI进行文本翻译
     *
     * @param text 待翻译文本
     * @param sourceLang 源语言
     * @param targetLang 目标语言
     * @param style 翻译风格
     * @return 翻译结果
     */
    @Override
    public String translate(String text, String sourceLang, String targetLang, String style) {
        log.info("[AI][翻译]-开始翻译，源语言={}，目标语言={}，风格={}", sourceLang, targetLang, style);

        // 构建翻译提示词
        String prompt = buildTranslatePrompt(text, sourceLang, targetLang, style);

        // 构建消息列表
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", "你是一个专业的翻译助手，擅长各种语言的翻译工作。"));
        messages.add(Map.of("role", "user", "content", prompt));

        // 调用AI
        String result = chat(messages);

        log.info("[AI][翻译]-翻译完成，结果长度={}", result.length());
        return result;
    }

    /**
     * 调用AI进行对话
     *
     * @param messages 对话消息列表
     * @return AI回复内容
     */
    @Override
    public String chat(List<Map<String, String>> messages) {
        log.info("[AI][对话]-开始调用AI，消息数量={}", messages.size());

        try {
            // 构建请求体
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", aiConfig.getModel());
            requestBody.put("messages", messages);
            requestBody.put("temperature", 0.7);

            String requestJson = objectMapper.writeValueAsString(requestBody);
            log.debug("[AI][对话]-请求参数={}", requestJson);

            // 发送HTTP请求
            OkHttpClient client = new OkHttpClient.Builder()
                    .connectTimeout(aiConfig.getTimeout(), TimeUnit.MILLISECONDS)
                    .readTimeout(aiConfig.getTimeout(), TimeUnit.MILLISECONDS)
                    .build();

            Request request = new Request.Builder()
                    .url(aiConfig.getApiUrl() + "/chat/completions")
                    .addHeader("Authorization", "Bearer " + aiConfig.getApiKey())
                    .addHeader("Content-Type", "application/json")
                    .post(RequestBody.create(requestJson, JSON))
                    .build();

            try (Response response = client.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    String errorBody = response.body() != null ? response.body().string() : "";
                    log.error("[AI][对话]-API调用失败，状态码={}，错误信息={}", response.code(), errorBody);
                    throw new RuntimeException("AI API调用失败: " + response.code());
                }

                String responseBody = response.body().string();
                log.debug("[AI][对话]-响应结果={}", responseBody);

                // 解析响应
                JsonNode rootNode = objectMapper.readTree(responseBody);
                String content = rootNode.path("choices")
                        .get(0)
                        .path("message")
                        .path("content")
                        .asText();

                log.info("[AI][对话]-AI回复成功，内容长度={}", content.length());
                return content;
            }

        } catch (IOException e) {
            log.error("[AI][对话]-AI调用异常", e);
            throw new RuntimeException("AI调用失败: " + e.getMessage(), e);
        }
    }

    /**
     * 调用AI进行流式对话
     *
     * @param messages 对话消息列表
     * @param callback 回调函数
     */
    @Override
    public void chatStream(List<Map<String, String>> messages, StreamCallback callback) {
        log.info("[AI][流式对话]-开始调用AI，消息数量={}", messages.size());

        try {
            // 构建请求体
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", aiConfig.getModel());
            requestBody.put("messages", messages);
            requestBody.put("temperature", 0.7);
            requestBody.put("stream", true);

            String requestJson = objectMapper.writeValueAsString(requestBody);

            // 发送HTTP请求
            OkHttpClient client = new OkHttpClient.Builder()
                    .connectTimeout(aiConfig.getTimeout(), TimeUnit.MILLISECONDS)
                    .readTimeout(aiConfig.getTimeout(), TimeUnit.MILLISECONDS)
                    .build();

            Request request = new Request.Builder()
                    .url(aiConfig.getApiUrl() + "/chat/completions")
                    .addHeader("Authorization", "Bearer " + aiConfig.getApiKey())
                    .addHeader("Content-Type", "application/json")
                    .post(RequestBody.create(requestJson, JSON))
                    .build();

            try (Response response = client.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    callback.onError(new RuntimeException("AI API调用失败: " + response.code()));
                    return;
                }

                // 处理流式响应
                ResponseBody body = response.body();
                if (body == null) {
                    callback.onError(new RuntimeException("响应体为空"));
                    return;
                }

                Scanner scanner = new Scanner(body.byteStream());
                while (scanner.hasNextLine()) {
                    String line = scanner.nextLine();
                    if (line.startsWith("data: ")) {
                        String data = line.substring(6);
                        if ("[DONE]".equals(data)) {
                            callback.onComplete();
                            break;
                        }

                        try {
                            JsonNode dataNode = objectMapper.readTree(data);
                            String content = dataNode.path("choices")
                                    .get(0)
                                    .path("delta")
                                    .path("content")
                                    .asText();

                            if (StringUtils.isNotBlank(content)) {
                                callback.onChunk(content);
                            }
                        } catch (Exception e) {
                            log.warn("[AI][流式对话]-解析数据失败: {}", data);
                        }
                    }
                }

                log.info("[AI][流式对话]-流式对话完成");
            }

        } catch (Exception e) {
            log.error("[AI][流式对话]-AI调用异常", e);
            callback.onError(e);
        }
    }

    /**
     * 构建翻译提示词
     */
    private String buildTranslatePrompt(String text, String sourceLang, String targetLang, String style) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("请将以下文本从");
        if (StringUtils.isNotBlank(sourceLang)) {
            prompt.append(sourceLang);
        } else {
            prompt.append("原语言");
        }
        prompt.append("翻译成").append(targetLang).append("。\n\n");

        // 根据翻译风格添加要求
        if ("accurate".equals(style)) {
            prompt.append("翻译要求：准确、专业，适用于技术文档。\n\n");
        } else if ("fluent".equals(style)) {
            prompt.append("翻译要求：流畅、自然，适用于通用文档。\n\n");
        } else if ("concise".equals(style)) {
            prompt.append("翻译要求：简洁、精炼，适用于快速阅读。\n\n");
        }

        prompt.append("待翻译文本：\n").append(text);

        return prompt.toString();
    }
}
