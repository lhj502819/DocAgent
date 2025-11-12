package com.docagent.domain.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.docagent.domain.dto.FileUploadDTO;
import com.docagent.domain.entity.Document;

import java.util.List;

/**
 * 文档服务接口
 *
 * @author li.hongjian
 * @email lihongjian01@51talk.com
 * @date 2025-11-12
 */
public interface DocumentService extends IService<Document> {

    /**
     * 上传文档
     *
     * @param fileUpload 文件上传信息
     * @param sessionId 会话ID
     * @return 文档ID
     */
    Long uploadDocument(FileUploadDTO fileUpload, String sessionId);

    /**
     * 根据会话ID查询文档列表
     *
     * @param sessionId 会话ID
     * @return 文档列表
     */
    List<Document> listBySessionId(String sessionId);

    /**
     * 根据文档ID和会话ID查询文档
     *
     * @param documentId 文档ID
     * @param sessionId 会话ID
     * @return 文档
     */
    Document getByIdAndSessionId(Long documentId, String sessionId);
}
