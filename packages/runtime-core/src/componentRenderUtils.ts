import { createVNode } from "./vnode"

export function normalizeVNode(child) {
	if (typeof child === 'object') {
		return cloneIfMounted(child)
	} else {
		return createVNode(Text, null, String(child))
	}
}

/**
 * clone VNode
 */
export function cloneIfMounted(child) {
	return child
}