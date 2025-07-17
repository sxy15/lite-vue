function getSequence(arr) {
    const result = []

    // 记录前驱节点
    const map = new Map()

    for (let i = 0; i < arr.length; i++) {
        const item = arr[i]

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