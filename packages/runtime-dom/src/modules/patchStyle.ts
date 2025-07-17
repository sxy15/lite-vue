export function patchStyle(el, prevValue, nextValue) {
    const style = el.style
    /**
     * 新样式设置到style
     */
    if (nextValue) {
        for (const key in nextValue) {
            style[key] = nextValue[key]
        }
    }

    /**
     * 移除对比后不存在的样式
     */
    if (prevValue) {
        for (const key in prevValue) {
            if (!nextValue?.[key]) {
                style[key] = null
            }
        }
    }
}