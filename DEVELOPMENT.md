# DocAgent 开发进度记录

**项目名称**: DocAgent - AI智能文档阅读器
**最后更新**: 2025-11-12
**当前阶段**: Phase 1 - MVP版本开发中

---

## 一、项目初始化 ✅

### 1.1 项目结构搭建 ✅
- [x] 后端Maven多模块项目结构
  - `doc-agent-parent`: 父POM
  - `doc-agent-domain`: 领域层（实体、仓储、服务）
  - `doc-agent-app`: 应用层（REST API、控制器）
- [x] 前端React + TypeScript项目结构
  - Vite + React 18 + Ant Design
  - 水墨风格主题配置

### 1.2 基础配置 ✅
- [x] Maven依赖配置（Spring Boot 3.4.2 + Java 21）
- [x] MyBatis-Plus配置
- [x] 数据库初始化脚本（3张表）
- [x] 前端依赖安装（package.json）
- [x] Vite配置（API代理）

### 1.3 文档完善 ✅
- [x] PRD产品需求文档
- [x] README项目说明
- [x] 技术决策记录
- [x] .gitignore配置

---

## 二、数据库设计 ✅

### 2.1 数据表结构 ✅

**t_document (文档表)**
- id: 主键
- session_id: 会话ID（暂代替用户ID）
- file_name: 文件名
- file_size: 文件大小
- file_path: 存储路径
- file_md5: MD5值
- page_count: 页数
- text_content: 提取的文本内容
- status: 状态（0-上传中, 1-已完成, 2-失败）
- create_time, update_time

**t_translation (翻译记录表)**
- id: 主键
- document_id: 文档ID
- source_lang: 源语言
- target_lang: 目标语言
- translated_content: 翻译内容（JSON格式存储段落映射）
- translate_style: 翻译风格
- status: 状态（0-翻译中, 1-已完成, 2-失败）
- create_time

**t_chat_history (对话历史表)**
- id: 主键
- document_id: 文档ID
- session_id: 会话ID
- role: 角色（user/assistant）
- content: 对话内容
- selected_text: 选中的文本
- create_time

### 2.2 索引设计 ✅
- idx_session_id (t_document)
- idx_file_md5 (t_document)
- idx_document_id (t_translation)
- idx_document_session (t_chat_history)

---

## 三、后端开发进度

### 3.1 实体层（Entity）✅

**已完成的实体类**:
- [x] `Document.java` - 文档实体
- [x] `Translation.java` - 翻译记录实体
- [x] `ChatHistory.java` - 对话历史实体

**位置**: `doc-agent-domain/src/main/java/com/docagent/domain/entity/`

**技术点**:
- 使用 `@TableName` 映射表名
- 使用 `@TableField` 映射字段
- 使用 `@Data` Lombok注解
- 完整的Javadoc注释

---

### 3.2 数据访问层（Repository）✅

**已完成的Mapper接口**:
- [x] `DocumentMapper.java`
- [x] `TranslationMapper.java`
- [x] `ChatHistoryMapper.java`

**位置**: `doc-agent-domain/src/main/java/com/docagent/domain/repository/mysql/`

**技术点**:
- 继承 `BaseMapper<T>`（MyBatis-Plus）
- 使用 `@Mapper` 注解

---

### 3.3 DTO层 ✅

**已完成的DTO**:
- [x] `FileUploadDTO.java` - 文件上传数据传输对象

**位置**: `doc-agent-domain/src/main/java/com/docagent/domain/dto/`

**字段**:
- `InputStream inputStream`: 文件输入流
- `String originalFilename`: 原始文件名
- `Long fileSize`: 文件大小
- `String contentType`: 文件类型

**设计理由**: 避免domain层依赖Spring Web的`MultipartFile`类，保持分层架构纯净

---

### 3.4 服务层（Service）✅

#### 3.4.1 PdfParserService ✅

