-- DocAgent数据库初始化脚本
-- 作者: li.hongjian@51talk.com
-- 日期: 2025-11-12

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `docagent` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `docagent`;

-- 文档表
DROP TABLE IF EXISTS `t_document`;
CREATE TABLE `t_document` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `session_id` VARCHAR(64) NOT NULL COMMENT '会话ID（暂代替用户ID）',
    `file_name` VARCHAR(255) NOT NULL COMMENT '文件名',
    `file_size` BIGINT NOT NULL COMMENT '文件大小（字节）',
    `file_path` VARCHAR(500) NOT NULL COMMENT '文件存储路径',
    `file_md5` VARCHAR(32) NULL COMMENT '文件MD5值',
    `page_count` INT NULL COMMENT 'PDF页数',
    `text_content` MEDIUMTEXT NULL COMMENT '提取的文本内容',
    `status` TINYINT DEFAULT 0 COMMENT '状态: 0-上传中, 1-已完成, 2-失败',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_session_id` (`session_id`),
    INDEX `idx_file_md5` (`file_md5`),
    INDEX `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文档表';

-- 翻译记录表
DROP TABLE IF EXISTS `t_translation`;
CREATE TABLE `t_translation` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `document_id` BIGINT NOT NULL COMMENT '文档ID',
    `source_lang` VARCHAR(10) NULL COMMENT '源语言',
    `target_lang` VARCHAR(10) NOT NULL COMMENT '目标语言',
    `translated_content` LONGTEXT NULL COMMENT '翻译后的内容（JSON格式存储段落映射）',
    `translate_style` VARCHAR(20) NULL COMMENT '翻译风格: accurate-准确, fluent-流畅, concise-简洁',
    `status` TINYINT DEFAULT 0 COMMENT '状态: 0-翻译中, 1-已完成, 2-失败',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    INDEX `idx_document_id` (`document_id`),
    INDEX `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='翻译记录表';

-- 对话历史表
DROP TABLE IF EXISTS `t_chat_history`;
CREATE TABLE `t_chat_history` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `document_id` BIGINT NOT NULL COMMENT '文档ID',
    `session_id` VARCHAR(64) NOT NULL COMMENT '会话ID（暂代替用户ID）',
    `role` VARCHAR(20) NOT NULL COMMENT '角色: user-用户, assistant-AI助手',
    `content` TEXT NOT NULL COMMENT '对话内容',
    `selected_text` TEXT NULL COMMENT '选中的文本片段（可选）',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    INDEX `idx_document_session` (`document_id`, `session_id`),
    INDEX `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='对话历史表';
