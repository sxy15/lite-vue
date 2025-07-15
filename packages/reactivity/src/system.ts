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
        nextDep,
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

export function startTrack(sub) {
    sub.depsTail = undefined
}

export function endTrack(sub) {
    const depsTail = sub.depsTail
    /**
     * 1. depsTail 有，并且 depsTail 还有 nextDep，应该把它们的依赖关系清理掉
     * 2. depsTail 没有，并且deps有，那就把所有的都清理
     */
    if (depsTail) {
        if (depsTail.nextDep) {
            clearTracking(depsTail.nextDep)
            depsTail.nextDep = undefined
        }
    } else if (sub.deps) {
        clearTracking(sub.deps)
        sub.deps = undefined
    }
}

/**
 * 清理依赖关系
 * @param link 
 */
function clearTracking(link) {
    while (link) {
        const { prevSub, nextSub, nextDep, dep } = link
        /**
         * 如果prevSub有，那就把prevSub的nextSub 指向 nextSub
         * 如果没有，那就是头节点，把dep.subs指向当前节点的下一个
         */
        if (prevSub) {
            prevSub.nextSub = nextSub
            link.nextSub = undefined
        } else {
            dep.subs = nextSub
        }

        /**
         * 如果下一个有，那就把nextSub的上一个节点指向当前节点的上一个
         * 如果没有，那就是尾节点，把dep.subsTail 指向当前节点的上一个
         */
        if (nextSub) {
            nextSub.prevSub = prevSub
            link.prevSub = undefined
        } else {
            dep.subsTail = prevSub
        }

        link.dep = link.sub = undefined
        link.nextDep = undefined
        link = nextDep
    }
}