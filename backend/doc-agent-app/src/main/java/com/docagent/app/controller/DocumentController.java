package com.docagent.app.controller;

import com.docagent.app.common.Result;
import com.docagent.domain.dto.FileUploadDTO;
import com.docagent.domain.entity.Document;
import com.docagent.domain.service.DocumentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpSession;
import java.io.File;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * 文档控制器
 *
 * @author li.hongjian
 * @email lihongjian01@51talk.com
 * @date 2025-11-12
 */
@Slf4j
@RestController
@RequestMapping("/document")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    /**
     * 上传文档
     *
     * @param file 上传的文件
     * @param session HTTP会话
     * @return 文档ID
     */
    @PostMapping("/upload")
    public Result<Long> uploadDocument(@RequestParam("file") MultipartFile file, HttpSession session) throws IOException {
        log.info("[文档][上传]-开始上传文档，文件名={}", file.getOriginalFilename());

        // 获取会话ID
        String sessionId = session.getId();

        // 将MultipartFile转换为FileUploadDTO
        FileUploadDTO fileUpload = FileUploadDTO.builder()
                .inputStream(file.getInputStream())
                .originalFilename(file.getOriginalFilename())
                .fileSize(file.getSize())
                .contentType(file.getContentType())
                .build();

        // 调用服务层处理
        Long documentId = documentService.uploadDocument(fileUpload, sessionId);

        log.info("[文档][上传]-文档上传成功，文档ID={}", documentId);
        return Result.success("文档上传成功", documentId);
    }

    /**
     * 查询文档列表
     *
     * @param session HTTP会话
     * @return 文档列表
     */
    @GetMapping("/list")
    public Result<List<Document>> listDocuments(HttpSession session) {
        String sessionId = session.getId();
        log.info("[文档][列表]-查询文档列表，会话ID={}", sessionId);
        List<Document> documents = documentService.listBySessionId(sessionId);
        return Result.success(documents);
    }

    /**
     * 获取文档详情
     *
     * @param id 文档ID
     * @param session HTTP会话
     * @return 文档详情
     */
    @GetMapping("/{id}")
    public Result<Document> getDocument(@PathVariable Long id, HttpSession session) {
        String sessionId = session.getId();
        log.info("[文档][详情]-获取文档详情，文档ID={}，会话ID={}", id, sessionId);
        Document document = documentService.getByIdAndSessionId(id, sessionId);
        return Result.success(document);
    }

    /**
     * 下载PDF文件
     *
     * @param id 文档ID
     * @param session HTTP会话
     * @return PDF文件
     */
    @GetMapping("/{id}/file")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id, HttpSession session) {
        String sessionId = session.getId();
        log.info("[文档][下载]-下载文档文件，文档ID={}，会话ID={}", id, sessionId);

        // 获取文档信息
        Document document = documentService.getByIdAndSessionId(id, sessionId);

        if (document == null || document.getFilePath() == null) {
            log.error("[文档][下载]-文档不存在或文件路径为空，文档ID={}", id);
            return ResponseEntity.notFound().build();
        }

        // 读取文件
        File file = new File(document.getFilePath());
        if (!file.exists()) {
            log.error("[文档][下载]-文件不存在，路径={}", document.getFilePath());
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(file);

        // 编码文件名（支持中文）
        String encodedFileName = URLEncoder.encode(document.getFileName(), StandardCharsets.UTF_8)
                .replace("+", "%20");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename*=UTF-8''" + encodedFileName)
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(file.length())
                .body(resource);
    }
}
