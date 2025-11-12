# DocAgent 开发任务清单

**项目名称**: DocAgent - AI智能文档阅读器
**创建时间**: 2025-11-12
**最后更新**: 2025-11-12

---

## 任务状态说明

- ⏳ **待开始** (pending)
- 🔄 **进行中** (in_progress)
- ✅ **已完成** (completed)

---

## 一、前端API与基础功能

### 1. 前端API服务封装 ⏳

**状态**: 待开始
**优先级**: 高
**预计工时**: 2小时

**任务描述**:
- 创建axios实例配置（baseURL、timeout、拦截器）
- 实现统一的请求/响应拦截器
- 封装Result<T>响应格式的解析
- 创建API服务模块（documentApi、translateApi、chatApi）

**交付物**:
- `frontend/src/utils/request.ts` - axios配置
- `frontend/src/api/document.ts` - 文档API
- `frontend/src/api/translate.ts` - 翻译API
- `frontend/src/api/chat.ts` - 对话API

**依赖**: 无

---

### 2. 前端文档上传功能对接 ⏳

**状态**: 待开始
**优先级**: 高
**预计工时**: 2小时

**任务描述**:
- 修改Home页面的Upload组件，对接后端上传接口
- 实现上传进度显示
- 上传成功后跳转到Reader页面
- 添加错误处理和Toast提示

**交付物**:
- 更新 `frontend/src/pages/Home/index.tsx`
- 实现文件上传逻辑

**依赖**: 任务1（API服务封装）

**接口**:
- POST `/api/document/upload`
- 请求：FormData with file
- 响应：`Result<Long>` (文档ID)

---

### 3. 前端文档列表功能实现 ⏳

**状态**: 待开始
**优先级**: 高
**预计工时**: 2小时

**任务描述**:
- 修改Home页面，从后端获取文档列表
- 显示最近上传的文档（文件名、大小、上传时间）
- 点击文档跳转到Reader页面
- 添加加载状态和空状态展示

**交付物**:
- 更新 `frontend/src/pages/Home/index.tsx`
- 实现文档列表展示

**依赖**: 任务1（API服务封装）

**接口**:
- GET `/api/document/list`
- 响应：`Result<List<Document>>`

---

## 二、PDF渲染功能

### 4. PDF预览功能集成 ⏳

**状态**: 待开始
**优先级**: 高
**预计工时**: 4小时

**任务描述**:
- 集成react-pdf库到Reader页面
- 实现PDF文档加载和渲染
- 支持翻页、缩放功能
- 实现文本选中功能（为后续联动做准备）
- 添加加载状态和错误处理

**交付物**:
- 更新 `frontend/src/pages/Reader/index.tsx`
- 创建 `frontend/src/components/PDFViewer.tsx`

**依赖**: 任务3（文档列表）

**技术点**:
- react-pdf 7.7.1
- PDF.js worker配置
- Canvas渲染

---

## 三、翻译功能

### 5. 翻译功能前端对接 ⏳

**状态**: 待开始
**优先级**: 高
**预计工时**: 3小时

**任务描述**:
- 在Reader页面添加翻译按钮（语言选择、风格选择）
- 实现翻译任务启动
- 轮询翻译状态（status: 0-翻译中, 1-已完成, 2-失败）
- 翻译完成后展示译文
- 添加翻译进度提示

**交付物**:
- 更新 `frontend/src/pages/Reader/index.tsx`
- 创建翻译控制面板组件

**依赖**: 任务1（API服务封装）

**接口**:
- POST `/api/translate/start` - 启动翻译
- GET `/api/translate/{translationId}` - 获取翻译结果
- GET `/api/translate/latest?documentId&targetLang` - 获取最新翻译

---

### 6. 对照翻译UI实现 ⏳

**状态**: 待开始
**优先级**: 中
**预计工时**: 4小时

**任务描述**:
- 解析翻译结果的JSON格式（段落映射）
- 实现原文和译文的段落对照显示
- 支持段落滚动同步
- 水墨风格样式优化

**交付物**:
- 创建 `frontend/src/components/TranslationView.tsx`
- 实现段落映射展示逻辑

**依赖**: 任务5（翻译功能对接）

**数据格式**:
```json
[
  {"index": "0", "original": "原文段落1", "translated": "翻译段落1"},
  {"index": "1", "original": "原文段落2", "translated": "翻译段落2"}
]
```

---

### 7. 选中联动高亮功能 ⏳

**状态**: 待开始
**优先级**: 中
**预计工时**: 4小时

**任务描述**:
- 实现PDF文本选中监听
- 在翻译区域高亮对应段落
- 实现翻译文本选中时，在PDF区域高亮原文
- 处理跨段落选中的情况

**交付物**:
- 更新 `frontend/src/components/PDFViewer.tsx`
- 更新 `frontend/src/components/TranslationView.tsx`
- 实现选中状态管理

**依赖**: 任务4（PDF预览）、任务6（对照翻译UI）

**技术难点**:
- PDF.js文本选中事件
- 文本位置映射算法

---

## 四、对话功能

### 8. 对话面板实现 ⏳

**状态**: 待开始
**优先级**: 高
**预计工时**: 3小时

**任务描述**:
- 创建聊天界面组件（消息列表、输入框）
- 实现消息气泡样式（用户/助手）
- 支持Markdown渲染（AI回复可能包含格式）
- 水墨风格样式

