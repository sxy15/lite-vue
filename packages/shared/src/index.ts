export function isObject(value: unknown): value is object {
    return value !== null && typeof value === 'object'
}

/**
 * 判断旧值和新值是否发生改变
 * @param oldValue 旧值
 * @param newValue 新值
 * @returns 
 */
export function hasChanged(oldValue: any, newValue: any) {
    return !Object.is(oldValue, newValue)
}

export function isFunction(value: unknown): value is Function {
    return typeof value === 'function'
}