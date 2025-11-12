package com.docagent.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 对话历史实体类
 *
 * @author li.hongjian
 * @email lihongjian01@51talk.com
 * @date 2025-11-12
 */
@Data
@TableName("t_chat_history")
public class ChatHistory {

    /**
     * 主键ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 文档ID
     */
    @TableField("document_id")
    private Long documentId;

    /**
     * 会话ID（暂代替用户ID）
     */
    @TableField("session_id")
    private String sessionId;

    /**
     * 角色: user-用户, assistant-AI助手
     */
    @TableField("role")
    private String role;

    /**
     * 对话内容
     */
    @TableField("content")
    private String content;

    /**
     * 选中的文本片段（可选）
     */
    @TableField("selected_text")
    private String selectedText;

    /**
     * 创建时间
     */
    @TableField("create_time")
    private LocalDateTime createTime;
}
