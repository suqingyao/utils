#!/usr/bin/env node

/**
 * 快速发布脚本
 * 用于快速发布补丁版本，跳过一些交互步骤
 */

import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// 颜色定义
const colors = {
  red: '\x1B[31m',
  green: '\x1B[32m',
  yellow: '\x1B[33m',
  blue: '\x1B[34m',
  reset: '\x1B[0m'
};

/**
 * 日志函数
 */
const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`)
};

/**
 * 执行命令
 * @param {string} command - 要执行的命令
 * @param {object} options - 执行选项
 * @returns {string} 命令输出
 */
function exec(command, options = {}) {
  try {
    return execSync(command, {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: 'inherit',
      ...options
    });
  } catch {
    log.error(`Command failed: ${command}`);
    process.exit(1);
  }
}

/**
 * 检查工作目录是否干净
 * @returns {boolean} 是否干净
 */
function isWorkingDirectoryClean() {
  try {
    const status = execSync('git status --porcelain', {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return status.trim() === '';
  } catch {
    return false;
  }
}

/**
 * 获取当前版本
 * @returns {string} 当前版本号
 */
function getCurrentVersion() {
  const packagePath = path.join(projectRoot, 'package.json');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  return packageJson.version;
}

/**
 * 快速发布流程
 */
function quickRelease() {
  try {
    // 检查是否在正确的目录
    if (!existsSync(path.join(projectRoot, 'package.json'))) {
      log.error('package.json not found. Please run this script from the project root.');
      process.exit(1);
    }

    // 检查工作目录是否干净
    if (!isWorkingDirectoryClean()) {
      log.error('Working directory is not clean. Please commit or stash your changes.');
      process.exit(1);
    }

    const currentVersion = getCurrentVersion();
    log.info(`Current version: ${currentVersion}`);
    log.info('Starting quick release (patch version)...');

    // 1. 运行测试
    log.info('Running tests...');
    exec('pnpm run test:ci');

    // 2. 构建项目
    log.info('Building project...');
    exec('pnpm run build');

    // 3. 更新补丁版本
    log.info('Updating patch version...');
    exec('npm version patch --no-git-tag-version');

    const newVersion = getCurrentVersion();
    log.success(`Version updated to: ${newVersion}`);

    // 4. 提交更改
    log.info('Committing changes...');
    exec('git add .');
    exec(`git commit -m "chore: release v${newVersion}"`);

    // 5. 创建标签
    log.info('Creating git tag...');
    exec(`git tag "v${newVersion}"`);

    // 6. 推送到远程仓库
    log.info('Pushing to remote repository...');
    exec('git push origin main');
    exec(`git push origin "v${newVersion}"`);

    log.success(`Quick release v${newVersion} completed successfully!`);
    log.info('To publish to npm, run: npm publish');

  } catch (error) {
    log.error(`Quick release failed: ${error.message}`);
    process.exit(1);
  }
}

// 运行快速发布流程
quickRelease();