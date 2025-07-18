import { proxyRefs } from "@vue/reactivity"
import { initProps, normalizePropsOptions } from "./componentProps"
import { isFunction } from "@vue/shared"

export const createComponentInstance = (vnode) => {
    const { type, props } = vnode
    const instance = {
        type,
        vnode,
        props,
        // 用户声明的组件props
        propsOptions: normalizePropsOptions(type.props),
        attrs: {},
        // setup返回的状态
        setupState: null,
        // 渲染函数
        render: null,
        // 子树
        subTree: null,
        // 组件是否已挂载
        isMounted: false,
    }

    return instance
}

export const setupComponent = (instance) => {
    /**
     * 初始化属性
     */
    const { type } = instance

    initProps(instance)

    const setupContext = createSetupContext(instance)

    if (isFunction(type.setup)) {
        const setupResult = proxyRefs(type.setup(instance.props, setupContext))

        instance.setupState = setupResult
    }

    instance.render = type.render
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
    }
}