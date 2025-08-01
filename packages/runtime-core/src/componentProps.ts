import { hasOwn, isArray } from "@vue/shared"
import { reactive } from "@vue/reactivity"

export const normalizePropsOptions = (props = {}) => {
    /**
     * 数组转换为对象
     */
    if (isArray(props)) {
        props = props.reduce((acc, cur) => {
            acc[cur] = {}
            return acc
        }, {})
    }

    return props
}

function setFullProps(instance, rawProps, props, attrs) {
    const propsOptions = instance.propsOptions

    if (rawProps) {
        for (const key in rawProps) {
            const value = rawProps[key]
            if (hasOwn(propsOptions, key)) {
                props[key] = value
            } else {
                attrs[key] = value
            }
        }
    }
}

export const initProps = (instance) => {
    const { vnode } = instance

    const rawProps = vnode.props

    const props = {}
    const attrs = {}

    setFullProps(instance, rawProps, props, attrs)

    // props是响应式的 需要reactive
    instance.props = reactive(props)
    instance.attrs = attrs
}

export const updateProps = (instance, nextVNode) => {
    const { props, attrs } = instance
    /**
     * props = {msg: 'hello', age: 8}
     * rawProps = {msg: 'hello'}
     */
    const rawProps = nextVNode.props

    setFullProps(instance, rawProps, props, attrs)

    /**
     * 删除之前有，现在没的
     */
    for (const key in props) {
        if (!hasOwn(rawProps, key)) {
            delete props[key]
        }
    }

    for (const key in attrs) {
        if (!hasOwn(rawProps, key)) {
            delete attrs[key]
        }
    }
}