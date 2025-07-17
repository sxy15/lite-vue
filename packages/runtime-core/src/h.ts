import { isArray, isObject } from "@vue/shared"
import { createVNode } from "./vnode"

/**
* h函数作用是对createVNode 做一个参数标准化（归一化）
*/
export function h(type, propsOrChildren?, children?) {
    let l = arguments.length

    if (l === 2) {
        // h('div', [h('span', 'hello'), h('span', 'world')])
        if (isArray(propsOrChildren)) {
            return createVNode(type, null, propsOrChildren)
        }

        if (isObject(propsOrChildren)) {
            // h('div', h('span', 'hello'))
            if (isVNode(propsOrChildren)) {
                return createVNode(type, null, [propsOrChildren])
            }
            //h('div', { class: 'container'})
            return createVNode(type, propsOrChildren, children)
        }

        // h('div', 'hello world') 
        return createVNode(type, null, propsOrChildren)
    } else {
        if (l > 3) {
            //h('div', { class: 'container'}, h('span', 'hello')，h('span', 'hello'))
            // 转换为=>
            //h('div', { class: 'container'}, [h('span', 'hello')，h('span', 'hello')])
            children = [...arguments].slice(2)
        } else if (isVNode(children)) {
            // h('div', { class: 'container'}, h('span', 'hello'))
            children = [children]
        } else {
            // 不需要处理
            // h('div', { class: 'container'}, 'hello world')
            // h('div', { class: 'container'}, [h('span', 'hello')，h('span', 'hello')])
        }

        return createVNode(type, propsOrChildren, children)
    }
}

/**
 * 是否为虚拟节点
 * @param value 
 * @returns 
 */
function isVNode(value) {
    return value?.__v_isVNode
}