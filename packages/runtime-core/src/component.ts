import { proxyRefs } from "@vue/reactivity"

export const createComponentInstance = (vnode) => {
    const { type, props } = vnode
    const instance = {
        type,
        vnode,
        props,
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
    const { type, props } = instance

    const setupResult = proxyRefs(type.setup())

    instance.setupState = setupResult
    instance.render = type.render

}