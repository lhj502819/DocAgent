# DocAgent - AI智能文档阅读器

> 基于AI的智能PDF文档阅读器，支持全文翻译和智能对话功能

## 项目概述

DocAgent 是一款AI驱动的智能文档阅读工具，首期支持PDF文档的智能翻译和对话问答功能。

**核心功能**:
- 📄 PDF文档上传与预览
- 🌏 AI全文翻译（对照模式、选中联动）
- 💬 智能对话问答（全文/选中内容）
- ⬇️ 翻译结果导出（PDF/TXT/双语对照）

**技术栈**:
- 后端: Spring Boot 3.4.2 + Java 21 + MyBatis-Plus + MySQL + Redis
- 前端: React 18 + TypeScript + Vite + Ant Design
- AI: OpenAI协议（兼容多家模型服务商）

---

## 项目结构

```
DocAgent/
├── backend/                 # 后端项目（Spring Boot多模块）
│   ├── app/                # API层 - REST控制器
│   │   ├── src/main/java/com/docagent/app/
│   │   │   ├── DocAgentApplication.java
│   │   │   └── controller/
│   │   └── src/main/resources/
│   │       └── application.yml
│   ├── domain/             # 领域层 - 实体、仓储、服务
│   │   └── src/main/java/com/docagent/domain/
│   │       ├── entity/    # 数据库实体（Document, Translation, ChatHistory）
│   │       ├── repository/mysql/  # Mapper接口
│   │       └── service/   # 领域服务
│   └── pom.xml
├── frontend/               # 前端项目（React + TypeScript）
│   ├── src/
│   │   ├── pages/         # 页面组件
│   │   │   ├── Home/      # 首页（上传）
│   │   │   └── Reader/    # 阅读页
│   │   ├── components/    # 公共组件（待实现）
│   │   ├── services/      # API服务（待实现）
│   │   ├── stores/        # 状态管理（待实现）
│   │   └── styles/        # 全局样式（水墨风格）
│   ├── package.json
│   └── vite.config.ts
├── database/              # 数据库脚本
│   └── init.sql
├── PRD.md                 # 产品需求文档
└── README.md              # 本文件
```

---

## 快速开始

### 前置要求

- Java 21
- Node.js 18+
- MySQL 8.0+
- Redis 6+
- Maven 3.8+

### 1. 初始化数据库

```bash
mysql -u root -p < database/init.sql
```

### 2. 配置后端

编辑 `backend/app/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/docagent
    username: root
    password: your_password
  data:
    redis:
      host: localhost
      port: 6379

app:
  file:
    storage-path: ./storage/documents
  ai:
    openai:
      api-key: ${OPENAI_API_KEY}
      api-url: ${OPENAI_API_URL:https://api.openai.com/v1}
      model: ${OPENAI_MODEL:gpt-4}
```

或者创建 `.env` 文件（不提交到Git）:

```bash
OPENAI_API_KEY=sk-xxx
OPENAI_API_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4
```

### 3. 启动后端

```bash
cd backend
mvn clean install
mvn spring-boot:run -pl app
```

后端将运行在 `http://localhost:8080`

### 4. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端将运行在 `http://localhost:3000`

### 5. 访问应用

打开浏览器访问: `http://localhost:3000`

---

## 开发指南

### 后端开发规范

遵循全局 `CLAUDE.md` 中的开发规范：

- **分层架构**: Controller → Service → Repository → Entity
- **命名规范**: 类名PascalCase、方法名camelCase、常量UPPER_SNAKE_CASE
- **依赖注入**: 使用 `@RequiredArgsConstructor`（禁止 `@Autowired`）
- **日志规范**: 使用 `@Slf4j`，格式：`[模块][功能]-操作，参数={}`
- **注释规范**: 类、方法、字段必须添加Javadoc注释

#### 实体类创建流程

1. 在 `domain/entity/` 下创建实体类（使用 `@Data`, `@TableName` 等注解）
2. 在 `domain/repository/mysql/` 下创建Mapper接口（继承 `BaseMapper`）
3. 在 `domain/service/` 下创建Service接口和实现类

#### API接口创建流程

1. 创建请求DTO类（`*Request.java`）
2. 创建响应DTO类（`*Response.java`）
3. 在 `app/controller/` 下创建控制器
4. 实现对应的Service业务逻辑

