import { isFunction } from "@vue/shared"
import { Dep } from "./dep"
import { ReactiveEffect } from "./effect"
import { trackRefValue, triggerRefValue } from "./ref"

export class ComputedRefImpl<T> {
  public dep?: Dep = undefined
  private _value!: T
  public readonly __v_isRef = true

  public readonly effect: ReactiveEffect<T>
  public _dirty = true

  constructor(getter) {
    this.effect = new ReactiveEffect(getter, () => {
      if(!this._dirty) {
        this._dirty = true
        triggerRefValue(this) // 触发的没有scheduler的effect
      }
    })
    this.effect.computed = this
  }

  get value() {
    trackRefValue(this) // 收集的没有scheduler的effect
    if(this._dirty) {
      this._dirty = false
      this._value = this.effect.run() // run的执行会让reactive 收集到带scheduler的effect
    }
    return this._value
  }
}

export function computed(getterOrOptions) {
  let getter

  const onlyGetter = isFunction(getterOrOptions)

  if (onlyGetter) {
    getter = getterOrOptions
  }

  const cRef = new ComputedRefImpl(getter)

  return cRef
}