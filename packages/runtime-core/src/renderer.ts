import { EMPTY_OBJ, ShapeFlags, isString } from "@vue/shared"
import { Comment, Fragment, Text, isSameVNodeType } from "./vnode"
import { normalizeVNode } from "./componentRenderUtils"

export interface RendererOptions {
  // 为指定的 element 的 props 打补丁
  patchProp(el: Element, key: string, prevValue: any, nextValue: any): void
  // 为指定的 Element 设置 text
  setElementText(node: Element, text: string): void
  // 插入指定的el到parent中， anchor 表示插入的位置，即锚点
  insert(el: Element, parent: Element, anchor?: Element | null): void
  // 创建element
  createElement(type: string): Element
  remove(el: Element): void
  createText(text: string): Text
  setText(node: Text, text: string): void
  createComment(text: string): Comment
}

export function createRenderer(options: RendererOptions) {
  return baseCreateRenderer(options)
}

function baseCreateRenderer(options: RendererOptions): any {
  const {
    insert: hostInsert,
    patchProp: hostPatchProp,
    setElementText: hostSetElementText,
    createElement: hostCreateElement,
    remove: hostRemove,
    createText: hostCreateText,
    setText: hostSetText,
    createComment: hostCreateComment
   } = options

  const processFragment = (oldVNode, newVNode, container, anchor) => {
    if (oldVNode == null) {
      mountChildren(newVNode.children, container, anchor)
    } else {
      patchChildren(oldVNode, newVNode, container, anchor)
    }
  }

  const processCommentNode = (oldVNode, newVNode, container, anchor) => {
    if(oldVNode == null) {
    newVNode.el = hostCreateComment(newVNode.children as string)
    hostInsert(newVNode.el, container, anchor)
    } else {
      newVNode.el = oldVNode.el
    }
  }

  const processText = (oldVNode, newVNode, container, anchor) => {
  if(oldVNode == null) {
      newVNode.el = hostCreateText(newVNode.children as string)
      hostInsert(newVNode.el, container, anchor)
    } else {
      const el = (newVNode.el = oldVNode.el)
      if(newVNode.children !== oldVNode.children) {
        hostSetText(el, newVNode.children as string)
     }
    }
  }

  const processElement = (oldVNode, newVNode, container, anchor) => {
    if(oldVNode == null) {
      // 直接挂载
      mountElement(newVNode, container, anchor)
    } else {
      // 更新
      patchElement(oldVNode, newVNode)
    }
  }

  const mountElement = (vnode, container, anchor) => {
    const { type, props, shapeFlag } = vnode
    const el = (vnode.el = hostCreateElement(type)) 

    if(shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, vnode.children as string)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      
    }

    if(props) {
      for(const key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }

    hostInsert(el, container, anchor)
  }

  const patchElement = (oldVNode, newVNode) => {
    const el = (newVNode.el = oldVNode.el)

    const oldProps = oldVNode.props || EMPTY_OBJ
    const newProps = newVNode.props || EMPTY_OBJ

    patchChildren(oldVNode, newVNode, el, null)

    patchProps(el, newVNode, oldProps, newProps)
  }

  const mountChildren = (children, container, anchor) => {
    // 处理 Cannot assign to read only property '0' of string 'xxx'
    if (isString(children)) {
      children = children.split('')
    }
    for (let i = 0; i < children.length; i++) {
      const child = (children[i] = normalizeVNode(children[i]))
      console.log(child)
      patch(null, child, container, anchor)
    }
  }

  const patchChildren = (oldVNode, newVNode, container, anchor) => {
    const c1 = oldVNode && oldVNode.children
    const prevShapeFlag = oldVNode ? oldVNode.shapeFlag : 0

    const c2 = newVNode && newVNode.children
    const { shapeFlag } = newVNode

    if(shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 移除旧的 children

      }

      if(c2 !== c1) {
        // 挂载新子节点的文本
        hostSetElementText(container, c2 as string)
      }
    } else {
      if(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if(shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // diff
        } else {
          // 卸载
        }
      } else {
        if(prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          // 移除旧的 children
          hostSetElementText(container, '')
        }

        if(shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 挂载新的 children
        }
      }
    }


  }

  const patchProps = (el: Element, key, oldProps, newProps) => {
    if(oldProps !== newProps) {
      for (const key in newProps) {
        const prev = oldProps[key]
        const next = newProps[key]

        if(prev !== next) {
          hostPatchProp(el, key, prev, next)
        }
      }

      // 移除旧的 & 不在新的 props 中的 props
      if(oldProps !== EMPTY_OBJ) {
        for(const key in oldProps) {
          if(!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null)
          }
        }
      }
    }
  }

  const patch = (oldVNode, newVNode, container, anchor = null) => {
    if(oldVNode === newVNode) {
      return
    }

    if(oldVNode && !isSameVNodeType(oldVNode, newVNode)) {
      unmount(oldVNode)
      oldVNode = null
    }

    const { type, shapeFlag } = newVNode

    switch (type) {
      case Text:
        processText(oldVNode, newVNode, container, anchor)
        break
      case Comment:
        processCommentNode(oldVNode, newVNode, container, anchor)
        break
      case Fragment:
        processFragment(oldVNode, newVNode, container, anchor)
        break
      default:
        if(shapeFlag & ShapeFlags.ELEMENT) {
          processElement(oldVNode, newVNode, container, anchor)
        } else if (shapeFlag & ShapeFlags.COMPONENT) {

        }
    }
  }

  const unmount = (vnode) => {
    hostRemove(vnode.el)
  }

  const render = (vnode, container) => {
    if(vnode === null) {
      // unmount
      if(container._vnode) {
        unmount(container._vnode)
      }
    } else {
      patch(container._vnode || null, vnode, container)
    }

    container._vnode = vnode // 把 vnode 保存为老的 vnode
  }

  
  
  return {
    render
  }
}