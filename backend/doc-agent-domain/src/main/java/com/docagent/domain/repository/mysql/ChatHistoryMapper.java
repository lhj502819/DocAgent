package com.docagent.domain.repository.mysql;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.docagent.domain.entity.ChatHistory;
import org.apache.ibatis.annotations.Mapper;

/**
 * 对话历史Mapper接口
 *
 * @author li.hongjian
 * @email lihongjian01@51talk.com
 * @date 2025-11-12
 */
@Mapper
public interface ChatHistoryMapper extends BaseMapper<ChatHistory> {
}
