# ClkLog 社区版 API 完整接口文档

## 基本信息

- **分析 API 文档**: https://demo.clklog.com/api/v3/api-docs/default
- **管理 API 文档**: https://demo.clklog.com/manage/v3/api-docs/default
- **服务器**: `http://demo.clklog.com:443`
- **所有接口**: POST 方法，Content-Type: application/json

---

## 通用请求参数说明

大多数接口共享以下参数：

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `projectName` | string | ✅ | 项目编码 | `"your_project_code"` |
| `startTime` | date-time | ✅ | 开始时间 | `"2024-01-01T00:00:00Z"` |
| `endTime` | date-time | ✅ | 结束时间 | `"2024-01-31T23:59:59Z"` |
| `channel` | array[string] | ✅ | 渠道 | `[]`（全部渠道）或 `["网站"]` |
| `country` | array[string] | 部分 | 国家或地区 | `[]` |
| `province` | array[string] | 部分 | 省份 | `[]` |
| `visitorType` | string | 部分 | 访客类型 | `"新访客"` / `"老访客"` / `"全部"` |
| `timeType` | string | 部分 | 时间类型 | `"hour"` / `"day"` / `"week"` / `"month"` |

分页参数：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `pageNum` | int32 | 页码（从 1 开始） |
| `pageSize` | int32 | 每页条数（建议 50） |
| `sortName` | string | 排序字段（pv / visitCount / uv / ipCount 等） |
| `sortOrder` | string | 排序方向（desc / asc） |

---

