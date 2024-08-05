import { css } from "@emotion/css";
import { awaitImage } from "await-res";
import { batch, createEffect, createMemo, createRenderEffect, createSignal, onCleanup, onMount, Show, splitProps, untrack } from "solid-js";
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
        if (!localProp.img) return
        setRect(localProp.img?.getBoundingClientRect())
    }

    /**
    * 图片原始纵横比下的宽度
    */
    const width = () => {
        if (!rect()) return 0
        const height = rect()!.height//要求与stillStyle一致
        const { naturalWidth, naturalHeight } = localProp.img!
        return height * naturalWidth / naturalHeight
    }
    const targetSize = createMemo(() => {
        if (!localProp.img) return [0, 0] as const
        const { naturalWidth, naturalHeight } = localProp.img
        const [clientWidth, clientHeight] = clientSize()
        let targetHeight: number
        let targetWidth: number
        targetHeight = clientHeight - (modalPadding * 4)
        targetWidth = targetHeight * naturalWidth / naturalHeight

        const availWidth = clientWidth
        if (targetWidth > availWidth) {
            targetWidth = availWidth - (modalPadding * 4)
            targetHeight = targetWidth / naturalWidth * naturalHeight
        }
        return [targetWidth, targetHeight] as const
    })
    const showSlot = () => (!enableTransition()) && fullscreen()

    let ref: HTMLCanvasElement | undefined

    createEffect((prev) => {
        if (props.img !== prev && props.img) {
            const ctx = ref!.getContext('2d')!

            awaitImage(props.img!)
                .then(() => {
                    setEnableTransition(false)
                    refreshPos()
                    ctx.drawImage(props.img!, 0, 0, ...targetSize()!)
                    if (!fullscreen()) {
                        batch(() => {
                            setEnableTransition(true)
                            setFullscreen(true)
                        })
                    }
                })
            ctx.clearRect(0, 0, ref!.width, ref!.height)
        }
    }, props.img)
    createEffect(()=>{
        if(!fullscreen()) return
        const ctx = ref!.getContext('2d')!
        const [targetWidth, targetHeight] = targetSize()!
        ctx.clearRect(0, 0, ref!.width, ref!.height)
        ref!.width = targetWidth
        ref!.height = targetHeight
        ctx.drawImage(props.img!, 0, 0, ...targetSize()!)
    })
    onMount(() => {
        window.addEventListener('scroll', refreshPos)
    })
    onCleanup(() => {
        window.removeEventListener('scroll', refreshPos)
    })

    return <Modal
        open={fullscreen()}
        onClose={() => {
            setEnableTransition(true)
            setFullscreen(false)
        }}
        delay={200}
    >
        <Show when={showSlot()} > {localProp.slotBefore}</Show>

        <canvas
            ref={ref}
            style={rect() && targetSize() ?
                {
                    get width() { return targetSize()![0] + 'px' },
                    get height() { return targetSize()![1] + 'px' },
                    get transition() { return enableTransition() ? 'transform 0.2s ease-in-out' : undefined },
                    get transform() {
                        const [targetWidth, targetHeight] = targetSize()!
                        if (fullscreen()) {
                            return `translate(${(document.documentElement.clientWidth - targetWidth) / 2}px,${(document.documentElement.clientHeight - targetHeight) / 2}px)`
                        } else {
                            const height = (rect()!.height)
                            const scaleX = width()
                                / targetWidth
                            const scaleY = height / targetHeight
                            return `translate(${rect()!.x}px,${rect()!.y}px) scale(${scaleX},${scaleY})`
                        }
                    },
                } : undefined}
            class={styleBase}
            onClick={(e) => untrack(fullscreen) && e.stopPropagation()}
            onTransitionEnd={() => {
                setEnableTransition(false)
            }}
            {...propForward} />
        <Show when={showSlot()} > {localProp.slotAfter}</Show>
    </Modal>
}
