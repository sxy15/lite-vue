import fse from 'fs-extra';
import { SRC_DIR, getSxyzConfig } from './constant.js';
import { join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { InlineConfig, loadConfigFromFile, mergeConfig } from 'vite';

const { readdirSync, outputFileSync } = fse;

export type NodeEnv = 'production' | 'development' | 'test';
export type BuildTarget = 'site' | 'package';

export const ENTRY_EXTS = ['js', 'ts', 'tsx', 'jsx', 'vue'];

export function normalizePath(path: string): string {
  return path.replace(/\\/g, '/');
}

export function hasDefaultExport(code: string) {
  return code.includes('export default') || code.includes('export { default }');
}

export function setNodeEnv(value: NodeEnv) {
  process.env.NODE_ENV = value;
}

export function setBuildTarget(value: BuildTarget) {
  process.env.BUILD_TARGET = value;
}

export function getComponents() {
  const EXCLUDES = ['.DS_Store'];

  const dirs = readdirSync(SRC_DIR);

  return dirs
    .filter((dir) => !EXCLUDES.includes(dir))
    .filter((dir) => {
      return ENTRY_EXTS.some((ext) => {
        const path = join(SRC_DIR, dir, `index.${ext}`);

        if (existsSync(path)) {
          return hasDefaultExport(readFileSync(path, 'utf-8'));
        }

        return false;
      });
    });
}

// smarter outputFileSync
// skip output if file content unchanged
export function smartOutputFile(filePath: string, content: string) {
  if (existsSync(filePath)) {
    const previousContent = readFileSync(filePath, 'utf-8');

    if (previousContent === content) {
      return;
    }
  }

  outputFileSync(filePath, content);
}

const camelizeRE = /-(\w)/g;
const pascalizeRE = /(\w)(\w*)/g;

export function camelize(str: string): string {
  return str.replace(camelizeRE, (_, c) => c.toUpperCase());
}

export function pascalize(str: string): string {
  return camelize(str).replace(
    pascalizeRE,
    (_, c1, c2) => c1.toUpperCase() + c2,
  );
}

export async function mergeCustomViteConfig(
  config: InlineConfig,
  mode: 'production' | 'development',
): Promise<InlineConfig> {
  const sxyzConfig = getSxyzConfig();
  const configureVite = sxyzConfig.build?.configureVite;

  const userConfig = await loadConfigFromFile(
    {
      mode,
      command: mode === 'production' ? 'build' : 'serve',
    },
    undefined,
    process.cwd(),
  );

  if (configureVite) {
    const ret = configureVite(config);
    if (ret) {
      config = ret;
    }
  }

  if (userConfig) {
    return mergeConfig(config, userConfig.config);
  }
  return config;
}

export function removeExt(path: string) {
  return path.replace('.js', '');
}

export function decamelize(str: string, sep = '-') {
  return str
    .replace(/([a-z\d])([A-Z])/g, '$1' + sep + '$2')
    .replace(/([A-Z])([A-Z][a-z\d]+)/g, '$1' + sep + '$2')
    .toLowerCase();
}
