/**
 * outils - 个人常用工具函数库
 *
 * 无关业务和框架的通用工具函数集合
 * 基于 TypeScript 实现，提供完整的类型支持
 */

// 类名工具
export * from './class-names';

export {
  branch,
  compose,
  composeAsync,
  pipe,
  pipeAsync,
  when,
} from './compose';
// 并发控制
export {
  batchExecute,
  concurrency,
  ConcurrencyController,
  concurrentMap,
  retry,
  withTimeout,
} from './concurrency';

// 函数式编程
export { curry, curryWithPlaceholder, partial } from './curry';
// 时间工具 - dayjs
export * from './dayjs';

// 防抖节流
export { debounce } from './debounce';

// 环境工具
export * from './env';

// 发布订阅
export { createEventEmitter, EventEmitter } from './event-emitter';

// HTTP 工具
export {
  createHttpClient,
  type ErrorInterceptor,
  http,
  type HttpResponse,
  type RequestConfig,
  type RequestInterceptor,
  type ResponseInterceptor,
} from './http';

// RAF 工具
export * from './raf';

// 随机工具
export * from './random';

// 正则工具
export * from './reg';

// 存储工具
export * from './storage';

export { throttle } from './throttle';

// 类型工具
export * from './type';

// URL 工具
export * from './url';
