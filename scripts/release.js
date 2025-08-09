#!/usr/bin/env node

/**
 * 打包发布脚本 (Node.js 版本)
 * 用于自动化构建、测试和发布流程
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createInterface } from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// 颜色定义
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
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
  } catch (error) {
    log.error(`Command failed: ${command}`);
    process.exit(1);
  }
}

/**
 * 获取用户输入
 * @param {string} question - 问题
 * @returns {Promise<string>} 用户输入
 */
function askQuestion(question) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
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
 * 获取当前分支
 * @returns {string} 当前分支名
 */
function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: 'pipe'
    }).trim();
  } catch {
    return 'unknown';
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
 * 更新版本号
 * @param {string} versionType - 版本类型或具体版本号
 * @returns {string} 新版本号
 */
function updateVersion(versionType) {
  const packagePath = path.join(projectRoot, 'package.json');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  
  if (['patch', 'minor', 'major'].includes(versionType)) {
    exec(`npm version ${versionType} --no-git-tag-version`);
  } else {
    // 自定义版本号
    packageJson.version = versionType;
    writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  }
  
  return getCurrentVersion();
}

/**
 * 检查构建产物
 * @returns {boolean} 构建是否成功
 */
function checkBuildOutput() {
  const distPath = path.join(projectRoot, 'dist');
  const requiredFiles = ['index.js', 'index.cjs', 'index.d.ts'];
  
  if (!existsSync(distPath)) {
    log.error('Build failed: dist directory not found');
    return false;
  }
  
  for (const file of requiredFiles) {
    if (!existsSync(path.join(distPath, file))) {
      log.error(`Build failed: ${file} not found in dist directory`);
      return false;
    }
  }
  
  return true;
}

/**
 * 主发布流程
 */
async function release() {
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

    // 检查当前分支
    const currentBranch = getCurrentBranch();
    if (currentBranch !== 'main') {
      log.warning(`Current branch is '${currentBranch}', not 'main'.`);
      const response = await askQuestion('Continue? (y/N): ');
      if (!['y', 'Y', 'yes', 'Yes'].includes(response)) {
        log.info('Release cancelled.');
        process.exit(0);
      }
    }

    // 获取当前版本
    const currentVersion = getCurrentVersion();
    log.info(`Current version: ${currentVersion}`);

    // 询问版本类型
    console.log('Select version bump type:');
    console.log('1) patch (x.x.X)');
    console.log('2) minor (x.X.x)');
    console.log('3) major (X.x.x)');
    console.log('4) custom');
    
    const versionChoice = await askQuestion('Enter choice (1-4): ');
    let versionType;
    
    switch (versionChoice) {
      case '1':
        versionType = 'patch';
        break;
      case '2':
        versionType = 'minor';
        break;
      case '3':
        versionType = 'major';
        break;
      case '4':
        versionType = await askQuestion('Enter custom version: ');
        break;
      default:
        log.error('Invalid choice');
        process.exit(1);
    }

    log.info('Starting release process...');

    // 1. 安装依赖
    log.info('Installing dependencies...');
    exec('pnpm install');

    // 2. 运行 lint 检查
    log.info('Running lint checks...');
    exec('pnpm run lint');

    // 3. 运行测试
    log.info('Running tests...');
    exec('pnpm run test');

    // 4. 构建项目
    log.info('Building project...');
    exec('pnpm run build');

    // 5. 检查构建产物
    if (!checkBuildOutput()) {
      process.exit(1);
    }
    log.success('Build completed successfully');

    // 6. 更新版本号
    log.info('Updating version...');
    const newVersion = updateVersion(versionType);
    log.success(`Version updated to: ${newVersion}`);

    // 7. 提交更改
    log.info('Committing changes...');
    exec('git add .');
    exec(`git commit -m "chore: release v${newVersion}"`);

    // 8. 创建标签
    log.info('Creating git tag...');
    exec(`git tag "v${newVersion}"`);

    // 9. 推送到远程仓库
    log.info('Pushing to remote repository...');
    exec(`git push origin "${currentBranch}"`);
    exec(`git push origin "v${newVersion}"`);

    // 10. 发布到 npm (可选)
    const publishNpm = await askQuestion('Publish to npm? (y/N): ');
    if (['y', 'Y', 'yes', 'Yes'].includes(publishNpm)) {
      log.info('Publishing to npm...');
      exec('npm publish');
      log.success('Published to npm successfully');
    } else {
      log.info('Skipping npm publish');
    }

    log.success(`Release v${newVersion} completed successfully!`);
    log.info('Summary:');
    log.info(`  - Version: ${currentVersion} → ${newVersion}`);
    log.info(`  - Git tag: v${newVersion}`);
    log.info(`  - Branch: ${currentBranch}`);
    log.info(`  - Published to npm: ${['y', 'Y', 'yes', 'Yes'].includes(publishNpm) ? 'Yes' : 'No'}`);

  } catch (error) {
    log.error(`Release failed: ${error.message}`);
    process.exit(1);
  }
}

// 运行发布流程
release();