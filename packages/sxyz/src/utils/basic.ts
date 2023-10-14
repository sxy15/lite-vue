export function noop() {}

export const extend = Object.assign;

export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === 'object';

export const isFunction = (val: unknown): val is any =>
  typeof val === 'function';

export function get(object: any, path: string): any {
  const keys = path.split('.');
  let result = object;

  keys.forEach((key) => {
    result = isObject(result) ? result[key] ?? '' : '';
  });

  return result;
}
