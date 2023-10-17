import { logger } from 'rslog';
import { getSxyzConfig } from './constant.js';
import { execSync } from 'node:child_process';

let hasYarnCache: boolean | undefined;
export function hasYarn() {
  if (hasYarnCache === undefined) {
    try {
      execSync('yarn --version', { stdio: 'ignore' });
      hasYarnCache = true;
    } catch (err) {
      hasYarnCache = false;
    }
  }
  return hasYarnCache;
}

export function getPackageManager() {
  const { build } = getSxyzConfig();

  if (build?.packageManager) {
    return build.packageManager;
  }

  return hasYarn() ? 'yarn' : 'npm';
}

export async function installDependencies() {
  logger.info('Install Dependencies\n');

  try {
    const manager = getPackageManager();

    execSync(`${manager} install --prod=false`, {
      stdio: 'inherit',
    });

    console.log('');
  } catch (err) {
    console.log(err);
    throw err;
  }
}
