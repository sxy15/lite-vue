import { PACKAGE_ENTRY_FILE } from '../common/constant.js';
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

export async function compileSite(production = false) {
  await genSiteEntry();
  console.log(production);
}