**接口**: `PdfParserService.java`
**实现类**: `PdfParserServiceImpl.java`
**位置**: `doc-agent-domain/src/main/java/com/docagent/domain/service/`

**功能**:
- [x] `extractText(InputStream)`: 提取PDF文本内容
- [x] `getPageCount(InputStream)`: 获取PDF页数

**技术栈**: Apache PDFBox 3.0.1

**关键逻辑**:
- 使用 `PDDocument.load()` 加载PDF
- 使用 `PDFTextStripper.getText()` 提取文本
- 异常处理和日志记录

---

#### 3.4.2 DocumentService ✅

**接口**: `DocumentService.java`
**实现类**: `DocumentServiceImpl.java`
**位置**: `doc-agent-domain/src/main/java/com/docagent/domain/service/`

**功能**:
- [x] `uploadDocument(FileUploadDTO, sessionId)`: 上传文档
- [x] `listBySessionId(sessionId)`: 查询文档列表
- [x] `getByIdAndSessionId(documentId, sessionId)`: 获取文档详情

**关键逻辑**:
1. **文件校验**: 格式、大小限制（≤50MB）
2. **MD5计算**: 防止重复上传
3. **文件存储**: 保存到本地磁盘（可配置路径）
4. **PDF解析**: 提取文本和页数
5. **数据库保存**: 存储文档元数据

**技术点**:
- 使用 `@Transactional` 保证事务一致性
- 使用 Hutool 工具类（MD5计算、文件操作）
- 使用 `LambdaQueryWrapper` 构建查询条件
- 完整的日志记录（[模块][功能]-操作，参数={}）

**配置项**:
- `app.file.storage-path`: 文件存储路径（默认 `./storage/documents`）

---

#### 3.4.3 AiService ✅

**接口**: `AiService.java`
**实现类**: `AiServiceImpl.java`
**配置类**: `AiConfig.java`
**位置**: `doc-agent-domain/src/main/java/com/docagent/domain/service/`

**功能**:
- [x] `translate(text, sourceLang, targetLang, style)`: AI翻译
- [x] `chat(messages)`: AI对话
- [x] `chatStream(messages, callback)`: 流式对话

**技术栈**: OkHttp + OpenAI API协议

**关键逻辑**:
1. **OpenAI协议实现**:
   - 请求格式：`/chat/completions`
   - 请求体：`{ model, messages, temperature }`
   - 响应解析：提取 `choices[0].message.content`

2. **流式响应处理**:
   - SSE协议解析（`data: [DONE]`）
   - 逐块回调 `StreamCallback.onChunk()`

3. **翻译提示词构建**:
   - 支持3种翻译风格：accurate（准确）、fluent（流畅）、concise（简洁）
   - 动态构建Prompt

**配置项**（`application.yml`）:
- `app.ai.openai.api-key`: API密钥
- `app.ai.openai.api-url`: API地址（默认OpenAI）
- `app.ai.openai.model`: 模型（默认gpt-4）
- `app.ai.openai.timeout`: 超时时间（默认60秒）

**兼容性**: 支持任何遵循OpenAI协议的服务商（Azure OpenAI、国内大模型等）

---

#### 3.4.4 TranslationService ✅

**接口**: `TranslationService.java`
**实现类**: `TranslationServiceImpl.java`
**位置**: `doc-agent-domain/src/main/java/com/docagent/domain/service/`

**功能**:
- [x] `startTranslation(documentId, targetLang, style, sessionId)`: 开始翻译
- [x] `getTranslationResult(translationId, sessionId)`: 获取翻译结果
- [x] `getLatestTranslation(documentId, targetLang, sessionId)`: 获取最新翻译

**关键逻辑**:
1. **文本分段**: 按段落分割（`\n\n`）
2. **分段翻译**: 循环调用AI翻译每个段落
3. **段落映射**: JSON格式存储原文-译文映射
   ```json
   [
     {"index": "0", "original": "原文段落1", "translated": "翻译段落1"},
     {"index": "1", "original": "原文段落2", "translated": "翻译段落2"}
   ]
   ```
