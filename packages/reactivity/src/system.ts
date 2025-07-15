import { ReactiveEffect } from './effect';

/**
 * 依赖项
 */
export interface Dep {
    subs: Link | undefined
    subsTail: Link | undefined
}
/**
 * 订阅者
 */
export interface Sub {
    deps: Link | undefined
    depsTail: Link | undefined
}

/**
 * 链表节点
 */
export interface Link {
    sub: Sub
    nextSub: Link | undefined
    prevSub: Link | undefined
    dep: Dep
    nextDep: Link | undefined
}

export function link(dep, sub) {
    // 尝试复用链表节点
    const currentDep = sub.depsTail
    /**
     * 1. 如果头节点有，尾节点没有，那么尝试复用头节点
     * 2. 如果尾节点还有nextDep， 尝试复用nextDep
     */
    const nextDep = currentDep === undefined ? sub.deps : currentDep.nextDep

    if (nextDep && nextDep.dep === dep) {
        sub.depsTail = nextDep
        return
    }

    const newLink = {
        sub,
        dep,
        nextDep: undefined,
        nextSub: undefined,
        prevSub: undefined
    }

    if (dep.subsTail) {
        dep.subsTail.nextSub = newLink
        newLink.prevSub = dep.subsTail
        dep.subsTail = newLink
    } else {
        dep.subs = newLink
        dep.subsTail = newLink
    }

    if (sub.depsTail) {
        sub.depsTail.nextDep = newLink
        sub.depsTail = newLink
    } else {
        sub.deps = newLink
        sub.depsTail = newLink
    }
}

/**
 * 传播更新
 * @param subs 
 */
export function propagate(subs) {
    let link = subs
    let queueEffect = []
    while (link) {
        queueEffect.push(link.sub)
        link = link.nextSub
    }
    queueEffect.forEach(effect => effect.notify())
}