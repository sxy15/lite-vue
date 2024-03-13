import { isArray, isFunction, isObject, isString, normalizeClass } from "@vue/shared";
import { ShapeFlags } from "@vue/shared";

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')
export const Comment = Symbol('Comment')

export interface VNode {
  __v_isVNode: true;
  key?: any;
  type: any;
  props: any;
  children: any;
  shapeFlag: number;
}

export function isVNode(v: any): v is VNode {
  return v ? v.__v_isVNode === true : false
}

export function createVNode(type, props?, children?): VNode {

  if(props) {
    let {class: klass, style} = props

    if(klass && !isString(klass)) {
      props.class = normalizeClass(klass)
    }
  }

  const shapeFlag = isString(type) 
    ? ShapeFlags.ELEMENT 
    : isObject(type) 
    ? ShapeFlags.STATEFUL_COMPONENT 
    : 0

  return createBaseVNode(type, props, children, shapeFlag)
} 

function createBaseVNode(type, props, children, shapeFlag: number): VNode {
  const vnode = {
    __v_isVNode: true,
    type,
    props,
    children,
    shapeFlag
  } as VNode

  normalizeChildren(vnode, children)

  return vnode
}

export function normalizeChildren(vnode: VNode, children: unknown) {
  let type = 0

  if(children == null) {
    children = null
  } else if (isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN
  } else if (typeof children === 'object') {
    
  } else if (isFunction(children)) {

  } else {
    // string 
    children = String(children)
    type = ShapeFlags.TEXT_CHILDREN
  }

  vnode.children = children
  vnode.shapeFlag |= type
}

export function isSameVNodeType(n1: VNode, n2: VNode) {
  return n1.type === n2.type && n1.key === n2.key
}