import { isFunction, isObject } from '@vue/shared';
import { ReactiveEffect } from './effect';
import { isRef } from './ref'
import { isReactive } from 'vue';

export function watch(source, cb, options) {

    let { immediate, once, deep } = options || {}

    // 保存cb，调用后直接stop
    if (once) {
        const _cb = cb
        cb = (...args) => {
            _cb(...args)
            stop()
        }
    }

    let getter

    if (isRef(source)) {
        //ref
        getter = () => source.value
    } else if (isReactive(source)) {
        // reactive
        getter = () => source
        if (!deep) {
            deep = true
        }
    } else if (isFunction(source)) {
        // function
        getter = source
    }

    if (deep) {
        const baseGetter = getter
        const depth = deep === true ? Infinity : deep
        getter = () => traverse(baseGetter(), depth)
    }

    let oldValue

    let cleanup = null
    function onCleanup(cb) {
        cleanup = cb
    }

    function job() {
        // 清理上一次的副作用
        if (cleanup) {
            cleanup()
            cleanup = null
        }
        // 执行effect.run 拿到 getter的返回值，不能直接执行 getter，因为要收集依赖
        const newValue = effect.run()
        // 执行用户回调cb
        cb(newValue, oldValue, onCleanup)
        oldValue = newValue
    }

    const effect = new ReactiveEffect(getter)

    effect.scheduler = job

    if (immediate) {
        job()
    } else {
        // 拿到oldValue 并且收集依赖
        oldValue = effect.run()
    }

    // 停止监听
    function stop() {
        effect.stop()
    }

    return stop
}

function traverse(value, depth = Infinity, seen = new Set()) {
    // 非对象 或者 监听层级深度到了 直接返回
    if (!isObject(value) || depth <= 0) {
        return value
    }

    if (seen.has(value)) {
        return value
    }

    depth--

    seen.add(value)

    for (const key in value) {
        traverse(value[key], depth, seen)
    }

    return value
}