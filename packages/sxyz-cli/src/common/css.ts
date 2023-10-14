import { getSxyzConfig } from './constant.js';

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
