import { join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';

function findRootDir(dir: string): string {
  if (existsSync(join(dir, 'sxyz.config.mjs'))) {
    return dir;
  }
  const parentDir = dirname(dir);
  if (dir === parentDir) {
    return dir;
  }

  return findRootDir(parentDir);
}

// Root paths
export const CWD = process.cwd();
export const ROOT = findRootDir(CWD);

export const SXYZ_CONFIG_FILE = join(ROOT, 'sxyz.config.mjs');

// Config files

export const SCRIPT_EXTS = [
  '.js',
  '.jsx',
  '.vue',
  '.ts',
  '.tsx',
  '.mjs',
  '.cjs',
];

async function getSxyzConfigAsync() {
  try {
    return (await import(pathToFileURL(SXYZ_CONFIG_FILE).href)).default;
  } catch (err) {
    return {};
  }
}

const SxyzConfig = await getSxyzConfigAsync();

export function getSxyzConfig() {
  return SxyzConfig;
}
