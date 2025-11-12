package com.docagent.domain.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * AI配置类
 *
 * @author li.hongjian
 * @email lihongjian01@51talk.com
 * @date 2025-11-12
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "app.ai.openai")
public class AiConfig {

    /**
     * OpenAI API密钥
     */
    private String apiKey;

    /**
     * OpenAI API地址
     */
    private String apiUrl;

    /**
     * 使用的模型
     */
    private String model;

    /**
     * 超时时间（毫秒）
     */
    private Long timeout = 60000L;
}
