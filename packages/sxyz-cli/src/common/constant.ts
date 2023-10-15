import { join, dirname, isAbsolute } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';

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
export const PACKAGE_JSON_FILE = join(ROOT, 'package.json');

export const SXYZ_CONFIG_FILE = join(ROOT, 'sxyz.config.mjs');

// Relative paths
const __dirname = dirname(fileURLToPath(import.meta.url));
export const DIST_DIR = join(__dirname, '..', '..', 'dist');
export const SITE_SRC_DIR = join(__dirname, '..', '..', 'site');

// Dist files
export const STYLE_DEPS_JSON_FILE = join(DIST_DIR, 'style-deps.json');
export const PACKAGE_ENTRY_FILE = join(DIST_DIR, 'package-entry.js');

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

export function getPackageJson() {
  const rawJson = readFileSync(PACKAGE_JSON_FILE, 'utf-8');
  return JSON.parse(rawJson);
}

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

function getSrcDir() {
  const sxyzConfig = getSxyzConfig();
  const srcDir = sxyzConfig.build?.srcDir;

  if (srcDir) {
    if (isAbsolute(srcDir)) {
      return srcDir;
    }

    return join(ROOT, srcDir);
  }

  return join(ROOT, 'src');
}

export const SRC_DIR = getSrcDir();
