import { isObject } from "@vue/shared"
import { link, propagate, type Link } from "./system"
import { activeSub } from "./effect"

export function reactive(target) {
    return createReactiveObject(target)
}

function createReactiveObject(target) {
    /**
     * reactive必须接收一个对象
     */
    if (!isObject(target)) {
        return target
    }

    const proxy = new Proxy(target, {
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
            return Reflect.get(target, key, receiver)
        },
        set(target, key, value, receiver) {
            const res = Reflect.set(target, key, value, receiver)
            trigger(target, key)
            return res
        }
    })

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