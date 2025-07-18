import { isArray, isFunction, isNumber, isObject, isString, ShapeFlags } from "@vue/shared"

/**
 * 文本节点标记
 */
export const Text = Symbol('v-text')

export function isSameVNodeType(n1, n2) {
    return n1.type === n2.type && n1.key === n2.key
}

export function normalizeVNode(vnode) {
    if (isString(vnode) || isNumber(vnode)) {
        return createVNode(Text, null, String(vnode))
    }

    return vnode
}

function normalizeChildren(children) {
    if (isNumber(children)) {
        children = String(children)
    }

    return children
}

/**
 * 创建虚拟节点
 * @param type 节点类型
 * @param props 节点属性
 * @param children 子节点
 */
export function createVNode(type, props?, children?) {

    children = normalizeChildren(children)

    let shapeFlag = 0

    if (isString(type)) {
        // div p span
        shapeFlag = ShapeFlags.ELEMENT // 1
    } else if (isObject(type)) {
        // 有状态组件
        shapeFlag = ShapeFlags.STATEFUL_COMPONENT // 100
    } else if (isFunction(type)) {
        // 函数组件
        shapeFlag = ShapeFlags.FUNCTIONAL_COMPONENT // 10
    }

    if (isString(children)) {
        shapeFlag = shapeFlag | ShapeFlags.TEXT_CHILDREN // 1001
    } else if (isArray(children)) {
        shapeFlag = shapeFlag | ShapeFlags.ARRAY_CHILDREN // 10000
    }

    const vnode = {
        __v_isVnode: true,
        type,
        props,
        children,
        shapeFlag,
        key: props?.key, // diff用
        el: null // 虚拟节点挂载的元素
    }

    return vnode
}
