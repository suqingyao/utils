/**
 * outils - 个人常用工具函数库
 *
 * 无关业务和框架的通用工具函数集合
 * 基于 TypeScript 实现，提供完整的类型支持
 */

// 发布订阅
export { EventEmitter, createEventEmitter } from './event-emitter';

// 防抖节流
export { debounce } from './debounce';
export { throttle } from './throttle';

// 函数式编程
export { curry, partial, curryWithPlaceholder } from './curry';
export {
  compose,
  pipe,
  composeAsync,
  pipeAsync,
  when,
  branch,
} from './compose';

// 并发控制
export {
  ConcurrencyController,
  concurrency,
  concurrentMap,
  batchExecute,
  retry,
  withTimeout,
} from './concurrency';

// HTTP 工具
export {
  http,
  createHttpClient,
  type RequestConfig,
  type HttpResponse,
  type RequestInterceptor,
  type ResponseInterceptor,
  type ErrorInterceptor,
} from './http';

// 时间工具 - dayjs
export * from './dayjs';

// 类型工具
export * from './type';

// 环境工具
export * from './env';

// 随机工具
export * from './random';

// 类名工具
export * from './class-names';

// 存储工具
export * from './storage';

// 正则工具
export * from './reg';

// URL 工具
export * from './url';

// RAF 工具
export * from './raf';
