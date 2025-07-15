import { hasChanged, isObject } from "@vue/shared"
import { activeSub } from "./effect"
import { reactive } from "./reactive"
import { type Link, link, propagate } from "./system"

enum ReactiveFlags {
    IS_REF = '__v_isRef'
}

/**
 * ref 类
 */
class RefImpl<T> {
    private _value: T

    [ReactiveFlags.IS_REF] = true

    /**
     * 订阅者链表的头节点
     */
    subs: Link

    /**
     * 订阅者链表的尾节点
     */
    subsTail: Link

    constructor(value: T) {
        /**
         * 如果value是一个对象，使用reactive 包裹一下，变成响应式的
         */
        this._value = isObject(value) ? reactive(value) : value
    }

    get value() {
        // 收集依赖
        if (activeSub) {
            trackRef(this)
        }
        return this._value
    }

    set value(newValue: T) {
        if (hasChanged(newValue, this._value)) {
            //触发更新
            this._value = isObject(newValue) ? reactive(newValue) : newValue

            //通知 effect 重新执行
            triggerRef(this)
        }
    }
}

export function ref<T>(value: T) {
    return new RefImpl(value)
}

export function isRef(value) {
    return !!(value && value[ReactiveFlags.IS_REF])
}

/**
 * 收集依赖，建立Ref 和 链表的关联关系
 * @param dep 
 */
export function trackRef(dep: RefImpl<any>) {
    if (activeSub) {
        link(dep, activeSub)
    }
}

/**
 * 触发依赖更新
 * @param dep 
 */
export function triggerRef(dep: RefImpl<any>) {
    if (dep.subs) {
        propagate(dep.subs)
    }
}
