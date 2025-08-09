# outils

## 介绍
- 个人常用工具函数 无关业务和框架
- 基于 typescript 实现
- 包含测试用例
- 包含文档

## 技术选型
所有技术选型都基于最新版本
- 语言
  - typescript
- 包管理工具
  - pnpm 最新版本
- 打包工具
  - tsdown 打包为 esm 和 cjs 格式
- 测试工具
  - vitest
- 文档网站
  - vitepress
  - 包含 api 文档
  - 包含 快速开始
  - 包含 主要功能
  - api文档 包含 每个函数的使用示例 可以在线测试查看
- 代码规范
  - eslint
- 代码格式化
  - prettier
- simple-git-hooks
  - 包含 pre-commit 钩子
    - 包含 lint 钩子
    - 包含 format 钩子
    - 包含 test 钩子
  - 包含 commit-msg 钩子
  - 包含 pre-push 钩子
- 提交规范
  - 基于 commitizen 实现
  - 基于 commitlint 实现
    - 包含 angular 规范
    - 包含 conventional 规范

## function
- 发布订阅
- 并发控制
- 柯理化
- 节流
- 防抖
- 组合
- http 工具 1
  以fetch 为基础
  - 包含错误重试
  - 包含超时设置
  - 包含请求拦截器
  - 包含响应拦截器
  - 包含取消请求
  - 包含缓存
- 时间工具1 以date-fns 为基础
- 时间工具2 以dayjs 为基础
- 类型工具
  - 包含类型判断
  - 包含类型转换
  - 包含类型校验
- 环境工具
  - 判断是server 端
  - 判断是client 端
  - 判断是浏览器环境
  - 判断是node 环境
- 随机数工具
  - 包含随机数
  - 包含随机字符串
  - 包含随机颜色
  - 包含随机日期
  - 包含随机时间
  - 包含随机ip
  - 包含随机mac地址
  - 包含随机uuid
  - 包含随机手机号
  - 包含随机身份证号
  - 包含随机地址
  - 包含随机经纬度
- 合并class 名
  - 以clsx 和 tailwind-merge 为基础