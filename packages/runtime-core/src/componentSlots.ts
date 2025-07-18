import { isFunction, ShapeFlags } from "@vue/shared"

export function initSlots(instance) {
    const { vnode, slots } = instance

    if (vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
        const { children } = vnode
        if (children) {
            for (const key in children) {
                const slot = children[key]
                if (isFunction(slot)) {
                    slots[key] = slot
                }
            }
        }
    }
}

export function updateSlots(instance, vnode) {
    const { slots } = instance
    const { children } = vnode

    if (vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
        if (children) {
            for (const key in children) {
                const slot = children[key]
                if (isFunction(slot)) {
                    slots[key] = slot
                }
            }
        }

        // 旧的插槽不存在了，需要删除
        for (const key in slots) {
            if (!(key in children)) {
                delete slots[key]
            }
        }
    }
}
