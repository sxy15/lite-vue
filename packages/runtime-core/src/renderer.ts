import { ShapeFlags } from "@vue/shared"
import { isSameVNodeType, normalizeVNode, Text } from "./vnode"
import { createAppAPI } from "./apiCreateApp"

export function createRenderer(options) {
    /**
     * 元素的挂载 更新
     */
    const processElement = (n1, n2, container, anchor) => {
        if (n1 === null) {
            // 挂载
            mountElement(n2, container, anchor)
        } else {
            // 更新
            patchElement(n1, n2)
        }
    }
    /**
     * 处理文本的挂载 更新
     * @param n1 
     * @param n2 
     * @param container 
     * @param anchor 
     */
    const processText = (n1, n2, container, anchor) => {
        if (n1 === null) {
            // 挂载
            const el = hostCreateText(n2.children)
            n2.el = el
            hostInsert(el, container, anchor)
        } else {
            // 更新
            n2.el = n1.el
            if (n1.children !== n2.children) {
                hostSetText(n2.el, n2.children)
            }
        }
    }

    /**
     * 更新 挂载都用这个函数
     * @param n1 
     * @param n2 
     * @param container 
     */
    const patch = (n1, n2, container, anchor = null) => {
        if (n1 === n2) {
            // 如果 2 次传递的同一个虚拟节点 return
            return
        }

        if (n1 && !isSameVNodeType(n1, n2)) {
            // 不同类型的节点 直接卸载旧节点 挂载新节点
            unmount(n1)
            n1 = null
        }

        const { shapeFlag, type } = n2
        switch (type) {
            case Text:
                processText(n1, n2, container, anchor)
                break
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    // 处理dom元素 div span p
                    processElement(n1, n2, container, anchor)
                } else if (shapeFlag & ShapeFlags.COMPONENT) {
                    // 处理组件
                }
        }
    }

    const {
        insert: hostInsert,
        remove: hostRemove,
        setElementText: hostSetElementText,
        createText: hostCreateText,
        setText: hostSetText,
        parentNode: hostParentNode,
        nextSibling: hostNextSibling,
        createElement: hostCreateElement,
        patchProp: hostPatchProp
    } = options

    const unmountChildren = (children) => {
        for (let i = 0; i < children.length; i++) {
            const child = children[i]
            unmount(child)
        }
    }

    const unmount = (vnode) => {
        const { shapeFlag, children } = vnode

        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            unmountChildren(children)
        }
        hostRemove(vnode.el)
    }

    const mountChildren = (children, el) => {
        for (let i = 0; i < children.length; i++) {
            const child = children[i] = normalizeVNode(children[i])
            patch(null, child, el)
        }
    }

    const mountElement = (vnode, container, anchor) => {
        /**
         * 1.创建dom
         * 2.设置props
         * 3.挂载子节点
         */
        const { type, props, children, shapeFlag } = vnode

        const el = hostCreateElement(type)
        vnode.el = el

        if (props) {
            for (const key in props) {
                hostPatchProp(el, key, null, props[key])
            }
        }

        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            // 子节点是文本
            hostSetElementText(el, children)
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            // 子节点是数组
            mountChildren(children, el)
        }

        hostInsert(el, container, anchor)
    }

    const patchElement = (n1, n2) => {
        /**
         * 1. 复用dom元素
         * 2. 更新props
         * 3. 更新 children
         */
        // 1. 复用dom元素
        const el = (n2.el = n1.el)

        // 2. 更新props
        const oldProps = n1.props
        const newProps = n2.props

        patchProps(el, oldProps, newProps)

        // 3. 更新children
        patchChildren(n1, n2)
    }

    const patchChildren = (n1, n2) => {
        const el = n2.el
        /**
         * 1. 新节点的子节点是文本
         *  1.1 老的是数组
         *  1.2 老的也是文本
         * 2. 新节点的子节点是数组 / null
         *  2.1 老的是文本
         *  2.2 老的也是数组
         *  2.3 老的是null
         */
        const prevShapeFlag = n1.shapeFlag
        const shapeFlag = n2.shapeFlag

        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            // 新的是文本
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                // 老的是数组，把老的卸载掉
                unmountChildren(n1.children)
            }
            if (n1.children !== n2.children) {
                // 设置文本，如果n1, n2的 children不一样
                hostSetElementText(el, n2.children)
            }
        } else {
            // 老的可能是 数组 null 文本
            // 新的可能是 数组 null
            if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                // 老的是文本，把老的文本删除
                hostSetElementText(el, '')
                // 新的是数组
                if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                    mountChildren(n2.children, el)
                }
            } else {
                // 老的也是数组
                if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                    // 新的是数组
                    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                        // 全量Diff
                        patchKeyedChildren(n1.children, n2.children, el)
                    } else {
                        // 新的null 卸载老的数组
                        unmountChildren(n1.children)
                    }
                } else {
                    // 老的是null
                    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                        // 新的是数组，挂载新的
                        mountChildren(n2.children, el)
                    }
                }
            }
        }
    }

    const patchKeyedChildren = (c1, c2, container) => {
        /**
         * 全量diff
         * 1. 双端 diff
         *  1.1 头部对比
         *  1.2 尾部对比
         *  
         *  根据双端对比得出
         *  i > e1，表示老的少，新的多，需要挂载新的,范围是 i - e2
         *  i > e2，表示老的多，新的少，需要卸载老的,范围是 i - e1
         * 
         * 2. 乱序
         *  c1 => [a, b, c, d, e]
         *  c2 => [a, c, d, b ,e]
         */

        // 开始对比的下标
        let i = 0
        // 老 新子节点最后一个元素的下标
        let e1 = c1.length - 1
        let e2 = c2.length - 1
        /**
         * 1.1 头部对比
         *  c1 => [a, b]
         *  c2 => [a, b, c]
         * 
         * 开始时： i = 0, e1 = 1, e2 = 2
         * 结束时： i = 2, e1 = 1, e2 = 2 
         */
        while (i <= e1 && i <= e2) {
            const n1 = c1[i]
            const n2 = c2[i] = normalizeVNode(c2[i])

            // 如果 n1 n2 是同一个类型的子节点，就更新
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container)
            } else {
                break
            }

            i++
        }

        /**
         * 1.2 尾部对比
         *  c1 => [a, b]
         *  c2 => [c, a, b]
         * 开始时： i = 0, e1 = 1, e2 = 2
         * 结束时： i = 0, e1 = -1, e2 = 0
         */
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1]
            const n2 = c2[e2] = normalizeVNode(c2[e2])

            // 如果 n1 n2 是同一个类型的子节点，就更新
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container)
            } else {
                break
            }

            e1--
            e2--
        }

        if (i > e1) {
            /**
             * 表示老的少，新的多，需要挂载新的,范围是 i - e2
             */
            const nextPos = e2 + 1
            const anchor = nextPos < c2.length ? c2[nextPos].el : null
            while (i <= e2) {
                patch(null, c2[i] = normalizeVNode(c2[i]), container, anchor)
                i++
            }
        } else if (i > e2) {
            /**
             * 表示老的多，新的少，需要卸载老的,范围是 i - e1
             */
            while (i <= e1) {
                unmount(c1[i])
                i++
            }
        } else {
            /**
             * 乱序
             *  c1 => [a, b, c, d, e]
             *  c2 => [a, c, d, b ,e]
             *  开始时： i = 0, e1 = 4, e2 = 4
             *  双端对比完：i = 1, e1 = 3, e2 = 3
             * 
             *  找到key 相同的虚拟节点，让它们patch
             */

            // 老的子节点开始查找的位置
            let s1 = i
            // 新的子节点开始查找的位置
            let s2 = i

            const keyToNewIndexMap = new Map()

            const newIndexToOldIndexMap = new Array(e2 - s2 + 1)
            // -1 代表不需要计算
            newIndexToOldIndexMap.fill(-1)

            // 遍历新的 s2 - e2之间的节点，存储 key => index map
            for (let j = s2; j <= e2; j++) {
                const n2 = c2[j] = normalizeVNode(c2[j])
                keyToNewIndexMap.set(n2.key, j)
            }

            let pos = -1
            let moved = false // 是否需要移动
            /**
             * 遍历老的子节点（s1 - e1），查找这个key在新的里面有没有，有就 patch，没就卸载
             */
            for (let j = s1; j <= e1; j++) {
                const n1 = c1[j]
                const newIndex = keyToNewIndexMap.get(n1.key)
                if (newIndex != null) {
                    if (newIndex > pos) { // 每一次都比上一次大就说明是连续递增不需要计算了，否则true需要计算
                        pos = newIndex
                    } else {
                        moved = true
                    }
                    newIndexToOldIndexMap[newIndex] = j
                    patch(n1, c2[newIndex], container)
                } else {
                    unmount(n1)
                }
            }

            // console.log(newIndexToOldIndexMap) // moved false代表不需要移动
            const newIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : []
            const sequenceSet = new Set(newIndexSequence)
            // console.log(newIndexSequence)

            /**
             * 遍历新的子元素，调整顺序
             */
            for (let j = e2; j >= s2; j--) {
                const n2 = c2[j]
                // 拿到它的下一个子元素，依次倒序插入
                const anchor = c2[j + 1]?.el || null
                if (n2.el) {
                    // 需要移动再进去
                    if (moved) {
                        // 不在最长递增子序列中表示需要移动
                        if (!sequenceSet.has(j)) {
                            hostInsert(n2.el, container, anchor)
                        }
                    }
                } else {
                    // 新节点
                    patch(null, n2, container, anchor)
                }
            }
        }

        console.log('i', i, 'e1', e1, 'e2', e2)
    }

    const patchProps = (el, oldProps, newProps) => {
        /**
         * 1. 老的全删掉
         * 2. 新的props设置
         */
        if (oldProps) {
            for (const key in oldProps) {
                hostPatchProp(el, key, oldProps[key], null)
            }
        }
        if (newProps) {
            for (const key in newProps) {
                hostPatchProp(el, key, null, newProps[key])
            }
        }
    }

    const render = (vnode, container) => {
        /**
         * 1. 挂载
         * 2. 更新
         * 3. 卸载
         */

        if (vnode === null) {
            if (container._vnode) {
                //卸载
                unmount(container._vnode)
            }
        } else {
            // 挂载 更新
            patch(container._vnode || null, vnode, container)
        }

        container._vnode = vnode
    }

    return {
        render,
        createApp: createAppAPI(render)
    }
}

// 求最长递增子序列
function getSequence(arr) {
    const result = []

    // 记录前驱节点
    const map = new Map()

    for (let i = 0; i < arr.length; i++) {
        const item = arr[i]

        // -1 不在计算范围内
        if (item === -1 || item === undefined) {
            continue
        }

        if (result.length === 0) {
            // 如果result里面一个都没有，放入索引
            result.push(i)
            continue
        }

        const lastIndex = result[result.length - 1]
        const lastItem = arr[lastIndex]

        // 如果当前大于上一个，放入索引 同时记录前驱节点
        if (item > lastItem) {
            result.push(i)
            map.set(i, lastIndex)
            continue
        }

        // item 小于 lastItem, 查找最合适的位置
        let left = 0
        let right = result.length - 1
        let middle

        while (left < right) {
            middle = (left + right) >> 1
            if (arr[result[middle]] < item) {
                left = middle + 1
            } else {
                right = middle
            }
        }

        if (arr[result[left]] > item) {
            result[left] = i
            if (left > 0) {
                map.set(i, result[left - 1])
            }
        }
    }

    // 反向追溯，纠正顺序
    let l = result.length
    let last = result[l - 1]

    while (l > 0) {
        l--
        result[l] = last
        last = map.get(last)
    }

    return result
}