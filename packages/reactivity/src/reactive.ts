import { hasChanged, isObject } from "@vue/shared"
import { link, propagate, type Link } from "./system"
import { activeSub } from "./effect"
import { isRef } from './ref'

export function reactive(target) {
    return createReactiveObject(target)
}

const mutableHandlers = {
    get(target, key, receiver) {
        track(target, key)
        /**
         * {
         *  a: 10,
         *  get count() {
         *      return this.a
         *  }
         * }
         * receiver 用来保证getter中的this指向正确
         */
        const res = Reflect.get(target, key, receiver)
        if (isRef(res)) {
            return res.value
        }
        return res
    },
    set(target, key, value, receiver) {
        const oldValue = target[key]

        const res = Reflect.set(target, key, value, receiver)

        if (hasChanged(oldValue, value)) {
            trigger(target, key)
        }
        return res
    }
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

/**
 * 绑定target key关联的所有Dep
 * obj = {a: 0}
 * targetMap = {
 *  [obj]: {
 *      a: new Dep()
 *  }
 * }
 */
const targetMap = new WeakMap()

function track(target, key) {
    if (!activeSub) {
        return
    }
    let depsMap = targetMap.get(target)
    // 没有depsMap 就创建
    if (!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }

    // 找Dep
    let dep = depsMap.get(key)
    if (!dep) { // 第一次收集这个对象，没找到就创建新的
        dep = new Dep()
        depsMap.set(key, dep)
    }

    link(dep, activeSub)

    console.log('dep', dep, key)
}

function trigger(target, key) {
    const depsMap = targetMap.get(target)
    if (!depsMap) {
        return
    }
    const dep = depsMap.get(key)
    if (!dep) {
        return
    }
    propagate(dep.subs)
}

class Dep {
    subs: Link | undefined
    subsTail: Link | undefined

    constructor() {

    }
}

export function isReactive(target) {
    return reactiveSet.has(target)
}
