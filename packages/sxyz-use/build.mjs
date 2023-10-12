import * as build from 'esbuild'

async function bundle(format) {
  const ext = format === 'esm' ? '.mjs' : '.js'
  const outFile = `dist/index.${format}${ext}`
  const finish = () => console.log(`Build finished: ${outFile}`)

  const options = {
    bundle: true,
    format,
    target: ['chrome53'],
    outfile: outFile,
    charset: 'utf8',
    external: ['vue'],
    entryPoints: ['./src/index.ts'],
  }

  if(process.argv.includes('-w')) {

  } else {
    await build.build(options)
    finish()
  }
}

bundle('esm')
bundle('cjs')