4. **翻译缓存**: 检查是否已有相同翻译，避免重复调用
5. **状态管理**: 0-翻译中, 1-已完成, 2-失败

**技术点**:
- 使用 `@Transactional` 保证事务
- 使用 Jackson 序列化/反序列化JSON
- 分段翻译提高准确性

---

#### 3.4.5 ChatService ✅

**接口**: `ChatService.java`
**实现类**: `ChatServiceImpl.java`
**位置**: `doc-agent-domain/src/main/java/com/docagent/domain/service/`

**功能**:
- [x] `sendMessage(documentId, message, selectedText, sessionId)`: 发送消息
- [x] `getChatHistory(documentId, sessionId)`: 获取对话历史
- [x] `clearChatHistory(documentId, sessionId)`: 清空历史

**关键逻辑**:
1. **上下文构建**:
   - 系统提示词（包含文档信息）
   - 历史对话（最近10条）
   - 当前用户消息

2. **选中文本处理**:
   - 如果有选中文本，优先基于选中内容回答
   - 否则使用文档前2000字符作为上下文

3. **对话历史管理**:
   - 保存用户消息（role=user）
   - 保存AI回复（role=assistant）
   - 记录选中文本（可选）

**系统提示词示例**:
```
你是一个智能文档阅读助手，帮助用户理解和分析文档内容。

当前文档信息：
- 文件名：example.pdf
- 页数：10

用户选中的文本内容：
```
[选中文本]
```

请主要针对用户选中的这段文本内容进行回答。
```

---

### 3.5 控制器层（Controller）✅

#### 3.5.1 DocumentController ✅

**位置**: `doc-agent-app/src/main/java/com/docagent/app/controller/DocumentController.java`

**API接口**:
- [x] `POST /api/document/upload`: 上传文档
- [x] `GET /api/document/list`: 查询文档列表
- [x] `GET /api/document/{id}`: 获取文档详情

**关键逻辑**:
- 接收 `MultipartFile`，转换为 `FileUploadDTO` 传递给domain层
- 使用 `HttpSession.getId()` 获取会话ID
- 统一的日志记录

---

#### 3.5.2 TranslateController ✅

**位置**: `doc-agent-app/src/main/java/com/docagent/app/controller/TranslateController.java`

**API接口**:
- [x] `POST /api/translate/start`: 开始翻译
- [x] `GET /api/translate/{translationId}`: 获取翻译结果
- [x] `GET /api/translate/latest?documentId&targetLang`: 获取最新翻译

**请求DTO**:
```java
class TranslateRequest {
    Long documentId;
    String targetLang;
    String style; // accurate/fluent/concise
}
```

---

#### 3.5.3 ChatController ✅

**位置**: `doc-agent-app/src/main/java/com/docagent/app/controller/ChatController.java`

**API接口**:
- [x] `POST /api/chat/send`: 发送对话消息
- [x] `GET /api/chat/history?documentId`: 获取对话历史
- [x] `DELETE /api/chat/clear?documentId`: 清空对话历史

**请求DTO**:
```java
class ChatRequest {
    Long documentId;
    String message;
    String selectedText; // 可选
}
```

---

### 3.6 统一响应与异常处理 ✅

#### 3.6.1 统一响应封装 (Result.java) ✅

**位置**: `doc-agent-app/src/main/java/com/docagent/app/common/Result.java`

