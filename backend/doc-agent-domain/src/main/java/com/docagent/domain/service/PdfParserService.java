package com.docagent.domain.service;

import java.io.InputStream;

/**
 * PDF解析服务接口
 *
 * @author li.hongjian
 * @email lihongjian01@51talk.com
 * @date 2025-11-12
 */
public interface PdfParserService {

    /**
     * 提取PDF文本内容
     *
     * @param inputStream PDF文件输入流
     * @return 文本内容
     */
    String extractText(InputStream inputStream);

    /**
     * 获取PDF页数
     *
     * @param inputStream PDF文件输入流
     * @return 页数
     */
    int getPageCount(InputStream inputStream);
}
