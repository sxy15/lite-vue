import { hasChanged } from "@vue/shared"
import { Dep, createDep } from "./dep"
import { activeEffect, trackEffects, triggerEffects } from "./effect"
import { toReactive } from "./reactive"

export interface Ref<T = any> {
  value: T
}

export function isRef(r: any): r is Ref {
  return r ? r.__v_isRef === true : false
}

export function ref(val?: unknown) {
  return createRef(val, false)
}

function createRef(rawValue: unknown, shallow: boolean) {
  if(isRef(rawValue)) {
    return rawValue
  }

  return new RefImpl(rawValue, shallow)
}

class RefImpl<T> {
  private _rawValue: T
  private _value: T

  public dep?: Dep = undefined

  public readonly __v_isRef = true

  constructor(value: T, public readonly __v__isShallow: boolean) {
    this._rawValue = value
    this._value = __v__isShallow ? value : toReactive(value)
  }

  get value() {
    trackRefValue(this)
    return this._value
  }
  
  set value(newVal) {
    if(hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal
      this._value = toReactive(newVal)

      triggerRefValue(this)
    }
  }
}

export function trackRefValue(ref) {
  if(activeEffect) {
    trackEffects(ref.dep || (ref.dep = createDep()))
  }
}

export function triggerRefValue(ref) {
  if(ref.dep) {
    triggerEffects(ref.dep)
  }
}