**响应格式**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": { ... },
  "timestamp": 1699999999999
}
```

**便捷方法**:
- `Result.success()` - 成功响应（无数据）
- `Result.success(T data)` - 成功响应（带数据）
- `Result.success(String message, T data)` - 成功响应（自定义消息）
- `Result.error(String message)` - 失败响应（500）
- `Result.error(Integer code, String message)` - 失败响应（自定义状态码）
- `Result.badRequest(String message)` - 参数错误（400）
- `Result.unauthorized(String message)` - 未授权（401）
- `Result.forbidden(String message)` - 禁止访问（403）
- `Result.notFound(String message)` - 资源不存在（404）

---

#### 3.6.2 业务异常类 (BusinessException.java) ✅

**位置**: `doc-agent-app/src/main/java/com/docagent/app/exception/BusinessException.java`

**特点**:
- 继承 `RuntimeException`，无需显式捕获
- 支持自定义错误码和消息
- 支持异常链（cause）

**使用示例**:
```java
throw new BusinessException("文档不存在");
throw new BusinessException(404, "文档不存在");
```

---

#### 3.6.3 全局异常处理器 (GlobalExceptionHandler.java) ✅

**位置**: `doc-agent-app/src/main/java/com/docagent/app/exception/GlobalExceptionHandler.java`

**处理的异常类型**:
1. `BusinessException` - 业务异常，返回自定义错误码和消息
2. `MethodArgumentNotValidException` - 参数校验异常（@Valid）
3. `BindException` - 参数绑定异常
4. `MaxUploadSizeExceededException` - 文件上传大小超限
5. `IllegalArgumentException` - 非法参数异常
6. `NullPointerException` - 空指针异常
7. `RuntimeException` - 运行时异常
8. `Exception` - 兜底异常处理

**特点**:
- 统一异常响应格式
- 完整的日志记录（`[异常处理]-类型: 消息`）
- 自动提取参数校验错误信息

---

### 3.7 配置类 ✅

#### 3.7.1 AiConfig ✅

**位置**: `doc-agent-domain/src/main/java/com/docagent/domain/config/AiConfig.java`

**配置项**:
- `apiKey`: OpenAI API密钥
- `apiUrl`: API地址
- `model`: 使用的模型
- `timeout`: 超时时间

**映射前缀**: `app.ai.openai`

---

### 3.8 应用入口 ✅

**位置**: `doc-agent-app/src/main/java/com/docagent/app/DocAgentApplication.java`

**配置**:
- `@SpringBootApplication(scanBasePackages = "com.docagent")`
- `@MapperScan("com.docagent.domain.repository.mysql")`

---

## 四、前端开发进度

### 4.1 项目配置 ✅

- [x] package.json（依赖配置）
- [x] vite.config.ts（Vite配置 + API代理）
- [x] tsconfig.json（TypeScript配置）
- [x] index.html（入口HTML）

### 4.2 全局配置 ✅

**main.tsx** ✅
- Ant Design ConfigProvider（水墨风格主题）
- 中文语言包
- 主题色配置：竹青色、墨黑、宣纸白

**App.tsx** ✅
- React Router配置
- 路由：`/` (Home), `/reader/:documentId` (Reader)

**styles/index.css** ✅
- 全局样式
- CSS变量定义（水墨风格色彩）
- 滚动条样式

### 4.3 页面组件 ✅

#### 4.3.1 Home页面 ✅

**位置**: `frontend/src/pages/Home/`

**功能**:
- [x] 文档上传（Dragger组件）
- [x] 最近文档列表（Card列表）
- [x] 水墨风格UI

**待完善**:
- [ ] 上传进度显示
- [ ] 上传成功后跳转
- [ ] 从后端获取最近文档列表

#### 4.3.2 Reader页面 ✅

**位置**: `frontend/src/pages/Reader/`

**布局**:
- [x] 顶部工具栏（返回、翻译、下载、设置按钮）
- [x] 三栏布局：
  - 左侧：PDF原文区域
  - 中间：翻译文本区域
  - 右侧：对话面板

**待完善**:
- [ ] PDF预览（react-pdf集成）
- [ ] 翻译内容展示
- [ ] 对话面板实现
- [ ] 选中联动高亮

---

## 五、API接口汇总

**响应格式**: 所有接口统一使用 `Result<T>` 封装

```json
{
  "code": 200,
  "message": "操作成功",
  "data": { ... },
  "timestamp": 1699999999999
}
```

### 5.1 文档管理

| 接口 | 方法 | 请求参数 | 响应 | 状态 |
|------|------|---------|------|------|
| `/api/document/upload` | POST | MultipartFile | `Result<Long>` | ✅ |
| `/api/document/list` | GET | sessionId (Cookie) | `Result<List<Document>>` | ✅ |
| `/api/document/{id}` | GET | id, sessionId | `Result<Document>` | ✅ |

### 5.2 翻译功能

| 接口 | 方法 | 请求参数 | 响应 | 状态 |
|------|------|---------|------|------|
| `/api/translate/start` | POST | TranslateRequest | `Result<Long>` | ✅ |
| `/api/translate/{id}` | GET | translationId | `Result<Translation>` | ✅ |
| `/api/translate/latest` | GET | documentId, targetLang | `Result<Translation>` | ✅ |

### 5.3 对话功能

| 接口 | 方法 | 请求参数 | 响应 | 状态 |
|------|------|---------|------|------|
| `/api/chat/send` | POST | ChatRequest | `Result<String>` | ✅ |
| `/api/chat/history` | GET | documentId | `Result<List<ChatHistory>>` | ✅ |
| `/api/chat/clear` | DELETE | documentId | `Result<Void>` | ✅ |

---

## 六、技术架构总结

### 6.1 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Spring Boot | 3.4.2 | 应用框架 |
| Java | 21 | 编程语言 |
| MyBatis-Plus | 3.5.5 | ORM框架 |
| MySQL | 8.0+ | 数据库 |
| Redis | 6.0+ | 缓存（未实现） |
| Apache PDFBox | 3.0.1 | PDF解析 |
| OkHttp | 4.12.0 | HTTP客户端 |
| Hutool | 5.8.25 | 工具类库 |
| Lombok | - | 简化代码 |

### 6.2 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.2.0 | UI框架 |
| TypeScript | 5.3.3 | 类型系统 |
| Vite | 5.1.0 | 构建工具 |
| Ant Design | 5.14.0 | UI组件库 |
| React Router | 6.22.0 | 路由管理 |
| Zustand | 4.5.0 | 状态管理（未使用） |
| react-pdf | 7.7.1 | PDF渲染（未集成） |
| axios | 1.6.7 | HTTP客户端（未使用） |

---

## 七、待开发功能

### 7.1 后端待开发

- [ ] Redis缓存集成（翻译结果缓存）
- [ ] WebSocket支持（流式对话）
- [ ] 翻译结果导出（PDF/TXT/双语对照）
- [ ] 文件下载功能
- [x] ~~异常处理优化（统一异常处理器）~~ ✅ 已完成
- [x] ~~响应封装（统一返回格式）~~ ✅ 已完成
- [ ] 单元测试

### 7.2 前端待开发

- [ ] PDF预览（react-pdf集成）
- [ ] 文档上传功能对接
- [ ] 翻译功能对接
  - [ ] 对照翻译UI
  - [ ] 段落映射展示
  - [ ] 选中联动高亮
- [ ] 对话功能对接
  - [ ] 对话面板实现
  - [ ] 流式输出展示
  - [ ] 选中文本提问
- [ ] API服务封装（axios）
- [ ] 状态管理（Zustand）
- [ ] 错误处理和Toast提示

### 7.3 功能增强

- [ ] 用户登录系统
- [ ] 文档权限管理
- [ ] 翻译进度显示
- [ ] 对话历史导出
- [ ] 向量数据库集成（RAG优化）
- [ ] 多文档对比

---

## 八、已知问题

### 8.1 后端

1. ~~**未验证编译**: 代码已编写但未执行编译验证~~ ✅ 已编译通过
2. ~~**缺少统一异常处理**: Controller抛出的异常未统一处理~~ ✅ 已完成
3. ~~**缺少响应封装**: API返回格式不统一~~ ✅ 已完成
4. **Redis未启用**: 配置文件中有Redis但未使用
5. **翻译分段策略简单**: 当前按`\n\n`分段，可能不够智能
6. **PDFBox API修复**: 已修复 `PDDocument.load()` → `Loader.loadPDF()` ✅

### 8.2 前端

1. **UI为静态展示**: 功能未对接后端API
2. **缺少错误处理**: 无Toast提示、错误边界
3. **未使用状态管理**: Zustand未实际应用

---

## 九、环境配置要求

### 9.1 开发环境

- Java 21
- Node.js 18+
- MySQL 8.0+
- Redis 6+ (可选，暂未使用)
- Maven 3.8+

### 9.2 配置文件

**application.yml** (需配置):
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/docagent
    username: root
    password: [需配置]
  data:
    redis:
      host: localhost
      port: 6379

app:
  file:
    storage-path: ./storage/documents
  ai:
    openai:
      api-key: [需配置]
      api-url: https://api.openai.com/v1
      model: gpt-4
```