### 前端开发规范

- **组件规范**: 使用函数组件 + Hooks
- **状态管理**: 使用Zustand
- **样式规范**:
  - 遵循水墨风格主题（竹青、墨黑、宣纸白）
  - 使用CSS变量（定义在 `styles/index.css`）
  - 组件样式使用CSS Modules
- **TypeScript**: 严格类型检查，定义清晰的接口

---

## 常用命令

### 后端

```bash
# 编译
mvn clean compile

# 运行
mvn spring-boot:run -pl app

# 测试
mvn test

# 打包
mvn clean package

# 跳过测试打包
mvn clean package -DskipTests
```

### 前端

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 代码检查
npm run lint
```

---

## 核心功能实现状态

### Phase 1: MVP版本（当前阶段）

- [x] 项目框架搭建
- [x] 数据库设计与初始化
- [x] 前后端基础代码结构
- [ ] 文档上传功能
- [ ] PDF解析与文本提取
- [ ] AI翻译服务集成
- [ ] 对照翻译UI
- [ ] AI对话功能
- [ ] 选中联动高亮
- [ ] 翻译结果下载

详细开发计划见 [PRD.md](PRD.md) 第6节

---

## API文档

### 文档管理

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/document/upload` | POST | 上传PDF文档 |
| `/api/document/list` | GET | 查询文档列表 |
| `/api/document/{id}` | GET | 获取文档详情 |

### 翻译功能

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/translate/start` | POST | 开始翻译 |
| `/api/translate/{id}` | GET | 获取翻译结果 |
| `/api/translate/download` | GET | 下载翻译文档 |

### 对话功能

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/chat/send` | POST | 发送对话消息 |
| `/api/chat/stream` | WebSocket | 流式对话 |
| `/api/chat/history` | GET | 查询对话历史 |

---

## 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `OPENAI_API_KEY` | OpenAI API密钥 | - |
| `OPENAI_API_URL` | OpenAI API地址 | https://api.openai.com/v1 |
| `OPENAI_MODEL` | 使用的模型 | gpt-4 |

### 文件存储

- **开发环境**: 本地存储（`./storage/documents`）
- **生产环境**: 建议使用云存储（阿里云OSS/七牛云）

---

## 水墨风格设计

### 色彩方案

| 名称 | 颜色代码 | 用途 |
|------|----------|------|
| 墨黑 | `#1a1a1a` | 主文字、边框 |
| 淡墨 | `#666666` | 次要文字 |
| 宣纸白 | `#f9f7f4` | 背景色 |
| 竹青 | `#5a8c7e` | 强调色、按钮 |
| 朱砂 | `#c8553d` | 警告、重点 |
| 烟灰 | `#d9d9d9` | 分割线 |
| 暮霭 | `#e8e8e8` | 卡片背景 |

### 字体

- **中文**: 思源宋体 / Noto Serif
- **英文**: Noto Serif / Georgia
- **代码**: Fira Code

---

## 技术决策记录

- **AI服务**: 使用OpenAI协议，便于切换不同服务商
- **用户体系**: MVP阶段使用sessionId，后续再加
- **文件存储**: 本地存储，后续可扩展云存储
- **向量数据库**: MVP阶段不引入，后续评估RAG优化

详见 [PRD.md](PRD.md) 第7节

---

## 常见问题

### Q: 如何切换AI模型服务商？

A: 只需修改环境变量 `OPENAI_API_URL` 和 `OPENAI_API_KEY`，指向兼容OpenAI协议的服务商即可（如Azure OpenAI、国内大模型厂商的OpenAI兼容接口）。

### Q: 为什么前端访问API失败？

A: 检查以下几点：
1. 后端是否正常启动（`http://localhost:8080`）
2. Vite代理配置是否正确（`vite.config.ts`）
3. 浏览器控制台查看具体错误信息

### Q: 数据库连接失败？

A: 确保：
1. MySQL服务已启动
2. 数据库 `docagent` 已创建（执行 `init.sql`）
3. `application.yml` 中的用户名密码正确

---

## 贡献指南

1. Fork本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

---

## 许可证

本项目仅供学习交流使用

---

## 联系方式

- **作者**: li.hongjian
- **邮箱**: lihongjian01@51talk.com
- **公司**: 51Talk

---

**最后更新**: 2025-11-12
