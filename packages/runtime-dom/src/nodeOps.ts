/**
 * dom操作的api
 */
export const nodeOps = {
    insert(el, parent, anchor) {
        parent.insertBefore(el, anchor || null)
    },
    createElement(type) {
        return document.createElement(type)
    },
    remove(el) {
        const parentNode = el.parentNode
        if (parentNode) {
            parentNode.removeChild(el)
        }
    },
    setElementText(node, text) {
        return (node.textContent = text)
    },
    createText(text) {
        return document.createTextNode(text)
    },
    setText(node, text) {
        return (node.nodeValue = text)
    },
    parentNode(el) {
        return el.parentNode
    },
    nextSibling(el) {
        return el.nextSibling
    },
    querySelector(selector) {
        return document.querySelector(selector)
    }
}