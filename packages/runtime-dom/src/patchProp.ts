import { isOn } from "@vue/shared"
import { patchClass } from "./modules/patchClass"
import { patchStyle } from "./modules/patchStyle"
import { patchEvent } from "./modules/events"
import { patchAttr } from "./modules/patchAttr"

/**
 * 1. class
 * 2. style
 * 3. event
 * 4. attrs
 * @param el 
 * @param key 
 * @param prevValue 
 * @param nextValue 
 * @returns 
 */
export function patchProp(el, key, prevValue, nextValue) {
    // console.log(el, key, prevValue, nextValue)

    if (key === 'class') {
        return patchClass(el, nextValue)
    }

    if (key === 'style') {
        return patchStyle(el, prevValue, nextValue)
    }

    if (isOn(key)) {
        return patchEvent(el, key, prevValue, nextValue)
    }

    patchAttr(el, key, nextValue)
}
