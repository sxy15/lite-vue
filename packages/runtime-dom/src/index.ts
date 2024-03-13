import { createRenderer } from '@vue/runtime-core';
import { extend } from '@vue/shared';
import { nodeOps } from './nodeOps';
import { patchProp } from './patchProp';

let renderer;

const rendererOptions = extend({ patchProp }, nodeOps);

function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions));
}

export const render = (...args) => {
  ensureRenderer().render(...args);
}

export {
  patchProp,
  nodeOps
}