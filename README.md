# clklog-api-skill

ClkLog API Skill，支持导入 WorkBuddy、Codex 等 AI 开发平台。通过自然对话即可调用 ClkLog 数据分析能力，快速获取多维度的用户行为与业务指标分析结果。

# 使用说明

## 1.下载Skill

在当前仓库下载skill的zip包。

## 2.导入 AI 工具

直接上传 .zip 技能文件到 WorkBuddy 或 CodeX。

### 2.1 导入 WorkBuddy

打开 WorkBuddy 桌面端的 Skills 管理菜单。点击 【导入】 技能。选择 【本地上传】，并选中下载好的 .zip 文件。补充技能名称、描述及触发关键词，点击确认即可加载该技能。

### 2.2 导入 CodeX

解压下载的 skills，将完整的进文件夹（包含 SKILL.md 及相关脚本的文件夹）复制到 Codex 的默认技能目录中（路径地址：~/.codex/skills/）,复制完成后完全关闭并重启 Codex 应用即可开始使用该技能。

## 3.开始使用 Skill

**以下操作步骤截图以 WorkBuddy 为例**

### 3.1 引用技能

引用技能：
<img src="https://clklog.com/assets/imgs/skill/1.png" alt="">

### 3.2 输入要分析的内容

并输入要分析的内容，如：分析前两周的网站访问流量、近六个月的网站留存率等，输入完成后点击发送按钮：

<img src="https://clklog.com/assets/imgs/skill/2.png" alt="">

### 3.3 输入配置信息

#### 3.3.1 获取 API 密钥

登录您私有化部署的 ClkLog 社区版环境，进入【密钥管理】菜单获取并复制 API 密钥：

<img src="https://clklog.com/assets/imgs/skill/3.png" alt="">

#### 3.3.2 输入 AIP 密钥

返回 WorkBuddy 输入 AIP 密钥：

<img src="https://clklog.com/assets/imgs/skill/4.png" alt="">

#### 3.3.4 输入分析 API 接口地址

- 替换为您私有化部署的 ClkLog 社区版分析 API 地址，接口地址示例：<https://demo.clklog.com/api>

<img src="https://clklog.com/assets/imgs/skill/5.png" alt="">

#### 3.3.4 输入管理 API 接口地址

- 替换为您私有化部署的 ClkLog 社区版管理 API 地址，接口地址示例：<https://demo.clklog.com/manage>

<img src="https://clklog.com/assets/imgs/skill/6.png" alt="">

### 3.4 等待返回结果

<img src="https://clklog.com/assets/imgs/skill/7.png" alt="">
