import { isBrowser } from './env';

// 使用三斜线指令引入 DOM 类型
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

export function scrollToTop() {
  if (!isBrowser) {
    return;
  }
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

export function scrollToBottom() {
  if (!isBrowser) {
    return;
  }
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: 'smooth',
  });
}

export function scrollToElement(element: HTMLElement) {
  if (!isBrowser) {
    return;
  }
  element.scrollIntoView({
    behavior: 'smooth',
  });
}

export function scrollToElementTop(element: HTMLElement) {
  if (!isBrowser) {
    return;
  }
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}
