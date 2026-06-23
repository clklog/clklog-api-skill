#!/usr/bin/env node
/**
 * ClkLog 社区版 - Post-Install Setup Check Script
 *
 * 此脚本用于在技能导入后检查配置状态，辅助 WorkBuddy 代理判断是否需要启动配置流程。
 *
 * 用法:
 *   node scripts/setup.js                  # 人类可读输出
 *   node scripts/setup.js --status         # 机器可读输出 (CONFIG_OK | CONFIG_MISSING | CONFIG_INCOMPLETE)
 *
 * 退出码: 0 = 配置已存在, 1 = 配置缺失或不完整
 */

const fs = require('fs');
const path = require('path');

/**
 * 查找当前项目的 MEMORY.md 文件
 */
function findMemoryFile() {
  const candidates = [
    path.join(process.cwd(), '.workbuddy', 'memory', 'MEMORY.md'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/**
 * 检查 ClkLog 社区版 API 配置状态
 * @returns {{ status: string, message: string, config?: object }}
 */
function checkConfig() {
  const memoryFile = findMemoryFile();

  if (!memoryFile) {
    return {
      status: 'CONFIG_MISSING',
      message: '未找到 MEMORY.md 文件，ClkLog 社区版 API 尚未配置',
    };
  }

  const content = fs.readFileSync(memoryFile, 'utf-8');
  const sectionMatch = content.match(/## ClkLog 社区版 API 配置\n([\s\S]*?)(?=\n## |\n*$)/);

  if (!sectionMatch) {
    return {
      status: 'CONFIG_MISSING',
      message: 'MEMORY.md 中未找到 ClkLog 社区版配置段落，需要配置',
    };
  }

  const sectionText = sectionMatch[1];
  const apiKey = sectionText.match(/api_key:\s*(.+)/)?.[1]?.trim();
  const analyticsUrl = sectionText.match(/analytics_base_url:\s*(.+)/)?.[1]?.trim();
  const manageUrl = sectionText.match(/manage_base_url:\s*(.+)/)?.[1]?.trim();
  const defaultProject = sectionText.match(/default_project:\s*(.+)/)?.[1]?.trim();
  const projects = sectionText.match(/projects:\s*(.+)/)?.[1]?.trim();

  if (apiKey && analyticsUrl && manageUrl) {
    return {
      status: 'CONFIG_OK',
      message: 'ClkLog 社区版 API 配置已就绪',
      config: { apiKey, analyticsUrl, manageUrl, defaultProject, projects },
    };
  }

  return {
    status: 'CONFIG_INCOMPLETE',
    message: 'ClkLog 社区版 API 配置不完整，缺少 api_key / analytics_base_url / manage_base_url 中的部分字段',
  };
}

// ---- Main ----
const args = process.argv.slice(2);
const result = checkConfig();

if (args.includes('--status')) {
  // 机器可读输出 — 供代理脚本解析
  console.log(result.status);
} else {
  // 人类可读输出
  console.log('\n=== ClkLog 社区版 API 配置检查 ===');
  console.log(`状态: ${result.status}`);
  console.log(`说明: ${result.message}`);

  if (result.status === 'CONFIG_OK' && result.config) {
    const maskedKey = result.config.apiKey.length > 10
      ? result.config.apiKey.substring(0, 10) + '...'
      : result.config.apiKey;
    console.log(`\n  API Key:     ${maskedKey}`);
    console.log(`  分析 API:    ${result.config.analyticsUrl}`);
    console.log(`  管理 API:    ${result.config.manageUrl}`);
    console.log(`  默认项目:    ${result.config.defaultProject || '未设置'}`);
    console.log(`  项目列表:    ${result.config.projects || '未设置'}`);
  } else {
    console.log('\n  需要配置 API Key 和 API 地址才能使用此技能。');
    console.log('  请在对话中提到 "ClkLog" 相关内容来触发配置流程。');
  }
  console.log();
}

process.exit(result.status === 'CONFIG_OK' ? 0 : 1);
