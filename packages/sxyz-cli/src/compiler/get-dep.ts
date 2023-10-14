import { join } from 'node:path';
import { SCRIPT_EXTS } from '../common/constant.js';
import { readFileSync, existsSync } from 'node:fs';

// https://regexr.com/47jlq
const IMPORT_RE =
  /import\s+?(?:(?:(?:[\w*\s{},]*)\s+from(\s+)?)|)(?:(?:".*?")|(?:'.*?'))[\s]*?(?:;|$|)/g;

let depsMap: Record<string, string[]> = {};
let existsCache: Record<string, boolean> = {};

function getImportRelativePath(code: string) {
  const divider = code.includes('"') ? '"' : "'";
  return code.split(divider)[1];
}

function getPathByImport(code: string, filePath: string) {
  const relativePath = getImportRelativePath(code);

  if (relativePath.includes('.')) {
    return fillExt(join(filePath, '..', relativePath));
  }

  return null;
}

export function clearDepsCache() {
  depsMap = {};
  existsCache = {};
}

function exists(filePath: string) {
  if (!(filePath in existsCache)) {
    existsCache[filePath] = existsSync(filePath);
  }

  return existsCache[filePath];
}

export function fillExt(fillPath: string) {
  for (let i = 0; i < SCRIPT_EXTS.length; i++) {
    const completePath = `${fillPath}${SCRIPT_EXTS[i]}`;

    if (exists(completePath)) {
      return {
        path: completePath,
        isIndex: false,
      };
    }
  }

  for (let i = 0; i < SCRIPT_EXTS.length; i++) {
    const completePath = `${fillPath}/index${SCRIPT_EXTS[i]}`;

    if (exists(completePath)) {
      return {
        path: completePath,
        isIndex: true,
      };
    }
  }

  return {
    path: '',
    isIndex: false,
  };
}

function matchImports(code: string): string[] {
  const imports = code.match(IMPORT_RE) || [];
  return imports.filter((line) => !line.includes('import type'));
}

export function getDeps(filePath: string) {
  if (depsMap[filePath]) {
    return depsMap[filePath];
  }

  const code = readFileSync(filePath, 'utf-8');
  const imports = matchImports(code);

  const paths = imports
    .map((item) => getPathByImport(item, filePath)?.path)
    .filter((item) => !!item) as string[];

  depsMap[filePath] = paths;

  paths.forEach(getDeps);

  return paths;
}