### 9.3 数据库初始化

```bash
mysql -u root -p < database/init.sql
```

---

## 十、启动说明

### 10.1 后端启动

```bash
cd backend
mvn clean compile
mvn spring-boot:run -pl doc-agent-app
```

访问: http://localhost:8080

### 10.2 前端启动

```bash
cd frontend
npm install
npm run dev
```

访问: http://localhost:3000

---

## 十一、代码质量

### 11.1 编码规范 ✅

- [x] 遵循CLAUDE.md规范
- [x] 类、方法、字段完整Javadoc注释
- [x] 日志格式统一：`[模块][功能]-操作，参数={}`
- [x] 使用`@RequiredArgsConstructor`依赖注入
- [x] 使用Lombok简化代码

### 11.2 分层架构 ✅

- [x] Controller → Service → Repository → Entity
- [x] Domain层不依赖Web层（FileUploadDTO设计）
- [x] 清晰的职责分离

### 11.3 异常处理 ✅

- [x] Service层抛出BusinessException
- [x] 全局异常处理器统一处理
- [x] 完整的日志记录

### 11.4 响应封装 ✅

- [x] 统一响应格式 `Result<T>`
- [x] 标准HTTP状态码
- [x] 友好的错误消息

---

## 十二、Git提交建议

建议分多次提交：