## 通用响应格式

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": { ... }
}
```

**注意**：分析 API 和管理 API 的 code 均为整数类型，`200` 表示成功，非 200 表示错误。

---

## FlowDetail（核心数据结构）

绝大多数接口的响应都包含此结构：

| 字段 | 类型 | 说明 |
|------|------|------|
| `statTime` | string | 统计时间 |
| `pv` | integer | 浏览量 (PV) |
| `visitCount` | integer | 访问次数 |
| `newUv` | integer | 新访客数 |
| `uv` | integer | 访客数 (UV) |
| `ipCount` | integer | IP 数 |
| `avgPv` | float | 平均访问页数 |
| `visitTime` | integer | 访问时长 |
| `avgVisitTime` | float | 平均访问时长 |
| `bounceRate` | float | 跳出率 |
| `channel` | string | 渠道 |
| `pvRate` | float | 浏览量占比 |
| `visitCountRate` | float | 访问次数占比 |
| `newUvRate` | float | 新访客数占比 |
| `uvRate` | float | 访客数占比 |
| `ipCountRate` | float | IP 数占比 |
| `device` | string | 设备 |
| `sourcesite` | string | 来源网站 |
| `visitorType` | string | 访客类型 |
| `searchword` | string | 搜索词 |
| `province` | string | 省份 |
| `country` | string | 国家或地区 |
| `city` | string | 城市 |
| `downPvCount` | integer | 贡献下游流量 |
| `exitCount` | integer | 退出页次数 |
| `exitRate` | float | 退出率 |
| `entryCount` | integer | 入口页次数 |
| `uri` | string | 页面 URL |
| `distinctId` | string | 访客 ID |
| `latestTime` | date-time | 上次访问时间 |
| `revisit` | integer | 回流访客 |
| `silent` | integer | 沉默访客 |
| `churn` | integer | 流失访客 |
| `title` | string | 标题 |
| `uriPath` | string | 路径 |
| `os` | string | 操作系统 |

---

## 一、趋势分析 (Flow)

### POST /flow/getFlow — 获取流量概览及同环比数据

**请求体**:
```json
{
  "timeType": "day",
  "channel": [],
  "startTime": "2024-01-01T00:00:00Z",
  "endTime": "2024-01-31T23:59:59Z",
  "projectName": "your_project_code"
}
```

**响应**:
```json
{
  "code": 200, "msg": "操作成功",
  "data": {
    "current": { "statTime": "2024-01-01 - 2024-01-31", "pv": 0, "visitCount": 0, "uv": 0, "ipCount": 0, "avgPv": 0, "avgVisitTime": 0, "bounceRate": 0, "channel": null },
    "currentPrediction": null,
    "previous": { "...": "FlowSummary（上一周期环比）" },
    "samePeriod": { "...": "FlowSummary（同比）" }
  }
}
```

> **提示**：`getFlow` 是获取区间汇总的最佳接口，返回当前区间、上一周期、同比三个汇总。`getFlowTotal` 在某些参数下可能返回 500 错误，建议优先使用 `getFlow`。

---

### POST /flow/getFlowTrend — 获取流量趋势统计数据

**timeType 与分组粒度关系**（重要）：
| timeType | 分组粒度 | statTime 格式 | 适用场景 |
|----------|---------|--------------|---------|
| `"hour"` | 按分钟 | "HH:mm" | 查看单小时内的分钟级趋势 |
| `"day"` | 按小时 | "00"~"23" | 查看单日 24 小时趋势 |
| `"week"` | 按天 | "YYYY-MM-DD" | 查看多日趋势（推荐用于周/月范围） |
| `"month"` | 按天 | "YYYY-MM-DD" | 查看多日趋势 |

**请求体**:
```json
{
  "timeType": "week",
  "channel": [],
  "country": [],
  "province": [],
  "visitorType": "全部",
  "startTime": "2024-01-01T00:00:00Z",
  "endTime": "2024-01-31T23:59:59Z",
  "projectName": "your_project_code"
}
```

**响应**: `data: [FlowDetail]`（数组，每个元素代表一个时间分组）

---

### POST /flow/getFlowTotal — 获取流量合计数据

**请求体**:
```json
{
  "sortName": "pv",
  "sortOrder": "desc",
  "timeType": "day",
  "channel": [],
  "country": [],
  "province": [],
  "visitorType": "全部",
  "startTime": "2024-01-01T00:00:00Z",
  "endTime": "2024-01-31T23:59:59Z",
  "projectName": "your_project_code"
}
```

**响应**: `data: FlowDetail`（单个对象）

---

### POST /flow/getFlowDetail — 获取流量统计数据

**请求体**: 同 getFlowTotal，额外可选 `previousHour`(integer)

**响应**: `data: [FlowDetail]`

---

### POST /flow/getFlowDetailByCompare — 获取流量统计对比数据

**请求体**: 在基础参数上增加 `compareStartTime`、`compareEndTime`

```json
{
  "channel": [], "country": [], "province": [],
  "visitorType": "全部",
  "startTime": "2024-01-01T00:00:00Z",
  "endTime": "2024-01-31T23:59:59Z",
  "projectName": "your_project_code",
  "compareStartTime": "2023-01-01T00:00:00Z",
  "compareEndTime": "2023-01-31T23:59:59Z"
}
```

**响应**: `data: [{ statTime: "", detail: [FlowDetail] }]`

---

### POST /flow/getFlowTrendDetail — [已弃用] 获取流量趋势详情

---

## 二、访客分析 (Visitor)

> 注意：社区版使用 `/visitor/` 路径前缀（非 `/user/`）。

### POST /visitor/getVisitor — 获取新老访客访问统计数据（概览）

**请求体**:
```json
{
  "timeType": "day",
  "channel": [],
  "startTime": "2024-01-01T00:00:00Z",
  "endTime": "2024-01-31T23:59:59Z",
  "projectName": "your_project_code"
}
```

**响应**:
```json
{
  "code": 0, "msg": "success",
  "data": {
    "newVisitor": { "statTime": "", "pv": 0, "visitCount": 0, "uv": 0, "ipCount": 0, "avgPv": 0, "avgVisitTime": 0, "bounceRate": 0, "channel": "" },
    "oldVisitor": { "...": "FlowSummary" }
  }
}
```

---

### POST /visitor/getVisitorTotal — 获取访客类型合计数据

**请求体**:
```json
{
  "channel": [], "country": [], "province": [],
  "visitorType": "全部",
  "startTime": "2024-01-01T00:00:00Z",
  "endTime": "2024-01-31T23:59:59Z",
  "projectName": "your_project_code"
}
```

**响应**: `data: { uv, newUv, visitRate, revisit, silent, churn }`

---

### POST /visitor/getVisitorDetail — 获取新老访客访问统计数据（详情）

**请求体**: 同 getVisitorTotal

**响应**: `data: [FlowDetail（含 visitorType 字段）]`

---

### POST /visitor/getVisitorDetailinfo — 获取访客基本信息

**请求体**:
```json
{
  "projectName": "your_project_code",
  "distinctId": "8609475f862bd2cc"
}
```

**响应**:
```json
{
  "code": 0, "msg": "success",
  "data": {
    "distinctId": "访客ID",
    "country": "", "city": "", "clientIp": "",
    "channel": "", "visitorType": "", "manufacturer": "",
    "pv": 0, "visitCount": 0, "visitTime": 0,
    "avgVisitTime": 0, "avgPv": 0,
    "latestTime": "2024-01-01T12:00:00Z",
    "firstTime": "2023-01-01T00:00:00Z",
    "visitorAreaList": [{ "country": "", "city": "", "province": "" }]
  }
}
```

---

### POST /visitor/getVisitorList — 分页获取访客列表

**请求体**:
```json
{
  "sortName": "pv", "sortOrder": "desc",
  "pageNum": 1, "pageSize": 50,
  "channel": [], "country": [], "province": [],
  "visitorType": "全部",
  "startTime": "...", "endTime": "...",
  "projectName": "...",
  "distinctId": "8609475f862bd2cc"
}
```

**响应**: `data: { total, rows: [{ distinctId, latestTime, avgPv, visitTime, pv, visitorType, visitCount }] }`

---

### POST /visitor/getVisitorChannel — 获取访客按渠道统计数据

**请求体**: 同 getVisitorTotal

**响应**: `data: [{ channel, visitorChannel: { pv, uv, visitCount, ipCount, avgVisitTime, bounceRate, avgPv } }]`

---

### POST /visitor/getVisitorSessionList — 分页获取访客访问明细

**请求体**:
```json
{
  "pageNum": 1, "pageSize": 50,
  "projectName": "...",
  "distinctId": "8609475f862bd2cc"
}
```

**响应**: `data: { total, rows: [{ distinctId, firstTime, visitTime, eventSessionId, pv, sourcesite, searchword, rows: [{ clientIp, province, pv }] }] }`

---

### POST /visitor/getVisitorSessionUriList — 分页获取访客单次访问的页面明细

**请求体**:
```json
{
  "pageNum": 1, "pageSize": 50,
  "projectName": "...",
  "distinctId": "8609475f862bd2cc",
  "eventSessionId": "98816BD0-9E22-43DF-88CA-C29EFD910474"
}
```

**响应**: `data: { total, rows: [{ distinctId, uri, eventSessionId, logTime, title }] }`

---

### POST /visitor/getLogAnalysisList — 获取访问日志

**请求体**:
```json
{
  "pageNum": 1, "pageSize": 50,
  "channel": [], "country": [], "province": [],
  "visitorType": "全部",
  "projectName": "..."
}
```

**响应**: 包含 60+ 字段的原始日志数据，主要包括 `distinctId`、`eventSessionId`、`uri`、`logTime`、`title`、`clientIp`、`country`/`province`/`city`、`os`/`osVersion`、`browser`/`browserVersion`、`appVersion`、`deviceId`、`networkType`、`userAgent`、`referrer`、`latestSearchKeyword`、UTM 参数等。

---

## 三、受访页面分析 (VisitUri)

### POST /visituri/getVisitUri — 获取 Top10 受访页面

**请求体**:
```json
{
  "timeType": "day",
  "channel": [],
  "startTime": "...", "endTime": "...",
  "projectName": "..."
}
```

**响应**: `data: [{ uri, title, pv, percent, channel }]`

---

### POST /visituri/getVisitUriTotal — 获取受访页面访问合计数据

**请求体**: 含 channel / country / province / visitorType / startTime / endTime / projectName

**响应**: `data: { pv, uv, downPvCount, exitCount, avgVisitTime, bounceRate }`

---

### POST /visituri/getVisitUriPathTreeTotal — 获取受访页面树形统计数据

**请求体**: 同 getVisitUriTotal

**响应**: `data: [{ uri, host, path, segment, leafUri: [...递归], detail: { pv, uv, ipCount, exitCount, exitRate, entryCount, visitTime, avgVisitTime, downPvCount } }]`

---

### POST /visituri/getVisitUriListOfUriPath — 获取资源路径的 Top10 页面统计

**请求体**: 同 getVisitUriTotal + `uriPath: "/path/to/resource"`

**响应**: `data: [{ uri, pv, uv, ipCount, exitCount, exitRate, entryCount, avgVisitTime, downPvCount, title, uriPath }]`

---

### POST /visituri/getVisitUriDetailList — 分页获取受访页面访问统计

**请求体**: 分页 + 过滤参数，额外字段：
- `uriPath` (string) — 路径
- `needFuzzySearchUriPath` (boolean) — 是否模糊搜索路径

**响应**: `data: { total, rows: [{ uri, pv, uv, ipCount, exitCount, exitRate, entryCount, avgVisitTime, downPvCount, title, uriPath }] }`

---

## 四、忠诚度分析 (UserVisit)

所有接口请求体相同：

```json
{
  "timeType": "day",
  "channel": [], "country": [], "province": [],
  "visitorType": "全部",
  "startTime": "...", "endTime": "...",
  "projectName": "..."
}
```

响应均为 `data: [{ key: "区间 key", value: 访客数, rate: 占比 }]`

| 接口路径 | 说明 |
|---------|------|
| `/uservisit/getUserVisit` | 各访问次数区间内的访客数 |
| `/uservisit/getUserVisitTime` | 各访问时长区间内的访客数 |
| `/uservisit/getUserPv` | 各访问页数区间内的访客数 |
| `/uservisit/getUserLatestTime` | 上次访问时间区间内的访客数 |

---

## 五、地域分析 (Area)

### POST /area/getArea — 获取地域访问统计数据

**请求体**: 含 timeType / channel / startTime / endTime / projectName / visitorType

**响应**:
```json
{
  "code": 0, "msg": "success",
  "data": [{
    "country": "", "province": "",
    "pv": 0, "visitCount": 0, "uv": 0, "channel": "",
    "pvRate": 0, "visitCountRate": 0, "uvRate": 0
  }]
}
```

---

### POST /area/getAreaDetailTotal — 获取地域访问合计数据

**请求体**: 含筛选参数

**响应**: `data: FlowDetail`（单个对象）

---

### POST /area/getAreaDetailList — 分页获取按省访问统计数据

**请求体**: 含分页 + 排序 + 筛选参数

**响应**: `data: { total, rows: [AreaDetail（含 country/province/city/pv/pvRate/visitCount/newUv/uv/ipCount/avgPv/avgVisitTime/bounceRate/newUvRate）] }`

---

### POST /area/getAreaDetailProvinceListByCompare — 分页获取按省份访问统计对比数据

**请求体**: 含 compareStartTime / compareEndTime 对比时间

**响应**: `data: { total, rows: [{ country, province, rows: AreaDetail[] }] }`

---

### POST /area/getAreaDetailCountryList — 分页获取按国家访问统计数据

**请求体**: 含分页 + 筛选参数

**响应**: `data: { total, rows: [AreaDetail] }`

---

### POST /area/getAreaDetailCountryListByCompare — 分页获取按国家访问统计对比数据

**请求体**: 含对比时间参数

**响应**: 含对比数据

---

### POST /area/getAreaDetailCityList — 获取按省过滤城市统计数据

**请求体**: 含 `province` (string) 用于过滤

**响应**: `data: [AreaDetail]`

---

## 六、来源网站分析 (SourceWebsite)

### POST /sourcewebsite/getSourceWebSiteTop10 — 获取 Top10 来源网站

**请求体**: 含 channel / country / province / visitorType / startTime / endTime / projectName

**响应**: `data: [FlowDetail（含 sourcesite 字段）]`

---

### POST /sourcewebsite/getSourceWebSiteTotal — 获取来源网站访问合计数据

**请求体**: 同 getSourceWebSiteTop10

**响应**: `data: FlowDetail`（单个对象）

---

### POST /sourcewebsite/getSourceWebSiteDetail — 分页获取来源网站访问统计数据

**请求体**: 含分页参数 + 筛选参数

**响应**: `data: { total, summary: FlowDetail, rows: [FlowDetail] }`

---

## 七、搜索词分析 (SearchWord)

### POST /searchword/getSearchWordTop10 — 获取 Top10 搜索词

**请求体**: 含 timeType / channel / startTime / endTime / projectName

**响应**: `data: [{ word, pv, percent, channel }]`

---

### POST /searchword/getSearchWordDetail — 获取搜索词访问统计数据（分页）

**请求体**: 含分页参数 + 筛选参数

**响应**: `data: { total, rows: [FlowDetail（含 searchword 字段）] }`

---

## 八、渠道分析 (Channel)

### POST /channel/getChannelList — 获取项目渠道列表

**请求体**:
```json
{ "projectName": "your_project_code" }
```

**响应**: `data: [{ name, displayName, ordernum }]`

| 字段 | 说明 |
|------|------|
| `name` | 渠道内部编码 |
| `displayName` | 渠道中文显示名（分析接口 `channel` 参数需使用此值） |
| `ordernum` | 排序号 |

---

### POST /channel/getChannelDetail — 获取渠道访问统计数据

**请求体**:
```json
{
  "timeType": "day",
  "country": [], "province": [],
  "visitorType": "全部",
  "startTime": "...", "endTime": "...",
  "projectName": "..."
}
```

注意：此接口**无 `channel` 字段**，返回所有渠道的统计数据。

**响应**: `data: [FlowDetail]`

---

## 九、设备分析 (Device)

### POST /device/getDeviceDetailList — 分页获取设备访问统计数据

**请求体**: 含分页 + 排序 + channel / country / province / visitorType / startTime / endTime / projectName

**响应**: `data: { total, rows: [FlowDetail（含 device / manufacturer 等字段）] }`

---

## 十、操作系统分析 (OS)

### POST /os/getOsDetail — 获取操作系统统计数据

**请求体**: 含 sortName / sortOrder + channel / country / province / visitorType / startTime / endTime / projectName

**响应**: `data: [FlowDetail（含 os 字段）]`

---

## 十一、App 崩溃分析 (AppCrashed)

### POST /appCrashed/totalSummary — 获取崩溃概览数据

**请求体**:
```json
{
  "timeType": "day",
  "channel": [],
  "startTime": "...", "endTime": "...",
  "projectName": "..."
}
```

**响应**: `data: [{ appVersion, model, modelCount, visitCount, crashedCount, uv, crashedUv, channel, statTime, pvRate, uvRate }]`

---

### POST /appCrashed/trendSummary — 获取崩溃趋势数据

**请求体**: 同上 + 可选 `version`（app 版本）、`model`（设备型号）

**响应**: 同 totalSummary

---

### POST /appCrashed/groupedSummary — 获取崩溃按渠道版本分组数据

**请求体**: 同 trendSummary

**响应**: 同 totalSummary

---

### POST /appCrashed/getPagedSummary — 分页获取崩溃设备分组数据

**请求体**: 含分页参数 + timeType / channel / startTime / endTime / projectName / version / model

**响应**: `data: { total, rows: [...] }`

---

### POST /appCrashed/getPage — 分页获取崩溃记录

**请求体**: 含分页参数 + 筛选参数

**响应**: `data: { total, rows: [...] }`

---

## 十二、下载统计结果 (Download)

所有下载接口返回文件流（文件下载），请求体为 `DownloadRequest`：

**DownloadRequest 字段**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `timeType` | string | ✅ | 时间类型 |
| `channel` | array[string] | ✅ | 渠道 |
| `country` | array[string] | ✅ | 国家或地区 |
| `province` | array[string] | ✅ | 地域 |
| `visitorType` | string | ✅ | 访客类型 |
| `startTime` | string(date-time) | ✅ | 开始时间 |
| `endTime` | string(date-time) | ✅ | 结束时间 |
| `projectName` | string | ✅ | 项目编码 |
| `cols` | array[string] | ✅ | 下载列（如 `pv`、`uv`、`visitCount` 等） |

| 接口路径 | 说明 |
|---------|------|
| `/download/exportFlowTrendDetail` | 下载流量趋势分析 |
| `/download/exportVisitorDetail` | 下载新老访客分析 |
| `/download/exportVisitor` | 下载用户忠诚度分析 |
| `/download/exportVisitorList` | 下载用户行为分析 |
| `/download/exportVisitUriDetail` | 下载受访页面分析 |
| `/download/exportSourceWebsiteDetail` | 下载来源网站分析 |
| `/download/exportSearchWordDetail` | 下载搜索词分析 |
| `/download/exportDeviceDetail` | 下载设备分析 |
| `/download/exportChannelDetail` | 下载渠道分析 |
| `/download/exportAreaDetail` | 下载地域分析 |

---

## 十三、项目管理 (Project) — 管理 API

> **重要**：项目管理接口属于管理 API，基础 URL 与分析 API 不同。
> - 管理 API 基础 URL：`https://demo.clklog.com/manage`（默认值）
> - 认证方式：与分析 API 相同，使用 `X-API-Key` 请求头
> - 响应 code 为整数 `200`（注意与分析 API 的 `0` 不同）

