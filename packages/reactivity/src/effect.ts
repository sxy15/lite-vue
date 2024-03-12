import { isArray } from "@vue/shared"
import { Dep, createDep } from "./dep"
import { ComputedRefImpl } from "./computed"

export type EffectScheduler = (...args: any[]) => any
type KeyToDepMap = Map<any, Dep>
const targetMap = new WeakMap<any, KeyToDepMap>()

export function effect<T = any>(fn: () => T) {
  const _effect = new ReactiveEffect(fn)

  _effect.run()
}

export let activeEffect: ReactiveEffect | undefined

export class ReactiveEffect<T = any> {
  computed?: ComputedRefImpl<T>

  constructor(
    public fn: () => T, 
    public scheduler: EffectScheduler | null = null
  ) {

  }

  run() {
    activeEffect = this

    return this.fn()
  }
}

export function track(target: object, key: unknown) {
  if(!activeEffect) return 
  let depsMap = targetMap.get(target)
  if(!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  let dep = depsMap.get(key)
  if(!dep) {
    depsMap.set(key, (dep = createDep()))
  }

  trackEffects(dep) // 将当前的 activeEffect 添加到 dep 中
}

export function trackEffects(dep: Dep) {
  dep.add(activeEffect!)
}

export function trigger(target: object, key: unknown, value: unknown) {
  const depsMap = targetMap.get(target)

  if(!depsMap) return

  const dep = depsMap.get(key) as Dep

  if(!dep) return

  triggerEffects(dep) // 依次执行 dep 中的 effect
}

export function triggerEffects(dep: Dep) {
  const effects = isArray(dep) ? dep : [...dep]

  for(let effect of effects) {
    if(effect.computed) {
      triggerEffect(effect)
    }
  }

  for(let effect of effects) {
    if(!effect.computed) {
      triggerEffect(effect)
     }
  }
}

export function triggerEffect(effect: ReactiveEffect) {
  if(effect.scheduler) {
    effect.scheduler()
  } else {
    effect.run()
  }
}