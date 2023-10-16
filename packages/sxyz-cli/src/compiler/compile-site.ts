import { build } from 'vite';
import { PACKAGE_ENTRY_FILE } from '../common/constant.js';
import { mergeCustomViteConfig } from '../common/index.js';
import { getViteConfigForSiteProd } from '../config/vite.site.js';
import { genPackageEntry } from './gen-package-entry.js';
import { genStyleDepsMap } from './gen-style-deps-map.js';

export function genSiteEntry(): Promise<void> {
  return new Promise((resolve, reject) => {
    genStyleDepsMap()
      .then(() => {
        genPackageEntry({
          outputPath: PACKAGE_ENTRY_FILE,
        });
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export async function compileSite(production = true) {
  await genSiteEntry();
  if (production) {
    const config = await mergeCustomViteConfig(
      getViteConfigForSiteProd(),
      'production',
    );
    await build(config);
  } else {
    console.log('dev');
  }
}
