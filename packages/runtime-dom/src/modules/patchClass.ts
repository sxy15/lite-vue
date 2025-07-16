export function patchClass(el, value) {
    if (value == undefined) { // null undefined
        el.className = value
    } else {
        el.removeAttribute('class')
    }
}