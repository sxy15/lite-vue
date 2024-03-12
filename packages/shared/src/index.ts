export { ShapeFlags } from './shapeFlags'
export { normalizeClass } from './normalizeProp'

export const isArray = Array.isArray;

export const isObject = (value: unknown) => {
  return value !== null && typeof value === 'object';
}

export const hasChanged = (value: any, oldValue: any): boolean => {
  return !Object.is(value, oldValue);
}

export const isFunction = (value: unknown): value is Function => {
  return typeof value === 'function';
}

export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
}

export const extend = Object.assign;

export const EMPTY_OBJ: {readonly [key: string] : any} = {};
