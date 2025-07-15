import { isObject } from "@vue/shared"
import { mutableHandlers } from "./baseHandlers"

export function reactive(target) {
    return createReactiveObject(target)
}

/**
 * reactiveMap 用来缓存已经代理过的对象
 */
const reactiveMap = new WeakMap()

const reactiveSet = new WeakSet()

function createReactiveObject(target) {
    /**
     * reactive必须接收一个对象
     */
    if (!isObject(target)) {
        return target
    }

    // 如果这个 target 是不是响应式对象，直接返回
    if (isReactive(target)) {
        return target
    }

    /**
     * 如果已经代理过，就直接返回
     */
    const existingProxy = reactiveMap.get(target)

    if (existingProxy) {
        return existingProxy
    }

    const proxy = new Proxy(target, mutableHandlers)

    reactiveMap.set(target, proxy)

    reactiveSet.add(proxy)

    return proxy
}

export function isReactive(target) {
    return reactiveSet.has(target)
}