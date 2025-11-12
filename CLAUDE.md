# 全局个人配置 CLAUDE.local.md
```markdown
## developer information
- **company**：51Talk
- **author**：li.hongjian
- **email**：lihongjian01@51talk.com
```

# 全局配置 CLAUDE.md
```markdown
你是一个资深的java专家，请在开发中遵循如下规则：
- 严格遵循 **SOLID、DRY、KISS、YAGNI** 原则
- 遵循 **OWASP 安全最佳实践**（如输入验证、SQL注入防护）
- 采用 **分层架构设计**，确保职责分离
- 代码变更需通过 **单元测试覆盖**（测试覆盖率 ≥ 80%）

---

## 二、技术栈规范
### 技术栈要求
- **框架**：Spring Boot 3.4.2 + Java 21
- **依赖**：
  - 核心：Spring Boot, MyBatis-Plus, Lombok
  - 数据库：MySQL Driver
  - 缓存：Redis
  - RPC：Dubbo
  - 其他：apache-commons-lang3, hutool
- **构建工具**：Maven

---

## 三、应用逻辑设计规范
### 1. 分层架构原则
| 层级          | 职责                                | 约束条件                                                                 |
|---------------|-----------------------------------|--------------------------------------------------------------------------|
| **Controller** | 处理 HTTP 请求与响应，定义 API 接口  | - 禁止直接操作数据库<br>- 必须通过 Service 层调用                          |
| **Service**    | 业务逻辑实现，事务管理，数据校验      | - 必须通过 MyBatis-Plus Service 访问数据库<br>- 业务层返回 DTO 而非实体类（除非必要）|
| **Repository** | 数据持久化操作，定义数据库查询逻辑     | - 必须继承 `BaseMapper`<br>- 使用`Wrappers`创建查询、更新条件       |
| **Entity**     | 数据库表结构映射对象                | - 仅用于数据库交互<br>- 禁止直接返回给前端（需通过 DTO 转换）               |

---

## 四、核心代码规范
### 1. 实体类（Entity）规范
```java
@Data // Lombok 注解
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 50)
    private String username;

    @Email
    private String email;

}
```

---

## 五、安全与性能规范
1. **输入校验**：
    - 使用 `@Valid` 注解 + JSR-303 校验注解（如 `@NotBlank`, `@Size`）
    - 禁止直接拼接 SQL 防止注入攻击
2. **事务管理**：
    - `@Transactional` 注解仅标注在 Service 方法上
    - 避免在循环中频繁提交事务
3. **性能优化**：
    - 避免在循环中执行数据库查询（批量操作优先）

---

## 六、代码风格规范
1. **命名规范**：
    - 类名：`UpperCamelCase`（如 `UserServiceImpl`）
    - 方法/变量名：`lowerCamelCase`（如 `saveUser`）
    - 常量：`UPPER_SNAKE_CASE`（如 `MAX_LOGIN_ATTEMPTS`）
2. **注释规范**：
    - 类必须添加注释且类级注释使用 Javadoc
    - 类变量、成员变量必须添加注释且变量级注释使用 Javadoc
    - 方法必须添加注释且方法级注释使用 Javadoc 格式
    - 计划待完成的任务需要添加 `// TODO` 标记
    - 存在潜在缺陷的逻辑需要添加 `// FIXME` 标记
3. **代码格式化**：
    - 使用 IntelliJ IDEA 默认的 Spring Boot 风格
    - 禁止手动修改代码缩进（依赖 IDE 自动格式化）
4. **其他**：
    - 字符串判空使用 `StringUtils.isBlank()`, `StringUtils.isNotBlank()`
    - 对象判空使用 `Objects.isNull()`,`Objects.nonNull()`
    - 避免使用 `@Autowired`, 使用 Lombok 的 `@RequiredArgsConstructor`
5. 不需要在DTO和VO类的字段中增加JSON序列化相关配置比如`@JsonProperty`，因为Spring web mvc的的序列化和反序列化会自动进行蛇形和驼峰的转换

---

## 七、部署规范
1. **部署规范**：
    - 生产环境需禁用 `@EnableAutoConfiguration` 的默认配置
    - 敏感信息通过 `application.properties` 外部化配置
    - 使用 `Spring Profiles` 管理环境差异（如 `dev`, `test`, `prod`）

---

## 八、扩展性设计规范
1. **接口优先**：
    - 服务层接口（`UserService`）与实现（`UserServiceImpl`）分离
2. **扩展点预留**：
    - 关键业务逻辑需提供 `Strategy` 或 `Template` 模式支持扩展
3. **日志规范**：
    - 使用 `SLF4J` 记录日志（禁止直接使用 `System.out.println`）
    - 核心操作需记录 `INFO` 级别日志，异常记录 `ERROR` 级别
    - 日志统一使用 Lombok 的 `@Slf4j`
    - 日志输出内容里统一增加`[模块][功能][...]-操作，参数={}`的多级描述，比如`logger.info("[用户][注册]-使用手机号注册，Mobile={}", "1234567890");`

---

