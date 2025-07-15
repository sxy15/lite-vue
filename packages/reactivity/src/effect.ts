import { endTrack, Link, startTrack } from "./system"

// 用来保存当前执行的 effect
export let activeSub

export class ReactiveEffect {
    /**
     * 用来保存当前effect 收集的依赖
     */
    deps: Link | undefined

    /**
     * 用来保存当前effect 收集的依赖的最后一个节点
     */
    depsTail: Link | undefined

    constructor(public fn: () => void) {
        this.fn = fn
    }

    run() {
        // 先将当前的effect保存起来，用来处理嵌套的逻辑
        const prevSub = activeSub
        // 每次执行fn之前，把this 放到 activeSub 中
        activeSub = this

        startTrack(this)

        try {
            return this.fn()
        } finally {
            endTrack(this)
            // 执行完之后，清空 activeSub
            activeSub = prevSub
        }
    }

    /**
     * 通知更新, 如果依赖的数据发生变化，会执行
     */
    notify() {
        this.scheduler()
    }

    /**
     * 默认调用run , 如果用户传了会调用用户的
     */
    scheduler() {
        this.run()
    }
}

export function effect<T>(fn: () => T, options) {
    const e = new ReactiveEffect(fn)

    // scheduler
    Object.assign(e, options)

    e.run() // 执行run 收集依赖

    const runner = e.run.bind(e)
    runner.effect = e

    return runner
}
