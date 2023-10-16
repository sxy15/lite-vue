import { isAbsolute, join } from 'node:path';
import { SRC_DIR, STYLE_DIR, getSxyzConfig } from './constant.js';
import { existsSync } from 'node:fs';

type CSS_LANG = 'css' | 'less' | 'scss';

function getCssLang(): CSS_LANG {
  const sxyzConfig = getSxyzConfig();
  const preprocessor = sxyzConfig.build?.css?.preprocessor || 'less';

  if (preprocessor === 'sass') {
    return 'scss';
  }

  return preprocessor;
}

export const CSS_LANG = getCssLang();

export function getCssBaseFile() {
  const sxyzConfig = getSxyzConfig();
  let path = join(STYLE_DIR, `base.${CSS_LANG}`);

  const baseFile = sxyzConfig.build?.css?.base || '';
  if (baseFile) {
    path = isAbsolute(baseFile) ? baseFile : join(SRC_DIR, baseFile);
  }

  if (existsSync(path)) {
    return path;
  }

  return null;
}
