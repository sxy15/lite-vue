/**
 * 打包开发环境
 * 
 * node scripts/dev.js --format cjs
 */

import esbuild from 'esbuild'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { createRequire } from 'node:module'

/**
 * 解析命令行参数
 */
const { values: { format }, positionals } = parseArgs({
    allowPositionals: true,
    options: {
        format: {
            type: 'string',
            short: 'f',
            default: 'esm'
        }
    }
})

// __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const require = createRequire(import.meta.url)

const target = positionals[0] || 'vue'

const entry = resolve(__dirname, `../packages/${target}/src/index.ts`)

const outfile = resolve(__dirname, `../packages/${target}/dist/${target}.${format}.js`)

const pkg = require(`../packages/${target}/package.json`)

esbuild.context({
    entryPoints: [entry], // 入口文件
    outfile: outfile, // 输出文件
    format, // 打包格式 cjs esm iife
    platform: format === 'cjs' ? 'node' : 'browser', // 打包平台
    sourcemap: true, // 开启sourcemap
    bundle: true, // 把所有依赖打包到一个文件中
    globalName: pkg.buildOptions?.name
}).then((ctx) => {
    ctx.watch()
})