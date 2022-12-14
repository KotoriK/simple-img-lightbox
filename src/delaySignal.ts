import { Accessor, createComputed, createSignal, on, onCleanup, untrack } from "solid-js";

export default function delaySignal(readOnlySignal: Accessor<boolean>, delay: number) {
    const [deferred, setDeferred] = createSignal(readOnlySignal())
    let timer: number
    createComputed(
        on(readOnlySignal,
            () => {
                clearTimeout(timer)
                timer = setTimeout(() => {
                    setDeferred(untrack(readOnlySignal))
                }, delay)
            }, { defer: true }))
    onCleanup(() => {
        clearTimeout(timer)
    })
    return deferred
}