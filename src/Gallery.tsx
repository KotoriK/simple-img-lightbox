import { css } from "@emotion/css"
import { createContext, createEffect, createSignal, For, mergeProps, onCleanup, onMount, ParentProps, PropsWithChildren, Show } from "solid-js"
import { awaitImage } from 'await-res'
export interface GalleryProps {
    images: HTMLImageElement[]
    curr: HTMLImageElement
    onChange: (img: HTMLImageElement) => void
}
export type GalleryThumbnailProps = Pick<GalleryProps, 'images' | 'onChange'> & { currIndex: number }
const styleThumbnailRow = css({
    display: 'flex',
    gap: 8,
    "& >*": {
        contentVisibility: 'auto',
        containIntrinsicSize: "auto none auto 100px"
    }
})

function GalleryThumbnail(props: { img: HTMLImageElement, onClick: () => void }) {
    let ref: HTMLCanvasElement | undefined
    createEffect(() => {
        const currImg = props.img
        awaitImage(props.img).then(() => {
            if (currImg !== props.img) return
            const ctx = ref!.getContext('2d')!
            const aspectRatio = props.img.naturalWidth / props.img.naturalHeight
            const nextWidth = ref!.height * aspectRatio
            ref!.width = nextWidth
            ctx.clearRect(0, 0, nextWidth, 100)
            ctx.drawImage(props.img, 0, 0, nextWidth, 100)
        })
    })
    return <canvas ref={ref} onClick={props.onClick} height={100} />
}
function GalleryThumbnails(props: GalleryThumbnailProps) {
    const [centerAt, setCenterAt] = createSignal(0)
    return <div class={styleThumbnailRow}
        onclick={e => e.stopPropagation()}
        onScroll={e => {
            console.log(e)
            e.preventDefault()
            e.stopPropagation()
            setCenterAt(prev => prev + e.deltaY)
        }}
        style={{
            transform: `translateX(${centerAt()}px)`,
        }}
    >
        <For each={props.images}>{img => <GalleryThumbnail img={img} onClick={() => props.onChange(img)} />}</For>
    </div>
}
const styleButton = css({
    backgroundColor: 'rgb(0,0,0,0.5)',
    borderRadius: 8,
    color: '#fff',

    border: 'none',
    transitionDuration: '.2s',
    transitionProperty: 'background-color,color',
    fontSize: 24,
    fontWeight: 'bold',

    position: 'absolute',
    left: 0,
    "&[aria-disabled]": {
        color: 'gray'
    },
    "&:hover:not([aria-disabled])": {
        backgroundColor: 'rgb(0,0,0,0.7)',

    },
    "&[data-right]": {
        left: 'unset',
        right: 0,
    }
})

function GalleryMoveButton(props: { toRight?: boolean, disabled?: boolean, onClick: (e: MouseEvent) => void }) {
    return <button
        aria-disabled={props.disabled || undefined}
        class={styleButton}
        data-right={props.toRight || undefined}
        onClick={props.disabled ? undefined : props.onClick}

    >{props.toRight ? "►" : "◄"}</button>

}
const styleIndicator = css({
    position: 'absolute',
    bottom: 0,
    right: 0,
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: '0.5rem',
    borderRadius: '0.5rem',

})
function PositionIndicator(props: { curr: number, total: number, delta?: number }) {
    return <div class={styleIndicator}>{props.curr}/{props.total} ({props.delta})</div>

}
const stylePannelRoot = css({
    position: 'absolute',
    bottom: 0,
    left: 0,
    borderRadius: '0.5rem',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    
})
const stylePannelExpand = css({
    margin: 'auto'
})

function Pannel(props: ParentProps) {
    const [show, setShow] = createSignal(false)
    return <div class={stylePannelRoot}>
        <button class={stylePannelExpand} title="Expand" onClick={(e) => {
            e.stopPropagation()
            setShow(prev => !prev)
        }}>Expand</button>
        <Show when={show()}>
            {props.children}
        </Show>
    </div>
}
export default function Gallery(props: GalleryProps) {
    const currIndex = () => props.images.findIndex(img => img === props.curr)
    const hasNext = () => currIndex() < props.images.length - 1
    const hasPrev = () => currIndex() > 0

    const [delta, setDelta] = createSignal(0)

    const move = (() => {
        let t: ReturnType<typeof setTimeout> | undefined
        const deltaMax = () => props.images.length - 1 - currIndex()
        const deltaMin = () => -currIndex()
        return (direction: 1 | -1) => {
            if (t !== undefined) clearTimeout(t)
            setDelta(prev => {
                const next = prev + direction
                if (next > deltaMax()) return deltaMax()
                if (next < deltaMin()) return deltaMin()
                return next
            })
            t = setTimeout(() => {
                t = undefined
                if (delta() !== 0) {
                    props.onChange(props.images[currIndex() + delta()])
                    setDelta(0)
                }

            }, 50)
        }
    })()
    const handleKeydown = (e: KeyboardEvent) => {
        switch (e.code) {
            case "ArrowRight":
            case "ArrowDown":
            case "KeyD":
                move(1)
                break
            case "ArrowLeft":
            case "ArrowUp":
            case "KeyA":
                move(-1)
                break
            default:
                return
        }
        e.preventDefault()
    }
    onMount(() => {
        window.addEventListener('keydown', handleKeydown)
    })
    onCleanup(() => {
        window.removeEventListener('keydown', handleKeydown)
    })
    return <>
        <GalleryMoveButton disabled={!hasPrev()} onClick={(e) => { e.stopPropagation(); move(-1) }} />
        <GalleryMoveButton disabled={!hasNext()} toRight={true} onClick={(e) => { e.stopPropagation(); move(1) }} />
        <PositionIndicator total={props.images.length} curr={currIndex() + 1} delta={delta()} />
        <Pannel>
            <GalleryThumbnails {...mergeProps(props)} />
        </Pannel>
    </>
}