# Mock数据使用说明

## 概述

为了方便在没有后端服务或数据库的情况下测试前端功能，我们提供了完整的Mock数据和Mock API服务。

## 文件说明

### Mock数据文件
- **`frontend/src/utils/mockData.ts`**: 包含所有Mock数据和Mock API实现
  - Mock文档列表（3个示例文档）
  - Mock翻译数据（包含4个段落的中英文对照）
  - Mock对话历史（包含示例对话）
  - 完整的Mock API函数

### Mock API封装
- **`frontend/src/api/mockApi.ts`**: Mock API开关和封装
  - 通过`USE_MOCK`常量控制是否使用Mock数据
  - 自动切换真实API和Mock API

## 如何使用

### 1. 启用Mock模式（当前默认）

Mock模式已经默认启用，无需任何配置。直接启动前端即可：

```bash
cd frontend
npm run dev
```

访问 http://localhost:3000，你将看到：
- **首页**: 显示3个Mock文档
- **阅读器**:
  - PDF区域显示占位符（Mock模式提示）
  - 翻译功能可以正常测试
  - 对话功能可以正常测试

### 2. 切换到真实API模式

当后端服务和数据库准备好后，按以下步骤切换：

**步骤1**: 修改 `frontend/src/api/mockApi.ts`

```typescript
// 将 USE_MOCK 改为 false
const USE_MOCK = false;
```

**步骤2**: 修改 `frontend/src/pages/Reader/index.tsx` 的 getPdfFileUrl 函数

```typescript
const getPdfFileUrl = (): string | null => {
  if (!document || !document.filePath) return null
  // 启用真实PDF文件获取
  return `/api/document/${document.id}/file`
}
```

**步骤3**: 重启前端开发服务器

```bash
# 按 Ctrl+C 停止当前服务
npm run dev
```

### 3. 使用环境变量控制（推荐）

为了更方便地切换模式，可以使用环境变量：

**步骤1**: 创建 `.env.development` 文件

```bash
# 开发环境使用Mock
VITE_USE_MOCK=true
```

**步骤2**: 创建 `.env.production` 文件

```bash
# 生产环境使用真实API
VITE_USE_MOCK=false
```

**步骤3**: 修改 `frontend/src/api/mockApi.ts`

```typescript
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
```

这样在开发时自动使用Mock，打包时自动使用真实API。

## Mock数据说明

### 文档数据
Mock提供了3个示例文档：
1. **AI技术白皮书.pdf** (2MB, 15页)
2. **深度学习入门指南.pdf** (3MB, 25页)
3. **神经网络基础.pdf** (1.5MB, 10页)

### 翻译数据
Mock翻译数据包含4个段落的中英文对照，内容关于AI技术介绍。

### 对话数据
Mock对话历史包含4条示例对话，展示了：
- 文档概要询问
- 技术细节询问（带选中文本）
- AI的智能回复

### AI回复逻辑
Mock AI会根据用户提问的关键词智能回复：
- 包含"什么"、"是什么" → 解释性回答
- 包含"如何"、"怎么" → 步骤性回答
- 包含"为什么"、"原因" → 原因分析
- 包含"解释"、"说明" → 详细说明
- 其他 → 通用回答

## 功能测试清单

使用Mock模式可以测试以下功能：

### ✅ 已支持的功能
- [x] 文档列表展示
- [x] 文档上传（模拟）
- [x] 文档详情加载
- [x] 翻译启动（模拟3秒翻译时间）
- [x] 翻译结果展示（段落对照）
- [x] 对话发送和接收
- [x] 对话历史加载
- [x] 选中文本提问
- [x] 对话历史清空

### ⏳ Mock模式限制
- [ ] PDF文件预览（显示占位符）
- [ ] 文件真实上传
- [ ] 长时间翻译轮询（固定3秒）

## 常见问题

### Q: 为什么看不到PDF内容？
A: Mock模式下没有真实的PDF文件，所以显示占位符。要查看真实PDF，需要切换到真实API模式并启动后端服务。

### Q: 上传的文件去哪了？
A: Mock模式下，文件上传只是模拟操作，文件并没有真正上传到服务器。新上传的文档会添加到Mock数据列表的顶部。

### Q: 翻译总是很快完成？
A: Mock模式下翻译固定为3秒完成，这是为了测试翻译流程。真实环境中翻译时间取决于文档长度和AI响应速度。

### Q: AI回复怎么这么智能？
A: Mock AI使用简单的关键词匹配逻辑，根据问题类型返回预设的回答模板。真实环境中会调用OpenAI等大模型API。

## 后端准备清单

当你准备切换到真实API时，确保后端满足以下条件：

### 1. 数据库
- [ ] MySQL已安装并运行
- [ ] 执行了 `database/init.sql` 初始化脚本
- [ ] 数据库连接配置正确（`application.yml`）

### 2. 配置文件
- [ ] `application.yml` 中配置了数据库连接信息
- [ ] 配置了AI服务（OpenAI API Key）
- [ ] 配置了文件存储路径

### 3. 后端服务
- [ ] Maven依赖已安装
- [ ] 项目编译成功
- [ ] 后端服务已启动（端口8080）

### 4. API测试
使用Postman或curl测试后端接口：

```bash
# 测试文档列表
curl http://localhost:8080/api/document/list

# 测试文档上传
curl -X POST -F "file=@test.pdf" http://localhost:8080/api/document/upload
```

## 总结

Mock模式让你可以：
1. **快速体验**：无需配置数据库和后端，立即看到界面效果
2. **前端开发**：专注于UI和交互开发，不被后端阻塞
3. **功能演示**：向他人展示产品功能和界面设计

当后端准备好后，只需修改一个开关即可切换到真实环境！