## 九、特定流程
1. **ORM类创建流程**：创建实体类 -> 创建`Mapper`接口 -> 创建`MyBatis-Plus Service实现类`
2. **Api接口创建流程**：创建请求对象类 -> 创建响应对象类 -> 创建控制器类(已存在的可省略) -> 创建服务类

---

## 十、文档维护规范 ⚠️ 重要

### 1. DEVELOPMENT.md 文档更新规范

**⚠️ 每次代码变更后必须更新 DEVELOPMENT.md 文档！**

#### 更新时机：
- ✅ 新增功能/模块
- ✅ 修复重要Bug
- ✅ 修改架构设计
- ✅ 完成编译验证
- ✅ API接口变更
- ✅ 依赖版本更新

#### 更新内容：
1. **功能清单更新**：
   - 在对应章节标记 ✅（已完成）或 ⏳（进行中）
   - 新增功能需详细描述实现方式和关键逻辑

2. **API接口更新**：
   - 更新接口列表（URL、方法、请求/响应格式）
   - 标注响应封装格式（`Result<T>`）

3. **已知问题更新**：
   - 已解决问题标记 ~~删除线~~ ✅
   - 新发现问题及时添加

4. **审查清单更新**：
   - 完成项打勾 [x]
   - 更新功能完整性统计

5. **更新日志**：
   - 在文档末尾注明最后更新时间和变更内容
   - 格式：`**最后更新**: YYYY-MM-DD (变更说明)`

#### 示例：
```markdown
### 3.6 统一响应与异常处理 ✅  (新增)

#### 3.6.1 统一响应封装 (Result.java) ✅
...

**最后更新**: 2025-11-12 (新增统一响应封装和异常处理)
```

### 2. Git提交与文档同步

**提交前检查清单**：
- [ ] 代码编译通过
- [ ] DEVELOPMENT.md 已更新
- [ ] 新增功能已记录在对应章节
- [ ] API接口文档已更新
- [ ] 已知问题已更新
- [ ] Git提交信息清晰（参考 DEVELOPMENT.md 第十二章）

**建议流程**：
```bash
# 1. 完成代码开发
# 2. 更新 DEVELOPMENT.md
# 3. 编译验证
mvn clean compile
# 4. 提交代码
git add .
git commit -m "feat: 添加统一响应封装和全局异常处理"
```

---

# 项目配置 <project>/CLAUDE.md
```markdown
# 个人偏好设置
开发者信息查看 @～/.claude/CLAUDE.local.md

---

## 项目结构规范

### 后端结构
1. 项目 `[domain](domain)`模块是与数据库交互的模块、[app](app)是与外部交互的模块，提供API
2. **实体类(Entity)创建位置**：子模块`domain`的`entity`包下
3. **Repository接口创建位置**：子模块`domain`的`repository.mysql`包下
4. **控制器类(Controller)创建位置**：指定模块的`app.controller`包下

### 前端结构
1. 项目技术栈：React 18 + TypeScript + Vite + Ant Design 5.14
2. **目录结构**：
   - `src/pages/` - 页面组件（Home、Reader等）
   - `src/components/` - 可复用组件（PDFViewer、TranslationView、ChatPanel等）
   - `src/api/` - API服务封装
   - `src/utils/` - 工具函数（request、mockData等）
3. **API调用规范**：
   - 使用axios作为HTTP客户端
   - 统一封装在`src/api/`目录下，按功能模块分文件（document.ts、translate.ts、chat.ts）
   - 每个API文件导出独立函数，使用`export const functionName`而非默认导出
   - Mock数据通过`mockApi.ts`统一切换，使用`USE_MOCK`标志控制
4. **组件开发规范**：
   - 函数组件 + Hooks
   - TypeScript类型定义在`src/api/types.ts`
   - CSS样式与组件同目录，使用CSS变量（如`--color-bamboo-green`）
5. **Mock数据系统**：
   - Mock数据定义在`src/utils/mockData.ts`
   - Mock API切换在`src/api/mockApi.ts`
   - 详细使用说明见`MOCK_GUIDE.md`

---

## 开发流程规范

### 每次任务完成后必做：
1. ✅ 更新TODO列表 - 使用TodoWrite工具标记任务完成状态
2. ✅ 更新CLAUDE.md - 记录新增的规范、结构或重要决策
3. ✅ 更新DEVELOPMENT.md - 更新功能清单、API文档、已知问题
4. ✅ 代码编译验证 - 确保代码可以正常运行

### API模块导入导出规范（重要！）
**问题**：TypeScript ES6模块导入导出需要保持一致性

**正确做法**：
- API文件使用命名导出：`export const functionName = () => {}`
- 导入时使用命名空间导入：`import * as apiName from './file'`

**示例**：
```typescript
// ✅ 正确 - document.ts
export const uploadDocument = (file: File): Promise<number> => { ... }
export const getDocumentList = (): Promise<Document[]> => { ... }

// ✅ 正确 - mockApi.ts
import * as documentApi from './document';  // 收集所有导出为对象
import * as translateApi from './translate';
import * as chatApi from './chat';

// ❌ 错误 - 不要这样做
import { documentApi } from './document';  // documentApi不存在
```
```