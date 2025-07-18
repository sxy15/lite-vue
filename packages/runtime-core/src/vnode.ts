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

function normalizeChildren(vnode, children) {
    let { shapeFlag } = vnode

    if (isArray(children)) {
        /**
         * children = [h('div', 'hello'), h('div', 'world')]
         */
        shapeFlag = shapeFlag | ShapeFlags.ARRAY_CHILDREN // 10000
    } else if (isObject(children)) {

        /**
         * children = { default: () => h('div', 'hello'), header: () => h('div', 'header') }
         */
        if (shapeFlag & ShapeFlags.COMPONENT) {
            // 组件就是插槽
            shapeFlag = shapeFlag | ShapeFlags.SLOTS_CHILDREN
        }

    } else if (isFunction(children)) {
        /**
         * children = () => h('div', 'hello')
         *  =>
         *  { default: () => h('div', 'hello') }
         */
        shapeFlag = shapeFlag | ShapeFlags.SLOTS_CHILDREN
        children = { default: children }

    } else if (isNumber(children) || isString(children)) {
        children = String(children)
        shapeFlag = shapeFlag | ShapeFlags.TEXT_CHILDREN // 1001
    }

    vnode.shapeFlag = shapeFlag
    vnode.children = children
}

/**
 * 创建虚拟节点
 * @param type 节点类型
 * @param props 节点属性
 * @param children 子节点
 */
export function createVNode(type, props?, children?) {

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

    const vnode = {
        __v_isVnode: true,
        type,
        props,
        children: null,
        shapeFlag,
        key: props?.key, // diff用
        el: null // 虚拟节点挂载的元素
    }

    /**
     * children的标准化和shapeFlag处理
     */
    normalizeChildren(vnode, children)

    return vnode
}
