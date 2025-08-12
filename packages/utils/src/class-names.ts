/**
 * 样式类名合并工具
 * @description 基于clsx和tailwind-merge实现的类名合并工具
 */

import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并类名，支持条件类名和Tailwind CSS类名去重
 * @param classes 类名输入
 * @returns 合并后的类名字符串
 */
export function cn(...classes: ClassValue[]): string {
  return twMerge(clsx(classes));
}

/**
 * 创建类名变体工具
 * @param baseClass 基础类名
 * @param variants 变体配置
 * @returns 变体函数
 */
export function createVariants<
  T extends Record<string, Record<string, string>>,
>(baseClass: string, variants: T) {
  return function (
    props: {
      [K in keyof T]?: keyof T[K];
    } & {
      className?: string;
    },
  ): string {
    const { className, ...variantProps } = props;

    const variantClasses = Object.entries(variantProps)
      .map(([key, value]) => {
        const variant = variants[key];
        return variant && value ? variant[value as string] : '';
      })
      .filter(Boolean);

    return cn(baseClass, ...variantClasses, className);
  };
}
