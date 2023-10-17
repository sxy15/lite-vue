export default {
  name: 'sx',
  build: {
    packageManager: 'pnpm',
    srcDir: 'src',
    namedExport: true,
    skipInstall: [],
    tagPrefix: 'sx-',
    extensions: {
      esm: '.mjs'
    },
    site: {
      publicPath: '/sx/'
    },
    css: {
      removeSourceFile: true
    },
  },
  site: {
    title: 'Sx',
    subtitle: '（适用于 Vue 3）',
    description: '轻量、可定制的移动端组件库',
    nav: [
      {
        title: '开发指南',
        items: [
          {
            path: 'home',
            title: '介绍',
          },
          {
            path: 'quickstart',
            title: '快速上手',
          },
        ],
      },
      {
        title: '基础组件',
        items: [
          {
            path: 'demo-button',
            title: 'DemoButton 按钮',
          },
        ],
      },
    ],
  }
}

