import { css } from "@emotion/css";
import { awaitImage } from "await-res";
import { createEffect, createMemo, createSignal, onCleanup, onMount, Show, splitProps } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { Modal } from "./Modal";

export interface FullscreenImageProp extends Omit<JSX.ImgHTMLAttributes<HTMLCanvasElement>, 'children'> {
    /**
     * 作为位置参照的元素
     */
    img?: HTMLImageElement
    slotAfter?: JSX.Element
    slotBefore?: JSX.Element
}
const modalPadding = 10

const styleBase = css({
    position: 'absolute',
    top: 0, left: 0,
    userSelect: 'none',
    transformOrigin: 'left top'
})
function useDocumentClientSize() {
    const [size, setSize] = createSignal<[number, number]>([0, 0])
    const callback = () => {
        setSize([document.documentElement.clientWidth, document.documentElement.clientHeight])
    }
    onMount(() => {
        callback()
        window.addEventListener('resize', callback)
    })
    onCleanup(() => {
        window.removeEventListener('resize', callback)
    })

    return size
}
export default function FullscreenImage(props: FullscreenImageProp) {
    const [localProp, propForward] = splitProps(props, ['img', 'slotAfter', 'slotBefore'])

    const [fullscreen, setFullscreen] = createSignal(false)
    const [rect, setRect] = createSignal<DOMRect>()
    const [enableTransition, setEnableTransition] = createSignal(false)
    const clientSize = useDocumentClientSize()
    const refreshPos = () => {
        setRect(localProp.img?.getBoundingClientRect())
    }

    const targetSize = createMemo(() => {
        if (!localProp.img) return [0, 0] as const
        const { naturalWidth, naturalHeight } = localProp.img
        const [clientWidth, clientHeight] = clientSize()
        let targetHeight = clientHeight - (modalPadding * 4)
        let targetWidth = targetHeight * naturalWidth / naturalHeight

        if (targetWidth > clientWidth) {
            targetWidth = clientWidth - (modalPadding * 4)
            targetHeight = targetWidth / naturalWidth * naturalHeight
        }
        return [targetWidth, targetHeight] as const
    })
    const showSlot = () => (!enableTransition()) && fullscreen()

    let ref: HTMLCanvasElement | undefined

    createEffect((prev) => {
        if (localProp.img !== prev && localProp.img) {
            const ctx = ref!.getContext('2d')!
            setEnableTransition(false)
            awaitImage(localProp.img!)
                .then(() => {
                    ctx.drawImage(localProp.img!, 0, 0, ...targetSize()!)
                    if (!fullscreen()) {
                        refreshPos()
                        // 等待前述样式提交
                        setTimeout(() => {
                            setEnableTransition(true)
                            setFullscreen(true)
                        }, 0)
                    }
                })
            ctx.clearRect(0, 0, ref!.width, ref!.height)
        }
    }, localProp.img)
    createEffect(() => {
        if (!fullscreen()) return
        const [targetWidth, targetHeight] = targetSize()!
        const ctx = ref!.getContext('2d')!
        ctx.clearRect(0, 0, ref!.width, ref!.height)
        ref!.width = targetWidth
        ref!.height = targetHeight
        ctx.drawImage(props.img!, 0, 0, targetWidth, targetHeight)
    })
    createEffect(() => {
        if (fullscreen()) {
            window.addEventListener('scroll', refreshPos)
            onCleanup(() => {
                window.removeEventListener('scroll', refreshPos)
            })
        }
    })

    return <Modal
        open={fullscreen()}
        onClose={() => {
            refreshPos()
            setEnableTransition(true)
            setFullscreen(false)
        }}
        delay={200}
    >
        <Show when={showSlot()} > {localProp.slotBefore}</Show>
        <canvas
            ref={ref}
            class={styleBase}
            style={rect() && targetSize() ?
                {
                    get transition() { return enableTransition() ? 'transform 0.2s ease-in-out' : undefined },
                    get transform() {
                        const [targetWidth, targetHeight] = targetSize()!
                        if (fullscreen()) {
                            const [clientWidth, clientHeight] = clientSize()
                            return `translate(${(clientWidth - targetWidth) / 2}px,${(clientHeight - targetHeight) / 2}px)`
                        } else {
                            const { naturalWidth, naturalHeight } = localProp.img!
                            const ratio = naturalWidth / naturalHeight

                            const height = (rect()!.height)
                            const scaleX = ratio * height
                                / targetWidth
                            const scaleY = height / targetHeight
                            return `translate(${rect()!.x}px,${rect()!.y}px) scale(${scaleX},${scaleY})`
                        }
                    },
                } : undefined}
            onClick={(e) => e.stopPropagation()}
            onTransitionEnd={() => {
                setEnableTransition(false)
            }}
            {...propForward} />
        <Show when={showSlot()} > {localProp.slotAfter}</Show>
    </Modal>
}
