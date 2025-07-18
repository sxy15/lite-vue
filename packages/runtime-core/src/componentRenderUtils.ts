export function shouldUpdateComponent(n1, n2) {
    const { props: prevProps, children: prevChildren } = n1
    const { props: nextProps, children: nextChildren } = n2

    // 任意一个有插槽就需要更新
    if (prevChildren || nextChildren) {
        return true
    }

    // 老的没有，新的有就需要更新
    // 老的没有，新的没有就不需要更新
    if (!prevProps) {
        return !!nextProps
    }

    if (!nextProps) {
        // 老的有，新的没有需要更新
        return true
    }

    // 老的有，新的有需要更新
    return hasPropsChanged(prevProps, nextProps)
}

function hasPropsChanged(prevProps, nextProps) {
    const nextKeys = Object.keys(nextProps)
    const prevKeys = Object.keys(prevProps)

    // 长度不一致，需要更新
    if (nextKeys.length !== prevKeys.length) {
        return true
    }

    // 长度一致，但凡有一个不一样，需要更新
    for (const key of nextKeys) {
        if (prevProps[key] !== nextProps[key]) {
            return true
        }
    }

    return false
}
