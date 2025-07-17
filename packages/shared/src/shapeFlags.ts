export enum ShapeFlags {
    // 表示dom元素
    ELEMENT = 1, // 1
    // 表示函数组件
    FUNCTIONAL_COMPONENT = 1 << 1, //10
    // 表示有状态的组件（状态，生命周期等）
    STATEFUL_COMPONENT = 1 << 2, // 100
    // 表示该节点的子节点是纯文本
    TEXT_CHILDREN = 1 << 3, // 1000
    // 表示该节点的子节点是数组形式（多个子节点）
    ARRAY_CHILDREN = 1 << 4, // 10000
    // 表示该节点的子节点是插槽
    SLOTS_CHILDREN = 1 << 5, // 100000
    // 表示该节点的子节点是teleport组件
    TELEPORT = 1 << 6, // 1000000
    // 表示该节点的子节点是suspense组件
    SUSPENSE = 1 << 7, // 10000000
    // 表示该组件应当被keep-alive
    COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8, // 100000000
    // 表示该组件已经被keep-alive
    COMPONENT_KEPT_ALIVE = 1 << 9, // 1000000000
    // 表示组件类型，有状态组件和无状态组件的组合
    COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT,
}