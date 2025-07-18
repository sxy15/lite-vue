const resolvedPromise = Promise.resolve()

export function nextTick(fn) {
    if (fn) {
        return resolvedPromise.then(() => fn.call(this))
    }
    return resolvedPromise
}

export function queueJob(job) {
    resolvedPromise.then(() => {
        job()
    })
}