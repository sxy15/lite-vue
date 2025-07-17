import { isArray, isString, ShapeFlags } from "@vue/shared"

export function isSameVNodeType(n1, n2) {
    return n1.type === n2.type && n1.key === n2.key
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
        shapeFlag = ShapeFlags.ELEMENT // 1
    }

    if (isString(children)) {
        shapeFlag = shapeFlag | ShapeFlags.TEXT_CHILDREN // 1001
    } else if (isArray(children)) {
        shapeFlag = shapeFlag | ShapeFlags.ARRAY_CHILDREN // 10000
    }

    if (shapeFlag & ShapeFlags.ELEMENT) {
        /**
         * 与运算
         * 1 & 1 = 1
         * 
         * 1001 & 0001 = 0001
         */
        console.log('dom')
    }

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        /**
         * 1001
         * 1000
         * 1000
         */
        console.log('text')
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
