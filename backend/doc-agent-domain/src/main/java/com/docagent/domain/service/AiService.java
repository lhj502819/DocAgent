package com.docagent.domain.service;

import java.util.List;
import java.util.Map;

/**
 * AI服务接口
 *
 * @author li.hongjian
 * @email lihongjian01@51talk.com
 * @date 2025-11-12
 */
public interface AiService {

    /**
     * 调用AI进行文本翻译
     *
     * @param text 待翻译文本
     * @param sourceLang 源语言
     * @param targetLang 目标语言
     * @param style 翻译风格
     * @return 翻译结果
     */
    String translate(String text, String sourceLang, String targetLang, String style);

    /**
     * 调用AI进行对话
     *
     * @param messages 对话消息列表，每个消息包含role和content
     * @return AI回复内容
     */
    String chat(List<Map<String, String>> messages);

    /**
     * 调用AI进行流式对话（用于实时返回）
     *
     * @param messages 对话消息列表
     * @param callback 回调函数，用于接收流式输出
     */
    void chatStream(List<Map<String, String>> messages, StreamCallback callback);

    /**
     * 流式输出回调接口
     */
    interface StreamCallback {
        /**
         * 接收流式输出的每一块内容
         *
         * @param chunk 内容块
         */
        void onChunk(String chunk);

        /**
         * 流式输出完成
         */
        void onComplete();

        /**
         * 流式输出错误
         *
         * @param error 错误信息
         */
        void onError(Throwable error);
    }
}
