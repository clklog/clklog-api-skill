---
name: clklog-community-api
description: ClkLog 社区版API：覆盖流量趋势、访客分析、受访页面、忠诚度、地域、来源网站、搜索词、操作系统、设备、渠道、App崩溃等数据分析。此技能也应在以下场景被触发：用户提及 ClkLog 配置/设置/安装/导入、用户说"配置 ClkLog"、"设置 ClkLog API"、"ClkLog 技能导入后"、"ClkLog 已安装"、"刚导入 ClkLog"、"ClkLog 装好了"、或用户明确表达了配置 ClkLog API Key 与 API 地址的意图。技能加载后如发现配置缺失，会自动引导用户完成首次配置流程。
requiresSetup: true
agent_created: true
---

# ClkLog 社区版 API 技能

此技能覆盖 ClkLog 社区版 的两套 API 系统：
- **ClkLog 社区版分析 API**（路径前缀 `/api`）：流量趋势、访客分析、受访页面、地域、来源网站、搜索词、忠诚度、渠道、设备、操作系统、App 崩溃、下载等分析类接口
- **ClkLog 社区版管理 API**（路径前缀 `/manage`）：项目管理（获取项目列表）

## ⚡ 配置检查与引导（最高优先级）

技能加载后，第一步必须检查当前项目的 `.workbuddy/memory/MEMORY.md` 中是否存在 `## ClkLog 社区版 API 配置` 段落。

- **配置完整**（含 `api_key`、`analytics_base_url`、`manage_base_url`、`projects`、`default_project`）→ 直接使用，执行用户请求。
- **配置缺失或不完整** → 立即按下方流程引导配置，**不要先响应用户的数据查询需求**。

### 第一步：收集 API Key 和地址

直接向用户输出以下提示：

```
🔧 ClkLog 社区版 API 首次请求，请配置您【私有化部署的 ClkLog 社区版】的以下信息（空格或换行分隔）：

1. API Key：  登录ClkLog后台 → 密钥管理 → 创建并复制密钥，格式 clk_xxxx

2. 分析 API 地址：ClkLog分析 API 的请求地址，如 https://demo.clklog.com/api

3. 管理 API 地址：ClkLog管理 API 的请求地址，如 https://demo.clklog.com/manage

回复示例：
clk_abc123  https://demo.clklog.com/api  https://demo.clklog.com/manage
```

**解析规则：**

用户回复可能使用空格或换行分隔。解析时先统一替换换行为空格，再按空格拆分，取前三个非空字段：

- **API Key**：第一个字段（`clk_` 开头），去除前后空格和引号。
- **分析 API 地址**：第二个字段。
  - 已含 `/api` → 直接使用。
  - 仅为基础域名（如 `https://a.com`）→ 自动补齐 `/api` 后缀。
- **管理 API 地址**：第三个字段。
  - 已含 `/manage` → 直接使用。
  - 仅为基础域名（如 `https://a.com`）→ 自动补齐 `/manage` 后缀。

### 第二步：选择默认项目

拿到配置后，立即调用 `/project/getlist`（`{ pageNum: 1, pageSize: 100 }`），用管理 API 地址发送请求。

将返回的项目列表展示为"名称（编码）"格式，用 `AskUserQuestion` 让用户选择一个**默认项目**。

> 不要让用户手动输入项目编码——始终从 API 返回结果中让用户点击选择。

### 第三步：持久化

将配置写入 `.workbuddy/memory/MEMORY.md`：

```
## ClkLog 社区版 API 配置
- api_key: clk_xxxx
- analytics_base_url: https://demo.clklog.com/api
- manage_base_url: https://demo.clklog.com/manage
- default_project: hqq
- projects: hqq(货清清), zcunsoft(至存官网)
```

写入完成后，回头处理用户的原始需求。后续使用直接读取此配置，不再重复。

### 项目编码选择规则

`projectName` 是项目编码（非项目名称）。确定规则按优先级：

1. 用户**说了编码**（如"查 hqq 项目"）→ 直接使用。
2. 用户**说了名称**（如"查货清清"）→ 从 `projects` 列表中匹配对应编码。
3. 都不匹配 → 使用 `default_project`。

> - 若 `projects` 中找不到目标项目 → 刷新 `/project/getlist` 并追加到配置。
> - 切换项目后需重新调用 `/channel/getChannelList` 获取该项目的渠道列表。

## 目的

正确调用 ClkLog 社区版分析 API 和 管理 API 接口，构建合理的请求结构并处理响应。所有接口均使用 `POST` 方法，请求体为 JSON 格式，统一请求头 `Content-Type: application/json`。管理 API 仅用于获取项目列表。

## 参考文档

- 加载 `references/api_docs.md` 获取 ClkLog 社区版 API 的完整接口列表、请求/响应结构和字段说明（含分析 API 13 个模块，管理 API 仅 `/project/getlist`）。

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

> 管理 API 仅 `/project/getlist` 一个接口，用于获取项目列表，基础 URL 为 `manage_base_url`。

## 工作流程

1. **检查配置** — 读取 `.workbuddy/memory/MEMORY.md`，缺失或不完整时按「配置检查与引导」完成配置。
2. **确定项目编码** — 按"项目编码选择规则"确定 `projectName`。
3. **获取渠道维度** — 若涉及渠道筛选，先调用 `/channel/getChannelList`（传入 `projectName`）获取可用的 `displayName`。
4. 阅读 `references/api_docs.md` 定位接口和请求结构。
5. 构建 JSON 请求体，包含 `X-API-Key` 请求头，并选择正确的基础 URL（分析接口 → `analytics_base_url`，项目列表 → `manage_base_url`）。
6. 解析响应 — 检查 `code === 200`。
7. 下载接口将二进制响应保存为文件（如 `.xlsx`）。

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
- **Windows 环境推荐使用 Node.js 调用 API**：在 Windows/Git Bash 下 curl 传入含中文的 JSON（如 `"visitorType":"全部"`）会返回 400 Bad Request。推荐使用 Node.js `https` 模块发送请求，避免编码问题。`--data-binary @file.json` 方式在 Windows 下也可能失败。
