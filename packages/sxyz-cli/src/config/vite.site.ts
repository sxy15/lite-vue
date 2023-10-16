import type { InlineConfig, PluginOption } from 'vite';
import { setBuildTarget } from '../common/index.js';
import {
  SITE_DIST_DIR,
  SITE_SRC_DIR,
  getSxyzConfig,
} from '../common/constant.js';
import { join } from 'node:path';
import vitePluginVue from '@vitejs/plugin-vue';
import vitePluginJsx from '@vitejs/plugin-vue-jsx';
import lodash from 'lodash';
import { vitePluginMd } from '../compiler/vite-plugin-md.js';
import { CSS_LANG } from '../common/css.js';
import { genSiteMobileShared } from '../compiler/gen-site-mobile-shared.js';
import { genSiteDesktopShared } from '../compiler/gen-site-desktop-shared.js';
import { genPackageStyle } from '../compiler/gen-package-style.js';

function getSiteConfig(sxyzConfig: any) {
  return sxyzConfig.site || {};
}

function getTitle(config: { title: string; description?: string }) {
  let { title } = config;

  if (config.description) {
    title += ` - ${config.description}`;
  }

  return title;
}

function vitePluginHTML(data: object): PluginOption {
  return {
    name: 'vite-plugin-html',
    transformIndexHtml: {
      enforce: 'pre',
      transform(html) {
        return lodash.template(html)(data);
      },
    },
  };
}

function vitePluginGenSxyzBaseCode(): PluginOption {
  const virtualMobileModuleId = 'site-mobile-shared';
  const resolvedMobileVirtualModuleId = `sxyz-cli:${virtualMobileModuleId}`;

  const virtualDesktopModuleId = 'site-desktop-shared';
  const resolvedDesktopVirtualModuleId = `sxyz-cli:${virtualDesktopModuleId}`;

  const virtualPackageStyleModuleId = /package-style/;
  const resolvedPackageStyleVirtualModuleId = `sxyz-cli${virtualPackageStyleModuleId}index.${CSS_LANG}`;

  return {
    name: 'vite-plugin(sxyz-cli):gen-site-base-code',
    resolveId(id) {
      if (id === virtualMobileModuleId) {
        return resolvedMobileVirtualModuleId;
      }

      if (id === virtualDesktopModuleId) {
        return resolvedDesktopVirtualModuleId;
      }

      if (virtualPackageStyleModuleId.test(id)) {
        return resolvedPackageStyleVirtualModuleId;
      }
    },
    load(id) {
      switch (id) {
        case resolvedMobileVirtualModuleId:
          return genSiteMobileShared();
        case resolvedDesktopVirtualModuleId:
          return genSiteDesktopShared();
        case resolvedPackageStyleVirtualModuleId:
          return genPackageStyle();
        default:
          break;
      }
    },
  };
}

function getHTMLMeta(sxyzConfig: any) {
  const meta = sxyzConfig.site?.htmlMeta;

  if (meta) {
    return Object.keys(meta)
      .map((key) => `<meta name="${key}" content="${meta[key]}">`)
      .join('\n');
  }

  return '';
}

export function getViteConfigForSiteDev(): InlineConfig {
  setBuildTarget('site');

  const sxyzConfig = getSxyzConfig();
  const siteConfig = getSiteConfig(sxyzConfig);
  const title = getTitle(siteConfig);
  const headHtml = sxyzConfig.site?.headHtml || '';

  return {
    root: SITE_SRC_DIR,
    optimizeDeps: {
      include: ['vue', 'vue-router'],
    },
    plugins: [
      vitePluginGenSxyzBaseCode(),
      vitePluginVue({
        include: [/\.vue$/, /\.md$/],
      }),
      vitePluginMd(),
      vitePluginJsx(),
      vitePluginHTML({
        ...siteConfig,
        title,
        description: siteConfig.description,
        headHtml,
        meta: getHTMLMeta(sxyzConfig),
      }),
    ],

    server: {
      host: '0.0.0.0',
    },
  };
}

export function getViteConfigForSiteProd(): InlineConfig {
  const devConfig = getViteConfigForSiteDev();
  const sxyzConfig = getSxyzConfig();

  const outDir = sxyzConfig.build?.site?.outputDir || SITE_DIST_DIR;
  const publicPath = sxyzConfig.build?.site?.publicPath || '/';

  return {
    ...devConfig,
    base: publicPath,
    build: {
      outDir,
      reportCompressedSize: false,
      emptyOutDir: true,
      cssTarget: ['chrome53'],
      rollupOptions: {
        input: {
          main: join(SITE_SRC_DIR, 'index.html'),
          mobile: join(SITE_SRC_DIR, 'mobile.html'),
        },
        output: {
          manualChunks: {
            'vue-libs': ['vue', 'vue-router'],
          },
        },
      },
    },
  };
}
