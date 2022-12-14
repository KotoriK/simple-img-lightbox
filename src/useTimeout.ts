import { onCleanup } from "solid-js"

export default function useTimeout() {
    let timers: number[] = []
    let timersTicked : number[] = []
    const clear = () => {
        timers.forEach(id => clearTimeout(id))
        timers = []
        timersTicked = []
    }
    onCleanup(clear)
    const set = (handler: () => any, timeout?: number) => {
        const timer = setTimeout(
            () => {
                handler()

                if(timers.length=== timersTicked.length +1 ) {
                    clear()
                }else{
                    timersTicked.push(timer)
                }
            }, timeout)
        timers.push(timer)
    }

    return [set, clear] as const
}