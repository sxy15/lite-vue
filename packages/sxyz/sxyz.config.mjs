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

  }
}