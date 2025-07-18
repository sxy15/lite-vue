import { ReactiveEffect } from './effect';

/**
 * 依赖项
 */
export interface Dependency {
    subs: Link | undefined
    subsTail: Link | undefined
}
/**
 * 订阅者
 */
export interface Sub {
    deps: Link | undefined
    depsTail: Link | undefined
    tracking: boolean
}

/**
 * 链表节点
 */
export interface Link {
    sub: Sub
    nextSub: Link | undefined
    prevSub: Link | undefined
    dep: Dependency
    nextDep: Link | undefined
}

let linkPool: Link

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

    let newLink

    // 复用linkPool
    if (linkPool) {
        newLink = linkPool
        linkPool = linkPool.nextDep
        newLink.nextDep = nextDep
        newLink.sub = sub
        newLink.dep = dep
    } else {
        newLink = {
            sub,
            dep,
            nextDep,
            nextSub: undefined,
            prevSub: undefined
        }
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
 * 更新计算属性
 * 1. 调用update
 * 2. 通知subs链表上所有的sub重新执行
 * @param sub 
 */
function processComputedUpdate(sub) {
    // update return true 代表值发生了变化
    if (sub.subs && sub.update()) {
        propagate(sub.subs)
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
        const sub = link.sub
        if (!sub.tracking && !sub.dirty) {
            sub.dirty = true
            if ('update' in sub) {
                processComputedUpdate(sub)
            } else {
                queueEffect.push(link.sub)
            }
        }
        link = link.nextSub
    }
    queueEffect.forEach(effect => effect.notify())
}

export function startTrack(sub) {
    sub.depsTail = undefined
    sub.tracking = true
}

export function endTrack(sub) {
    sub.tracking = false
    const depsTail = sub.depsTail

    sub.dirty = false
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
        // 把不要的节点给 linkPool
        link.nextDep = linkPool
        linkPool = link

        link = nextDep
    }
}