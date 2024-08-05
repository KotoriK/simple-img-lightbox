import { onCleanup } from "solid-js"

export default function useTimeout() {
    let timer:ReturnType<typeof setTimeout> | undefined
    const clear = () => {
        clearTimeout(timer)
    }
    const set = (handler: () => any, timeout?: number) => {
        clear()
        timer = setTimeout(handler,timeout)
    }
    onCleanup(clear)

    return set
}