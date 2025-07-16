import { activeSub } from "./effect"
import { Link, link, propagate } from "./system"

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

export function track(target, key) {
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
}

export function trigger(target, key) {
    const depsMap = targetMap.get(target)
    if (!depsMap) {
        return
    }

    //数组 & key === length
    const targetIsArray = Array.isArray(target)
    if (targetIsArray && key === 'length') {
        const length = target.length
        depsMap.forEach((dep, depKey) => {
            if (depKey >= length || depKey === 'length') {
                // 通知大于等于length的effect重新执行 | length
                propagate(dep.subs)
            }
        })
    } else {
        const dep = depsMap.get(key)
        if (!dep) {
            return
        }
        propagate(dep.subs)
    }
}

class Dep {
    subs: Link | undefined
    subsTail: Link | undefined

    constructor() {

    }
}
