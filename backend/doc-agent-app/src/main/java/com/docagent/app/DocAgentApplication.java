package com.docagent.app;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * DocAgent应用主类
 *
 * @author li.hongjian
 * @email lihongjian01@51talk.com
 * @date 2025-11-12
 */
@SpringBootApplication(scanBasePackages = "com.docagent")
@MapperScan("com.docagent.domain.repository.mysql")
public class DocAgentApplication {

    public static void main(String[] args) {
        SpringApplication.run(DocAgentApplication.class, args);
    }
}
