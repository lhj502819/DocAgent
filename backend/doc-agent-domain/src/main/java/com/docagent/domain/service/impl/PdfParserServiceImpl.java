package com.docagent.domain.service.impl;

import com.docagent.domain.service.PdfParserService;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;

/**
 * PDF解析服务实现类
 *
 * @author li.hongjian
 * @email lihongjian01@51talk.com
 * @date 2025-11-12
 */
@Slf4j
@Service
public class PdfParserServiceImpl implements PdfParserService {

    /**
     * 提取PDF文本内容
     *
     * @param inputStream PDF文件输入流
     * @return 文本内容
     */
    @Override
    public String extractText(InputStream inputStream) {
        log.info("[PDF][解析]-开始提取PDF文本内容");

        try (PDDocument document = Loader.loadPDF(inputStream.readAllBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);

            log.info("[PDF][解析]-PDF文本提取成功，文本长度={}", text.length());
            return text;

        } catch (IOException e) {
            log.error("[PDF][解析]-PDF文本提取失败", e);
            throw new RuntimeException("PDF文本提取失败: " + e.getMessage(), e);
        }
    }

    /**
     * 获取PDF页数
     *
     * @param inputStream PDF文件输入流
     * @return 页数
     */
    @Override
    public int getPageCount(InputStream inputStream) {
        log.info("[PDF][解析]-开始获取PDF页数");

        try (PDDocument document = Loader.loadPDF(inputStream.readAllBytes())) {
            int pageCount = document.getNumberOfPages();

            log.info("[PDF][解析]-获取PDF页数成功，页数={}", pageCount);
            return pageCount;

        } catch (IOException e) {
            log.error("[PDF][解析]-获取PDF页数失败", e);
            throw new RuntimeException("获取PDF页数失败: " + e.getMessage(), e);
        }
    }
}
