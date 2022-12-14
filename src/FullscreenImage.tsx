import { css } from "@emotion/css";
import { awaitImage } from "await-res";
import { batch, createComputed, createMemo, createSignal, on, onCleanup, onMount, splitProps } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import delaySignal from "./delaySignal";
import { Modal } from "./Modal";
export interface FullscreenImageProp extends Omit<JSX.ImgHTMLAttributes<HTMLImageElement>, 'children'> {
    /**
     * 作为位置参照的元素
     */
    img?: HTMLImageElement
}
const modalPadding = 10

const styleBase = css({
    position: 'absolute',
    top: 0, left: 0,
    userSelect: 'none',
    "&::after": {
        background: 'red',
        width: '100vw',
        height: '100vh',
        position: 'absolute',
        top: 0,
        left: 0,
        content: '""'
    }
})

export default function FullscreenImage(props: FullscreenImageProp) {
    const [fullscreen, setFullscreen] = createSignal(false)

    const [rect, setRect] = createSignal<DOMRect>()
    const [targetSize, setTargetSize] = createSignal<[number, number]>()

    const [localProp, propForward] = splitProps(props, ['img'])
    /**
     * 图片原始纵横比下的宽度
     */
    const [width, setWidth] = createSignal(0)
    const refreshPos = () => {
        setRect(localProp.img?.getBoundingClientRect())
    }
    const resize = () => {
        const height = rect()!.height//要求与stillStyle一致
        const { naturalWidth, naturalHeight } = localProp.img!

        let targetHeight: number
        let targetWidth: number
        targetHeight = document.documentElement.clientHeight - (modalPadding * 4)
        targetWidth = targetHeight * naturalWidth / naturalHeight

        const availWidth = document.documentElement.clientWidth
        if (targetWidth > availWidth) {
            targetWidth = availWidth - (modalPadding * 4)
            targetHeight = targetWidth / naturalWidth * naturalHeight
        }
        batch(() => {
            setWidth(height * naturalWidth / naturalHeight)
            setTargetSize([targetWidth, targetHeight])
        })
    }
    const refresh = () => {
        if (!localProp.img) return
        batch(() => {
            refreshPos();
            resize()
        })
    }
    const open = () => {
        //if (!isImageReady()) return
        refresh()
        window.setTimeout(() => {
            // 等待style提交到浏览器并生效
            setEnableTransition(true)
            setFullscreen(true)
        })
    }
    const [enableTransition, setEnableTransition] = createSignal(false)
    const showImage = delaySignal(fullscreen, 100)
    createComputed(
        on(() => localProp.img,
            () => {
                localProp.img && awaitImage(localProp.img).then(open)
            }, { defer: true }))
    onMount(() => {
        window.addEventListener('scroll', refreshPos)
        window.addEventListener('resize', refresh)
    })
    onCleanup(() => {
        window.removeEventListener('scroll', refreshPos)
        window.removeEventListener('resize', refresh)
    })
    const style = createMemo(() => {
        if (!rect() || !targetSize()) {
            return undefined
        }
        const height = (rect()!.height)
        const targetWidth = targetSize()![0]
        const targetHeight = targetSize()![1]
        const scaleX = width()
            / targetWidth
        const scaleY = height / targetHeight
        return {
            transform: showImage() ? `translate(${(document.documentElement.clientWidth - targetWidth) / 2}px,${(document.documentElement.clientHeight - targetHeight) / 2}px)`
                : `translate(${rect()!.x}px,${rect()!.y}px) scale(${scaleX},${scaleY})`,
            width: `${targetWidth}px`,
            height: `${targetHeight}px`,
            'transform-origin': 'left top',
            transition: enableTransition() && 'all 0.3s ease-in-out',
        } as JSX.CSSProperties
    })

    // observable(style).subscribe(console.log)
    return <Modal
        open={fullscreen()}
        onClose={() => {
            setFullscreen(false)
        }}>
        <img
            style={style()}
            class={styleBase}
            onTransitionEnd={!fullscreen() ? (() => {
                setEnableTransition(false)
            }) : undefined}
            {...propForward} />
    </Modal>
}