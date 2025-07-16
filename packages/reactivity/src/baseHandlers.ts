import { isRef } from "./ref"
import { track, trigger } from "./dep"
import { reactive } from "./reactive"
import { hasChanged, isObject } from "@vue/shared"

export const mutableHandlers = {
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

        if (isObject(res)) {
            return reactive(res)
        }
        return res
    },
    set(target, key, value, receiver) {
        const oldValue = target[key]

        const targetIsArray = Array.isArray(target)
        const oldLength = targetIsArray ? target.length : 0

        const res = Reflect.set(target, key, value, receiver)

        /**
         * const a = ref(0)
         * target = { a }
         * 更新target.a = 1，就等于更新了a.value
         */
        if (isRef(oldValue) && !isRef(value)) {
            oldValue.value = value
            return true // 直接return, 不触发trigger。因为ref.value 已经触发了
        }

        if (hasChanged(oldValue, value)) {
            trigger(target, key)
        }

        const newLength = targetIsArray ? target.length : 0
        /**
         * 隐式更新了 length
         * push pop shift unshift
         */
        if (targetIsArray && newLength !== oldLength && key !== 'length') {
            trigger(target, 'length')
        }
        return res
    }
}