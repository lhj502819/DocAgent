package com.docagent.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 翻译记录实体类
 *
 * @author li.hongjian
 * @email lihongjian01@51talk.com
 * @date 2025-11-12
 */
@Data
@TableName("t_translation")
public class Translation {

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
     * 源语言
     */
    @TableField("source_lang")
    private String sourceLang;

    /**
     * 目标语言
     */
    @TableField("target_lang")
    private String targetLang;

    /**
     * 翻译后的内容（JSON格式存储段落映射）
     */
    @TableField("translated_content")
    private String translatedContent;

    /**
     * 翻译风格: accurate-准确, fluent-流畅, concise-简洁
     */
    @TableField("translate_style")
    private String translateStyle;

    /**
     * 状态: 0-翻译中, 1-已完成, 2-失败
     */
    @TableField("status")
    private Integer status;

    /**
     * 创建时间
     */
    @TableField("create_time")
    private LocalDateTime createTime;
}
