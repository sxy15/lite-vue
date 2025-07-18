import { proxyRefs } from "@vue/reactivity"
import { initProps, normalizePropsOptions } from "./componentProps"
import { hasOwn, isFunction, isObject } from "@vue/shared"
import { nextTick } from "./scheduler"
import { initSlots } from "./componentSlots"

export const createComponentInstance = (vnode) => {
    const { type, props } = vnode
    const instance: any = {
        type,
        vnode,
        props,
        // 用户声明的组件props
        propsOptions: normalizePropsOptions(type.props),
        attrs: {},
        slots: {},
        refs: {},
        // setup返回的状态
        setupState: {},
        // 渲染函数
        render: null,
        // 子树
        subTree: null,
        // 组件是否已挂载
        isMounted: false,
    }

    instance.ctx = { _: instance }

    instance.emit = (event, ...args) => emit(instance, event, ...args)

    return instance
}

export const setupComponent = (instance) => {
    /**
     * 初始化属性
     */
    initProps(instance)
    /**
     * 初始化插槽
     */
    initSlots(instance)
    /**
     * 初始化状态
     */
    setupStatefulComponent(instance)
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $attrs: (i) => i.attrs,
    $emit: (i) => i.emit,
    $slots: (i) => i.slots,
    $refs: (i) => i.refs,
    $nextTick: (i) => {
        return nextTick.bind(i)
    },
    $forceUpdate: (i) => {
        return () => i.update()
    }
}

const publicInstanceProxyHandlers = {
    get(target, key, receiver) {
        const { _: instance } = target
        const { setupState, props } = instance

        /**
         * 如果访问了某个属性，先去setupState中找，再去props中找
         */

        if (hasOwn(setupState, key)) {
            return setupState[key]
        }

        if (hasOwn(props, key)) {
            return props[key]
        }

        /**
         * $attrs
         * $slots
         * $refs
         */
        if (hasOwn(publicPropertiesMap, key)) {
            return publicPropertiesMap[key](instance)
        }
    },
    set(target, key, value) {
        const { _: instance } = target
        const { setupState } = instance

        if (hasOwn(setupState, key)) {
            setupState[key] = value
            return true
        }
    }
}

function setupStatefulComponent(instance) {
    const { type } = instance

    instance.proxy = new Proxy(instance.ctx, publicInstanceProxyHandlers)

    if (isFunction(type.setup)) {
        const setupContext = createSetupContext(instance)

        const setupResult = type.setup(instance.props, setupContext)

        handleSetupResult(instance, setupResult)

        instance.setupContext = setupContext
    }

    if (!instance.render) {
        instance.render = type.render
    }
}

function handleSetupResult(instance, setupResult) {
    if (isFunction(setupResult)) {
        // 如果 setup 返回了函数，认为是render
        instance.render = setupResult
    } else if (isObject(setupResult)) {
        // 返回了对象就是状态
        instance.setupState = proxyRefs(setupResult)
    }
}

/**
 * 创建setup上下文
 * @param instance 
 * @returns 
 */
function createSetupContext(instance) {
    return {
        get attrs() {
            return instance.attrs
        },

        get slots() {
            return instance.slots
        },

        emit(event, ...args) {
            emit(instance, event, ...args)
        }
    }
}

function emit(instance, event, ...args) {
    /**
     * foo => onFoo
     */
    const eventName = `on${event[0].toUpperCase() + event.slice(1)}`
    const handler = instance.vnode.props[eventName]

    if (isFunction(handler)) {
        handler(...args)
    }
}