### POST /project/getlist — 获取项目列表

**请求体** (`QueryProjectRequest`):

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `pageNum` | integer(int32) | ✅ | 页码（从 1 开始） |
| `pageSize` | integer(int32) | ✅ | 每页条数 |
| `startDate` | string(date-time) | ❌ | 统计开始日期 |
| `endDate` | string(date-time) | ❌ | 统计结束日期 |

**请求示例**:
```json
{
  "pageNum": 1,
  "pageSize": 100,
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z"
}
```

**响应** (`QueryProjectResponse`):

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "total": 100,
    "rows": [
      {
        "id": "eb029af8-0e24-47d4-b992-3b5284ce4fc8",
        "projectName": "clklog",
        "projectDisplayName": "clklog",
        "token": "xxx",
        "createTime": "2024-01-01T00:00:00Z",
        "updateTime": "2024-06-01T00:00:00Z",
        "stat": {
          "projectName": "clklog",
          "logRecordCount": 10000,
          "logSpaceSize": 204800,
          "logDays": 30,
          "logLatestTime": "2024-06-01T12:00:00Z",
          "dbFirstTime": "2024-01-01T00:00:00Z",
          "dbLatestTime": "2024-06-01T12:00:00Z",
          "dbRecordCount": 5000,
          "dbSpaceSize": 102400
        }
      }
    ]
  }
}
```

**ProjectSlim 字段说明**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | ✅ | 项目唯一 ID（UUID） |
| `projectName` | string | ✅ | 项目编码（用于 API 请求中 projectName 字段） |
| `projectDisplayName` | string | ✅ | 项目名称（用于向用户展示） |
| `token` | string | ❌ | 项目 Token |
| `updateTime` | string(date-time) | ❌ | 更新时间 |
| `createTime` | string(date-time) | ❌ | 创建时间 |
| `stat` | object | ❌ | 项目统计信息（含 logRecordCount / logSpaceSize / logDays 等） |

**关键说明**：
- 响应为分页结构（`data.total` + `data.rows`），需要遍历 `rows` 获取项目信息
- 优先指定较大 `pageSize`（如 100）一次性获取所有项目
- `projectName` 用作 API 请求的 `projectName` 参数，`projectDisplayName` 用于向用户展示
