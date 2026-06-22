---
name: clklog-community-api
description: 当用户需要调用或查询 ClkLog 社区版API (https://demo.clklog.com) 或管理 API 时使用此技能。 分析 API 覆盖流量趋势、访客分析、受访页面、忠诚度、地域、来源网站、 搜索词、操作系统、设备、渠道、App崩溃、数据下载等。 管理 API 覆盖项目列表等。
agent_created: true
---

# ClkLog 社区版 API 技能

此技能覆盖 ClkLog 社区版 的两套 API 系统：
- **ClkLog 社区版分析 API**（路径前缀 `/api`）：流量趋势、访客分析、受访页面、地域、来源网站、搜索词、忠诚度、渠道、设备、操作系统、App 崩溃、下载等分析类接口
- **ClkLog 社区版管理 API**（路径前缀 `/manage`）：项目管理（获取项目列表）

## 配置（首次使用时由用户提供）

此技能的 API Key 和 API 基础 URL **不是预置的**，需要用户首次使用时配置。项目编码不需要用户手动输入——首次使用时会通过管理 API 自动获取项目列表，由用户选择要分析的项目。ClkLog 社区版支持多个项目的数据分析，用户可能在分析过程中切换不同的项目。

### 配置流程

1. **读取配置**：检查当前项目的 `.workbuddy/memory/MEMORY.md`，查找以 `## ClkLog 社区版 API 配置` 为标题的段落。如果找到，直接使用其中记录的 `api_key`、`analytics_base_url`、`manage_base_url`、项目列表和默认项目，跳到后续工作流程。

2. **第二步 — API Key 与 API 地址**：如果未找到配置段落，使用**一次** `AskUserQuestion` 调用，包含三个问题：问题一收集 API Key（文本框输入），问题二收集分析 API 地址（文本框输入），问题三收集管理 API 地址（文本框输入）。用户一次填完、无需多轮交互。

   **问题一 — API Key**（文本框输入，`options: []`）：
   > "请输入你的 ClkLog API Key
   >      获取步骤：1. 登录 ClkLog 后台 → 2. 进入「密钥管理」→ 3. 创建并复制 API Key（格式 clk_xxxx）"
   - `options: []` — 纯文本框，无选项按钮

   **问题二 — ClkLog 分析 API 地址**（文本框输入，`options: []`）：
   > "请输入你的 ClkLog 分析 API 地址（示例：https://yourclklogdomain.com/api）"
   - `options: []` — 纯文本框，无选项按钮

   **问题三 — ClkLog 管理 API 地址**（文本框输入，`options: []`）：
   > "请输入你的 ClkLog 管理 API 地址（示例：https://yourclklogdomain.com/manage）"
   - `options: []` — 纯文本框，无选项按钮

   **解析规则**（拿到回答后）：
   - API Key：从问题一提取。
   - 用户输入完整路径（含 `/api` 或 `/manage`）→ 直接使用，不追加后缀
   - 用户输入基础域名（如 `https://yourclklogdomain.com`）→ 自动补齐为 `https://yourclklogdomain.com/api` 或 `https://yourclklogdomain.com/manage`
   - 其中一个地址留空 → 从填写的那个推导。如只填了分析 API `https://a.com/api`，管理 API 自动推导为 `https://a.com/manage`
   - **无需追问用户补全**，直接推导后进入第三步

3. **第三步 — 获取项目列表并选择项目**：拿到 API Key 和 URL 后，立即调用管理 API `/project/getlist`（请求体含 `pageNum: 1, pageSize: 100`，建议设置较大 `pageSize` 一次性获取全部项目）获取项目列表。将项目列表以"项目名称（编码）"的形式展示给用户，使用 `AskUserQuestion` 工具让用户选择：
   - 要分析的项目（可多选）
   - 默认分析的项目（从已选项目中指定一个）

   **不要让用户手动输入项目编码**——用户通常不知道编码是什么，必须从 API 返回结果中让用户选择。

4. **持久化**：将配置和项目信息写入当前项目的 `.workbuddy/memory/MEMORY.md`，格式如下：
   ```
   ## ClkLog 社区版 API 配置
   - analytics_base_url: https://demo.clklog.com/api
   - manage_base_url: https://demo.clklog.com/manage
   - api_key: clk_xxxx（用户提供）
   - default_project: hqq（用户选择的项目编码）
   - projects: hqq(货清清), zcunsoft(至存官网), clklog(clklog官网)（编码(名称)格式，逗号分隔）
   ```

5. **后续使用**：每次调用 ClkLog API 时，从 `.workbuddy/memory/MEMORY.md` 读取配置值，用于：
   - 请求头 `X-API-Key`
   - 请求 URL 的基础路径（分析 API 或管理 API）
   - 请求体中的 `projectName` 字段（根据下方"项目编码选择规则"确定）

### 项目编码选择规则

`projectName` 是 ClkLog 管理后台中配置的**项目编码**（不是项目名称），不同项目编码对应不同的数据集。用户通常只知道项目名称（如"货清清"），不知道编码（如"hqq"）。确定 `projectName` 的优先级：

1. **用户明确指定编码** — 用户说了"查 hqq 项目的流量"或"用 project2 来查"，则直接使用指定编码
2. **用户指定项目名称** — 用户说了"查货清清的流量"或"帮我分析至存官网"，则从 MEMORY.md 的 `projects` 列表中查找对应的 `projectName`（编码(名称)格式中的编码部分）
3. **使用默认项目** — 以上都无法确定时，使用配置中的 `default_project`

**重要**：
- **不要让用户手动输入项目编码**。如果 MEMORY.md 中没有项目列表，先调用 `/project/getlist` 获取后展示给用户选择
- 如果用户提及了一个不在 `projects` 列表中的项目编码或名称，调用 `/project/getlist` 刷新项目列表，将其追加到 MEMORY.md 配置的 `projects` 字段中
- 切换项目编码时，渠道、地域等维度数据也随之变化。务必重新调用 `/channel/getChannelList`（传入新的 projectName）获取该项目的可用渠道

## 目的

正确调用 ClkLog 社区版分析 API 和 管理 API 接口，构建合理的请求结构并处理响应。所有接口均使用 `POST` 方法，请求体为 JSON 格式。

- **分析 API 基础 URL**：从 `.workbuddy/memory/MEMORY.md` 读取（用户首次使用时配置）
- **管理 API 基础 URL**：从 `.workbuddy/memory/MEMORY.md` 读取（用户首次使用时配置），仅用于获取项目列表
- **所有请求**：`Content-Type: application/json`

## 参考文档

- 加载 `references/api_docs.md` 获取 ClkLog 社区版 API 的完整接口列表、请求/响应结构和字段说明（全部 13 个模块）。
- ClkLog 社区版管理 API 的项目管理接口文档也在 `references/api_docs.md` 的"十三、项目管理"章节中（仅包含 `/project/getlist`）。

## 关键约定

### 认证 — API Key（所有调用必需）

所有 API 请求（分析 API 和管理 API）必须在请求头中包含 API Key。**无需验证码或登录。**

```
X-API-Key: <从 .workbuddy/memory/MEMORY.md 读取 api_key>
```

请在**每一个** API 请求中添加此请求头，包括管理 API 的项目相关接口。

### 渠道名称映射

不同项目的渠道内部编码（`/channel/getChannelList` 返回的 `name`）与 API 请求中的 `channel` 参数使用**中文显示名**（`displayName`）不同。调用分析接口时 `channel` 字段必须使用中文显示名。

**重要**：`channel` 参数的可用值因项目而异。查询前**务必先调用 `/channel/getChannelList`**（传入 `projectName`），获取该项目可用渠道的 `displayName` 列表，再据此构建 `channel` 参数。传错误的值会报校验错误。

### 通用请求字段

大多数分析接口需要以下字段：
- `projectName`（字符串）：ClkLog 管理后台中配置的**项目编码**，不同项目编码对应不同数据集。根据"项目编码选择规则"确定使用哪个编码
- `startTime` / `endTime`（ISO 8601 日期时间格式，如 `"2024-01-01T00:00:00Z"`）
- `channel`（数组）：使用渠道的中文显示名，如 `["网站"]`；空数组 `[]` 表示全部渠道。可用值因项目而异，需先调用 `/channel/getChannelList` 获取
- `visitorType`（字符串）：`"新访客"`、`"老访客"` 或 `"全部"`
- `timeType`（字符串）：`"hour"`、`"day"`、`"week"` 或 `"month"`。**注意：timeType 控制趋势数据的分组粒度，而非时间范围**：
  - `"hour"` → 按分钟分组
  - `"day"` → 按小时分组（返回 24 条，statTime 为 "00"~"23"）
  - `"week"` → 按天分组（statTime 为 "YYYY-MM-DD"）
  - `"month"` → 按天分组
  - **查询多日趋势时用 `"week"`，查单日小时趋势用 `"day"`**

分页相关字段：`pageNum`（从 1 开始）、`pageSize`（建议 50）、`sortName`、`sortOrder`。

### 核心数据结构 — FlowDetail

大多数查询响应返回 `FlowDetail` 对象，包含：`pv`、`uv`、`visitCount`、`newUv`、`ipCount`、`avgPv`、`avgVisitTime`、`bounceRate`、`visitTime`、`channel`、`province`、`country`、`city`、`statTime` 等字段。完整字段列表请参考 `references/api_docs.md`。

## 分析 API 模块概览

| 模块 | 路径前缀 | 主要接口 |
|------|----------|----------|
| 趋势分析 | `/flow/` | getFlow, getFlowTrend, getFlowTotal, getFlowDetail, getFlowDetailByCompare |
| 访客分析 | `/visitor/` | getVisitor, getVisitorTotal, getVisitorDetail, getVisitorDetailinfo, getVisitorList, getVisitorChannel, getVisitorSessionList, getVisitorSessionUriList, getLogAnalysisList |
| 受访页面分析 | `/visituri/` | getVisitUri, getVisitUriTotal, getVisitUriPathTreeTotal, getVisitUriListOfUriPath, getVisitUriDetailList |
| 忠诚度分析 | `/uservisit/` | getUserVisit, getUserVisitTime, getUserPv, getUserLatestTime |
| 地域分析 | `/area/` | getArea, getAreaDetailTotal, getAreaDetailList, getAreaDetailProvinceListByCompare, getAreaDetailCountryList, getAreaDetailCountryListByCompare, getAreaDetailCityList |
| 来源网站分析 | `/sourcewebsite/` | getSourceWebSiteTop10, getSourceWebSiteTotal, getSourceWebSiteDetail |
| 搜索词分析 | `/searchword/` | getSearchWordTop10, getSearchWordDetail |
| 渠道分析 | `/channel/` | getChannelList, getChannelDetail |
| 设备分析 | `/device/` | getDeviceDetailList |
| 操作系统分析 | `/os/` | getOsDetail |
| App 崩溃分析 | `/appCrashed/` | totalSummary, trendSummary, groupedSummary, getPagedSummary, getPage |
| 下载统计结果 | `/download/` | exportFlowTrendDetail, exportVisitorDetail, exportVisitor, exportVisitorList, exportVisitUriDetail, exportSourceWebsiteDetail, exportSearchWordDetail, exportDeviceDetail, exportChannelDetail, exportAreaDetail |

## 管理 API 模块概览

ClkLog 社区版管理 API 基础 URL 不同于分析 API（由用户配置），但认证方式相同（X-API-Key）。

| 模块 | 路径前缀 | 主要接口 |
|------|----------|----------|
| 项目管理 | `/project/` | getlist |

**最常用接口**：`/project/getlist`（分页获取项目列表，请求含 `pageNum` 和 `pageSize`，用于自动发现项目和配置）

## 工作流程

1. **检查配置** — 读取 `.workbuddy/memory/MEMORY.md` 中的 ClkLog 社区版 API 配置。如果未找到，按照"配置流程"引导用户完成配置：① 一次询问 API Key + 分析 API 地址 + 管理 API 地址（三个问题在一个表单，用户一次完成）→ ② 调用管理 API 获取项目列表，让用户选择项目和默认项目。
2. **获取项目列表并选择项目** — 如果配置中缺少项目列表，调用管理 API `/project/getlist`（请求体 `{ pageNum: 1, pageSize: 100 }`）获取用户所有授权项目，以"项目名称（编码）"格式展示给用户，请用户选择要分析的项目并设为默认项目。**不要让用户手动输入项目编码**，必须从 API 返回结果中选择。将选定的项目和完整项目列表写入 MEMORY.md。
3. **确定项目编码** — 根据用户请求和"项目编码选择规则"确定本次调用使用的 `projectName`。用户提到项目名称时，从 projects 列表中查找对应的编码。
4. **获取项目维度** — 如果涉及渠道筛选且尚未缓存该项目的渠道列表，先调用 `/channel/getChannelList`（传入确定的 projectName）获取可用渠道的 displayName。
5. **添加 X-API-Key 请求头** — 在每个请求中包含 `X-API-Key: <api_key>`（从配置读取）。
6. **选择正确的基础 URL**：分析接口 → `analytics_base_url`；项目列表接口 → `manage_base_url`。
7. 阅读 `references/api_docs.md` 定位正确的接口和请求结构。
8. 构建包含所有必填字段的 JSON 请求体，`projectName` 使用步骤 3 确定的值。
9. 解析响应 — 分析 API 和管理 API 均检查 `code === 200`（整数）。两者成功码相同。
10. 对于下载接口，将二进制响应保存为文件（如 `.xlsx`）。

## 调用示例 (curl)

```bash
# 分析 API：查询流量趋势
curl -X POST "<analytics_base_url>/flow/getFlowTrend" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <api_key>" \
  -d '{
    "timeType": "day",
    "channel": [],
    "country": [],
    "province": [],
    "visitorType": "全部",
    "startTime": "2024-01-01T00:00:00Z",
    "endTime": "2024-01-31T23:59:59Z",
    "projectName": "<项目编码>"
  }'

# 管理 API：获取项目列表
curl -X POST "<manage_base_url>/project/getlist" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <api_key>" \
  -d '{
    "pageNum": 1,
    "pageSize": 100
  }'
```

## 注意事项

### 通用
- **如果请求返回 401/403**，可能是 API Key 无效或已过期 — 请向用户索取新的 Key，并更新 `.workbuddy/memory/MEMORY.md` 中的配置。
- **中文编码问题**：在 Windows/Git Bash 环境下，curl 直接传入中文 JSON 可能导致 UTF-8 编码错误。建议将请求体写入 `.json` 文件（UTF-8 编码），再用 `--data-binary @file.json` 发送。
### 分析 API / 管理 API
- **响应 code 类型**：分析 API 和管理 API 的 code 均为**整数 `200`** 表示成功（条件判断用 `code === 200`）。两者成功码相同。
- **`getFlow` 概览接口**：`/flow/getFlow` 返回 `current`（当前区间汇总）、`previous`（上一周期环比）、`samePeriod`（同比）三个 FlowSummary 对象，适合快速获取区间汇总和对比数据。`getFlowTotal` 在某些参数组合下可能返回 500 错误，建议优先使用 `getFlow`。
- `startTime` / `endTime` 字段使用 `date-time` 格式（`"YYYY-MM-DDTHH:mm:ssZ"`）。管理 API 的 `startDate` / `endDate` 也使用 `date-time` 格式。
- **时区注意事项**：使用 UTC 时间戳时（如 `"2026-06-07T16:00:00Z"` 表示 GMT+8 的 6月8日0点），API 可能按 UTC 日期分组导致包含前一天数据。建议查询时适当调整时间范围。
- **访客分析路径**：社区版使用 `/visitor/` 前缀（非旧的 `/user/` 前缀），如 `/visitor/getVisitor`。
- 下载接口返回二进制文件流 — 请使用适当的 HTTP 处理方式保存文件。
- **管理 API URL**：项目列表接口使用 `manage_base_url`（用户配置），与分析 API 的 `analytics_base_url`（用户配置）路径不同但同域同认证。
- **Windows 环境推荐使用 Node.js 调用 API**：在 Windows/Git Bash 下 curl 传入含中文的 JSON（如 `"visitorType":"全部"`）会返回 400 Bad Request。推荐使用 Node.js `https` 模块发送请求，避免编码问题。`--data-binary @file.json` 方式在 Windows 下也可能失败。
