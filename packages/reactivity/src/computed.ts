import { hasChanged, isFunction } from "@vue/shared"
import { ReactiveFlags } from "./ref"
import { Dependency, endTrack, link, Link, startTrack, Sub } from "./system"
import { activeSub, setActiveSub } from "./effect"

export class ComputedRefImpl implements Dependency, Sub {
    [ReactiveFlags.IS_REF] = true // computed也是一个ref

    // 保存fn的返回值
    _value

    // 作为dep，要关联subs，等值更新通知它们
    subs: Link
    subsTail: Link

    // 作为sub，要关联deps，需要知道哪些dep被收集
    deps: Link
    depsTail: Link
    tracking = false

    // 胀不胀，脏了，需要重新计算
    dirty = true

    constructor(public fn, private setter) { }

    get value() {
        if (this.dirty) {
            this.update()
        }
        /**
         * 和sub做关联关系 收集依赖
         */
        if (activeSub) {
            link(this, activeSub)
        }

        return this._value
    }

    set value(newValue) {
        if (this.setter) {
            this.setter(newValue)
        } else {
            console.warn('computed value must be readonly')
        }
    }

    update() {
        /**
         * 实现sub的功能，为了在执行fn期间，收集fn执行过程中访问到的响应式数据
         * 建立dep 和 sub 之间的关联关系
         */
        // 先将当前的effect保存起来，用来处理嵌套的逻辑
        const prevSub = activeSub
        // 每次执行fn之前，把this 放到 activeSub 中
        setActiveSub(this)

        startTrack(this)

        try {
            const oldValue = this._value

            this._value = this.fn()

            // 如果值发生了变化就return true
            return hasChanged(this._value, oldValue)
        } finally {
            endTrack(this)
            // 执行完之后，恢复之前的effect
            setActiveSub(prevSub)
        }
    }
}

/**
 * 计算属性
 * @param getterOrOptions 函数/对象（get set）
 */
export function computed(getterOrOptions) {
    let getter
    let setter

    if (isFunction(getterOrOptions)) {
        /**
         * const c = computed(() => {})
         */
        getter = getterOrOptions
    } else {
        /**
         * const c = computed({
         *  get() {},
         *  set() {}
         * })
         */
        getter = getterOrOptions.get
        setter = getterOrOptions.set
    }

    return new ComputedRefImpl(getter, setter)
}