import fse from 'fs-extra';
import { join } from 'node:path';
import chalk from 'chalk';
import enquirer from 'enquirer';
import { logger } from 'rslog';
import { getPackageManager } from '../common/manager.js';
import { execSync } from 'node:child_process';

function logCurrentVersion(cwd: string) {
  const pkgPath = join(cwd, 'package.json');
  const pkg = fse.readJSONSync(pkgPath);
  const { name, version } = pkg;
  logger.info(`${chalk.bold('Current package')} ${chalk.green(name)}`);
  logger.info(`${chalk.bold('Current version')} ${chalk.green(version)}`);

  return {
    pkgName: name,
    currentVersion: version,
  };
}

async function getNewVersion() {
  const { version } = await enquirer.prompt<{ version: string }>({
    type: 'input',
    name: 'version',
    message: 'Version to release:',
  });

  return version;
}

function getNpmTag(version: string, forceTag?: string) {
  let tag: string;

  if (forceTag) {
    tag = forceTag;
  } else if (version.includes('beta')) {
    tag = 'beta';
  } else if (version.includes('alpha')) {
    tag = 'alpha';
  } else if (version.includes('rc')) {
    tag = 'rc';
  } else {
    tag = 'latest';
  }

  logger.info(`${chalk.bold('Npm tag:')} ${chalk.green(tag)}`);

  return tag;
}

function setPkgVersion(
  pkgJson: Record<string, any>,
  pkgJsonPath: string,
  version: string,
) {
  pkgJson.version = version;
  fse.writeJSONSync(pkgJsonPath, pkgJson, { spaces: 2 });
}

function buildPackage(pkgJson: Record<string, any>, packageManager: string) {
  if (pkgJson.scripts?.build) {
    const command = `${packageManager} run build`;
    logger.info(`Building package: ${chalk.green(command)}`);
    execSync(command, { stdio: 'inherit' });
  }
}

function publishPackage(packageManager: string, tag: string) {
  let command = `${packageManager} publish --tag ${tag}`;

  if (packageManager === 'pnpm') {
    command += ' --no-git-checks'; // pnpm doesn't support git checks
  }

  execSync(command, { stdio: 'inherit' });
}

function commitChanges(pkgName: string, version: string, gitTag?: boolean) {
  const message = `release: ${pkgName} v${version}`;

  execSync(`git add -A && git commit -m "${message}"`, { stdio: 'inherit' });

  if (gitTag) {
    execSync(`git tag -a v${version} -m "${message}"`, { stdio: 'inherit' });
  }
}

function getCurrentBranch() {
  const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

  return branch;
}

function pushChanges(gitTag?: boolean) {
  const branch = getCurrentBranch();
  execSync(`git push origin ${branch}`, { stdio: 'inherit' });

  if (gitTag) {
    execSync(`git push origin v${branch}`, { stdio: 'inherit' });
  }
}

export async function release(command: { tag?: string; gitTag?: boolean }) {
  const cwd = process.cwd();
  const { pkgName, currentVersion } = logCurrentVersion(cwd);
  const version = await getNewVersion();
  const tag = getNpmTag(version, command.tag);
  const packageManager = getPackageManager();

  const pkgJsonPath = join(cwd, 'package.json');
  const pkgJson = fse.readJSONSync(pkgJsonPath);

  setPkgVersion(pkgJson, pkgJsonPath, version);

  try {
    buildPackage(pkgJson, packageManager);
  } catch (err) {
    logger.error('Failed to build package, rollback to the previous version.');
    setPkgVersion(pkgJson, pkgJsonPath, currentVersion);
    throw err;
  }

  publishPackage(packageManager, tag);
  commitChanges(pkgName, version, command.gitTag);
  pushChanges(command.gitTag);
}
