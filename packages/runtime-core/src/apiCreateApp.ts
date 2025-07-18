import { h } from "./h"

export function createAppAPI(render) {
    return function createApp(rootComponent, rootProps) {
        const app = {
            _container: null,
            mount(container) {
                const vnode = h(rootComponent, rootProps)
                render(vnode, container)
                this._container = container
            },
            unmount() {
                render(null, this._container)
                this._container = null
            }
        }

        return app
    }
}