1. `feat: 初始化项目结构和数据库设计`
2. `feat: 实现PDF解析和文档上传功能`
3. `feat: 实现AI服务（OpenAI协议集成）`
4. `feat: 实现翻译功能`
5. `feat: 实现对话功能`
6. `feat: 添加统一响应封装和全局异常处理` ✅ 新增
7. `feat: 添加前端页面和水墨风格UI`
8. `fix: 修复PDFBox 3.0.1 API兼容性问题` ✅ 新增

---

## 十三、审查清单

### 13.1 功能完整性
- [x] 文档上传功能（后端逻辑完成）
- [x] PDF文本提取功能
- [x] AI翻译功能（后端逻辑完成）
- [x] AI对话功能（后端逻辑完成）
- [ ] 前端功能对接
- [ ] 端到端测试

### 13.2 代码质量
- [x] 代码规范符合要求
- [x] 注释完整
- [x] 日志记录完整
- [x] 统一异常处理 ✅
- [x] 统一响应封装 ✅
- [x] 编译验证 ✅
- [ ] 单元测试

### 13.3 安全性
- [x] SQL注入防护（MyBatis-Plus）
- [x] 文件上传校验
- [x] 会话隔离（sessionId）
- [ ] API鉴权（待用户系统）

---

**总结**:
- ✅ 后端核心业务逻辑已完成（文档上传、PDF解析、AI翻译、AI对话）
- ✅ 统一响应封装和全局异常处理已完成
- ✅ 编译验证通过
- ✅ 前端基础UI已搭建
- ⏳ 待完成：前端功能对接、单元测试

**最后更新**: 2025-11-12 (新增统一响应封装和异常处理)
