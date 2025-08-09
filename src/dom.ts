import { isBrowser } from './env';

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
