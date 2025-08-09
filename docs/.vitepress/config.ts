import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'outils',
  description: '个人常用工具函数库',
  base: '/',
  lang: 'zh-CN',

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '安装', link: '/guide/installation' },
            { text: '快速开始', link: '/guide/getting-started' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '概览', link: '/api/' },
            { text: '发布订阅', link: '/api/event-emitter' },
            { text: '防抖节流', link: '/api/debounce-throttle' },
            { text: '函数式编程', link: '/api/functional' },
            { text: '并发控制', link: '/api/concurrency' },
            { text: '类型工具', link: '/api/type' },
            { text: '环境工具', link: '/api/env' },
            { text: '随机工具', link: '/api/random' },
            { text: 'HTTP 工具', link: '/api/http' },
            { text: '日期工具', link: '/api/dayjs' },
            { text: '样式工具', link: '/api/class-names' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/suqingyao/outils' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 suqingyao',
    },

    search: {
      provider: 'local',
    },
  },

  markdown: {
    theme: {
      light: 'vitesse-light',
      dark: 'vitesse-dark',
    },
  },
});
