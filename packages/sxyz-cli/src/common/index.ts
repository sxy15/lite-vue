import fse from 'fs-extra';
import { SRC_DIR } from './constant.js';
import { join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

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
