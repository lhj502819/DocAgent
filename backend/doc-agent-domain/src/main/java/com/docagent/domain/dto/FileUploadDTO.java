package com.docagent.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.InputStream;

/**
 * 文件上传DTO
 *
 * @author li.hongjian
 * @email lihongjian01@51talk.com
 * @date 2025-11-12
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileUploadDTO {

    /**
     * 文件输入流
     */
    private InputStream inputStream;

    /**
     * 原始文件名
     */
    private String originalFilename;

    /**
     * 文件大小（字节）
     */
    private Long fileSize;

    /**
     * 文件内容类型
     */
    private String contentType;
}
