package com.docagent.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 文档实体类
 *
 * @author li.hongjian
 * @email lihongjian01@51talk.com
 * @date 2025-11-12
 */
@Data
@TableName("t_document")
public class Document {

    /**
     * 主键ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 会话ID（暂代替用户ID）
     */
    @TableField("session_id")
    private String sessionId;

    /**
     * 文件名
     */
    @TableField("file_name")
    private String fileName;

    /**
     * 文件大小（字节）
     */
    @TableField("file_size")
    private Long fileSize;

    /**
     * 文件存储路径
     */
    @TableField("file_path")
    private String filePath;

    /**
     * 文件MD5值
     */
    @TableField("file_md5")
    private String fileMd5;

    /**
     * PDF页数
     */
    @TableField("page_count")
    private Integer pageCount;

    /**
     * 提取的文本内容
     */
    @TableField("text_content")
    private String textContent;

    /**
     * 状态: 0-上传中, 1-已完成, 2-失败
     */
    @TableField("status")
    private Integer status;

    /**
     * 创建时间
     */
    @TableField("create_time")
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @TableField("update_time")
    private LocalDateTime updateTime;
}
