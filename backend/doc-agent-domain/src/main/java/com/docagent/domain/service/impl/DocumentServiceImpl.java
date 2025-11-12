package com.docagent.domain.service.impl;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.IdUtil;
import cn.hutool.crypto.digest.DigestUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.docagent.domain.dto.FileUploadDTO;
import com.docagent.domain.entity.Document;
import com.docagent.domain.repository.mysql.DocumentMapper;
import com.docagent.domain.service.DocumentService;
import com.docagent.domain.service.PdfParserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

/**
 * 文档服务实现类
 *
 * @author li.hongjian
 * @email lihongjian01@51talk.com
 * @date 2025-11-12
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentServiceImpl extends ServiceImpl<DocumentMapper, Document> implements DocumentService {

    private final PdfParserService pdfParserService;

    @Value("${app.file.storage-path:./storage/documents}")
    private String storagePath;

    /**
     * 上传文档
     *
     * @param fileUpload 文件上传信息
     * @param sessionId 会话ID
     * @return 文档ID
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long uploadDocument(FileUploadDTO fileUpload, String sessionId) {
        log.info("[文档][上传]-开始处理文档上传，文件名={}，会话ID={}", fileUpload.getOriginalFilename(), sessionId);

        try {
            // 1. 校验文件
            validateFile(fileUpload);

            // 2. 读取文件内容计算MD5
            byte[] fileBytes = fileUpload.getInputStream().readAllBytes();
            String md5 = DigestUtil.md5Hex(fileBytes);
            log.info("[文档][上传]-文件MD5={}", md5);

            // 3. 检查是否已存在相同文件
            Document existDoc = checkExistDocument(md5, sessionId);
            if (Objects.nonNull(existDoc)) {
                log.info("[文档][上传]-文档已存在，直接返回，文档ID={}", existDoc.getId());
                return existDoc.getId();
            }

            // 4. 保存文件到磁盘
            String filePath = saveFileToDisk(fileBytes, fileUpload.getOriginalFilename());
            log.info("[文档][上传]-文件保存成功，路径={}", filePath);

            // 5. 提取PDF文本和页数（使用新的输入流）
            ByteArrayInputStream textStream = new ByteArrayInputStream(fileBytes);
            String textContent = pdfParserService.extractText(textStream);

            ByteArrayInputStream pageStream = new ByteArrayInputStream(fileBytes);
            int pageCount = pdfParserService.getPageCount(pageStream);

            // 6. 保存文档信息到数据库
            Document document = new Document();
            document.setSessionId(sessionId);
            document.setFileName(fileUpload.getOriginalFilename());
            document.setFileSize(fileUpload.getFileSize());
            document.setFilePath(filePath);
            document.setFileMd5(md5);
            document.setPageCount(pageCount);
            document.setTextContent(textContent);
            document.setStatus(1); // 1-已完成
            document.setCreateTime(LocalDateTime.now());
            document.setUpdateTime(LocalDateTime.now());

            save(document);

            log.info("[文档][上传]-文档上传成功，文档ID={}，页数={}，文本长度={}",
                    document.getId(), pageCount, textContent.length());

            return document.getId();

        } catch (IOException e) {
            log.error("[文档][上传]-文档上传失败", e);
            throw new RuntimeException("文档上传失败: " + e.getMessage(), e);
        }
    }

    /**
     * 根据会话ID查询文档列表
     *
     * @param sessionId 会话ID
     * @return 文档列表
     */
    @Override
    public List<Document> listBySessionId(String sessionId) {
        log.info("[文档][列表]-查询文档列表，会话ID={}", sessionId);

        LambdaQueryWrapper<Document> wrapper = Wrappers.lambdaQuery(Document.class)
                .eq(Document::getSessionId, sessionId)
                .eq(Document::getStatus, 1)
                .orderByDesc(Document::getCreateTime);

        List<Document> documents = list(wrapper);
        log.info("[文档][列表]-查询成功，文档数量={}", documents.size());

        return documents;
    }

    /**
     * 根据文档ID和会话ID查询文档
     *
     * @param documentId 文档ID
     * @param sessionId 会话ID
     * @return 文档
     */
    @Override
    public Document getByIdAndSessionId(Long documentId, String sessionId) {
        log.info("[文档][详情]-查询文档详情，文档ID={}，会话ID={}", documentId, sessionId);

        LambdaQueryWrapper<Document> wrapper = Wrappers.lambdaQuery(Document.class)
                .eq(Document::getId, documentId)
                .eq(Document::getSessionId, sessionId);

        Document document = getOne(wrapper);

        if (Objects.isNull(document)) {
            log.warn("[文档][详情]-文档不存在或无权限访问，文档ID={}，会话ID={}", documentId, sessionId);
            throw new RuntimeException("文档不存在或无权限访问");
        }

        log.info("[文档][详情]-查询成功，文件名={}", document.getFileName());
        return document;
    }

    /**
     * 校验文件
     */
    private void validateFile(FileUploadDTO fileUpload) {
        if (Objects.isNull(fileUpload.getInputStream())) {
            throw new RuntimeException("文件不能为空");
        }

        if (StringUtils.isBlank(fileUpload.getOriginalFilename())) {
            throw new RuntimeException("文件名不能为空");
        }

        if (!fileUpload.getOriginalFilename().toLowerCase().endsWith(".pdf")) {
            throw new RuntimeException("只支持PDF格式文件");
        }

        if (fileUpload.getFileSize() > 50 * 1024 * 1024) {
            throw new RuntimeException("文件大小不能超过50MB");
        }
    }

    /**
     * 检查是否存在相同文件
     */
    private Document checkExistDocument(String md5, String sessionId) {
        LambdaQueryWrapper<Document> wrapper = Wrappers.lambdaQuery(Document.class)
                .eq(Document::getFileMd5, md5)
                .eq(Document::getSessionId, sessionId)
                .eq(Document::getStatus, 1);

        return getOne(wrapper);
    }

    /**
     * 保存文件到磁盘
     */
    private String saveFileToDisk(byte[] fileBytes, String originalFilename) throws IOException {
        // 创建存储目录
        Path storageDir = Paths.get(storagePath);
        if (!Files.exists(storageDir)) {
            Files.createDirectories(storageDir);
            log.info("[文档][存储]-创建存储目录: {}", storageDir);
        }

        // 生成唯一文件名: UUID + 原始文件扩展名
        String extension = FileUtil.extName(originalFilename);
        String uniqueFilename = IdUtil.simpleUUID() + "." + extension;
        Path filePath = storageDir.resolve(uniqueFilename);

        // 写入文件
        Files.write(filePath, fileBytes);

        return filePath.toString();
    }
}
