const veiKey = Symbol('_vei')
/**
 * const fn1 = () => { console.log('prev')}
 * const fn2 = () => { console.log('next')}
 * click el.addEventListener('click', (e) => { fn1 or fn2 })
 */
export function patchEvent(el, rawName, prevValue, nextValue) {
    const name = rawName.slice(2).toLowerCase()

    const invokers = (el[veiKey] ??= {}) // el._vei = el._vei ?? {}
    const existingInvoker = invokers[rawName]

    // 如果现在有事件绑定
    if (nextValue) {
        if (existingInvoker) {
            existingInvoker.value = nextValue
            return
        }

        const invoker = createInvoker(nextValue)

        invokers[rawName] = invoker

        el.addEventListener(name, invoker)
    } else {
        // 现在没事件，之前有事件，就移除
        if (existingInvoker) {
            el.removeEventListener(name, invokers[rawName])
            invokers[rawName] = undefined
        }
    }
}

function createInvoker(value) {
    const invoker = (e) => {
        invoker.value(e)
    }
    invoker.value = value
    return invoker
}