**交付物**:
- 创建 `frontend/src/components/ChatPanel.tsx`
- 创建 `frontend/src/components/MessageItem.tsx`

**依赖**: 无

---

### 9. 对话功能对接 ⏳

**状态**: 待开始
**优先级**: 高
**预计工时**: 3小时

**任务描述**:
- 对接后端chat接口
- 实现发送消息功能
- 加载和显示历史对话
- 实现清空历史功能
- 添加加载状态（AI思考中）

**交付物**:
- 更新 `frontend/src/components/ChatPanel.tsx`
- 实现对话逻辑

**依赖**: 任务1（API服务封装）、任务8（对话面板）

**接口**:
- POST `/api/chat/send` - 发送消息
- GET `/api/chat/history?documentId` - 获取历史
- DELETE `/api/chat/clear?documentId` - 清空历史

---

### 10. 选中文本提问功能 ⏳

**状态**: 待开始
**优先级**: 中
**预计工时**: 2小时

**任务描述**:
- 在PDF或翻译区域选中文本后，显示"提问"按钮
- 点击按钮将选中文本填充到对话输入框
- 发送消息时附带selectedText参数
- 在对话历史中显示选中的文本片段

**交付物**:
- 更新 `frontend/src/components/PDFViewer.tsx`
- 更新 `frontend/src/components/TranslationView.tsx`
- 更新 `frontend/src/components/ChatPanel.tsx`

**依赖**: 任务9（对话功能对接）

---

## 五、前端架构完善

### 11. 前端状态管理 ⏳

**状态**: 待开始
**优先级**: 中
**预计工时**: 3小时

**任务描述**:
- 使用Zustand创建全局状态store
- 管理当前文档状态（documentId, documentInfo）
- 管理翻译状态（translationId, translationData, isTranslating）
- 管理对话状态（chatHistory, isLoading）
- 管理选中文本状态

**交付物**:
- 创建 `frontend/src/store/documentStore.ts`
- 创建 `frontend/src/store/translationStore.ts`
- 创建 `frontend/src/store/chatStore.ts`

**依赖**: 无（可与其他任务并行）

---

### 12. 错误处理和Toast提示 ⏳

**状态**: 待开始
**优先级**: 中
**预计工时**: 2小时

**任务描述**:
- 在axios拦截器中统一处理错误
- 使用Ant Design的message组件显示提示
- 分类处理不同错误（网络错误、业务错误、权限错误）
- 添加错误边界组件（Error Boundary）

**交付物**:
- 更新 `frontend/src/utils/request.ts`
- 创建 `frontend/src/components/ErrorBoundary.tsx`

**依赖**: 任务1（API服务封装）

---

## 六、测试

### 13. 后端单元测试 ⏳

**状态**: 待开始
**优先级**: 中
**预计工时**: 6小时

**任务描述**:
- 为DocumentService编写单元测试
- 为TranslationService编写单元测试
- 为ChatService编写单元测试
- 为PdfParserService编写单元测试
- Mock外部依赖（数据库、AI服务）
- 测试覆盖率达到80%

**交付物**:
- `backend/doc-agent-domain/src/test/java/com/docagent/domain/service/DocumentServiceTest.java`
- `backend/doc-agent-domain/src/test/java/com/docagent/domain/service/TranslationServiceTest.java`
- `backend/doc-agent-domain/src/test/java/com/docagent/domain/service/ChatServiceTest.java`
- `backend/doc-agent-domain/src/test/java/com/docagent/domain/service/PdfParserServiceTest.java`

**依赖**: 无（可与前端开发并行）

**技术栈**:
- JUnit 5
- Mockito
- Spring Boot Test

---

### 14. 端到端测试 ⏳

**状态**: 待开始
**优先级**: 低
**预计工时**: 4小时

**任务描述**:
- 测试完整的用户流程：
  1. 上传PDF文档
  2. 查看文档列表
  3. 打开文档阅读器
  4. 启动翻译并查看结果
  5. 选中文本提问
  6. 查看对话历史
- 验证前后端集成
- 验证错误场景（网络错误、文件格式错误等）

**交付物**:
- 测试报告文档
- 问题清单

**依赖**: 所有前端任务完成

---

## 任务统计

- **总任务数**: 14
- **已完成**: 0
- **进行中**: 0
- **待开始**: 14

---

## 开发顺序建议

**第一阶段：基础设施（任务1）**
- 任务1: 前端API服务封装

**第二阶段：文档管理（任务2-4）**
- 任务2: 前端文档上传功能对接
- 任务3: 前端文档列表功能实现
- 任务4: PDF预览功能集成

**第三阶段：翻译功能（任务5-7）**
- 任务5: 翻译功能前端对接
- 任务6: 对照翻译UI实现
- 任务7: 选中联动高亮功能

**第四阶段：对话功能（任务8-10）**
- 任务8: 对话面板实现
- 任务9: 对话功能对接
- 任务10: 选中文本提问功能

**第五阶段：完善优化（任务11-12）**
- 任务11: 前端状态管理
- 任务12: 错误处理和Toast提示

**第六阶段：测试（任务13-14）**
- 任务13: 后端单元测试
- 任务14: 端到端测试

---

## 更新日志

- **2025-11-12**: 创建TODO列表，初始化14个开发任务
