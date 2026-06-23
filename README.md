# clklog-api-skill

ClkLog API Skill，支持导入 WorkBuddy、Codex 等 AI 开发平台。
通过自然对话即可调用 ClkLog 数据分析能力，快速获取多维度的用户行为与业务指标分析结果。

# 使用说明

## 1.下载Skill

在当前仓库下载skill的zip包。

## 2.导入 AI 工具

直接上传 .zip 技能文件到 WorkBuddy 或 CodeX。

### 2.1 导入 WorkBuddy

打开 WorkBuddy 桌面端的 Skills 管理菜单。点击 【导入】 技能。选择 【本地上传】，并选中下载好的 .zip 文件。补充技能名称、描述及触发关键词，点击确认即可加载该技能。

### 2.2 导入 CodeX

解压下载的 skills，将完整的进文件夹（包含 SKILL.md 及相关脚本的文件夹）复制到 Codex 的默认技能目录中（路径地址：~/.codex/skills/），复制完成后完全关闭并重启 Codex 应用即可开始使用该技能。

## 3.开始使用 Skill

**以下操作步骤截图以 WorkBuddy 为例。**

### 3.1 引用技能并启动配置

引用技能，并输入提示词“配置 ClkLog”:
<img src="https://clklog.com/assets/imgs/skill/01.png" alt="">

### 3.2 配置 ClkLog API 信息

以下配置仅在第一次使用技能时需要配置。
根据提示词输入 ClkLog 的 API Key、分析 API 地址和管理 API 地址：
<img src="https://clklog.com/assets/imgs/skill/02.png" alt="">

### 3.3 设置默认项目

<img src="https://clklog.com/assets/imgs/skill/03.png" alt="">

### 3.4 发送数据分析请求

并输入要分析的内容，如：分析前两周的网站访问流量、近六个月的网站留存率等，输入完成后点击发送按钮：
<img src="https://clklog.com/assets/imgs/skill/05.png" alt="">
等待返回结果：
<img src="https://clklog.com/assets/imgs/skill/06.png" alt="">
