import { css } from "@emotion/css"
import { createEffect, createSignal, onCleanup, onMount } from "solid-js"
import { GalleryProps } from "./interface"

const styleButton = css({
    backgroundColor: 'rgb(0,0,0,0.6)',
    borderRadius: 8,
    color: '#eee',

    border: 'none',
    transitionDuration: '.2s',
    transitionProperty: 'background-color,color',
    fontSize: 24,
    fontWeight: 'bold',
    aspectRatio: "1/1",
    paddingInline: '0.25em',
    marginInline: '0.25em',
    position: 'absolute',
    left: 0,
    top: "45%",
    "&[aria-disabled]": {
        color: '#777'
    },
    "&:hover:not([aria-disabled])": {
        backgroundColor: 'rgb(0,0,0,0.7)',
    },
    "&:active:not([aria-disabled])": {
        backgroundColor: 'rgb(0,0,0,0.8)',
        color: '#fff'
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
        onClick={(e) => props.disabled ? e.stopPropagation() : props.onClick(e)}

    >
        {props.toRight ? "►" : "◄"}
    </button>

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
    return <div class={styleIndicator}>{props.curr}/{props.total}</div>
}

export default function Gallery(props: GalleryProps) {
    /*     const currIndex = () => props.images.findIndex(img => img === props.curr)
     */
    const [currIndex, setCurrIndex] = createSignal(props.images.findIndex(img => img === props.curr))
    createEffect(() => {
        if (props.images[currIndex()] !== props.curr) {
            setCurrIndex(props.images.findIndex(img => img === props.curr))
        }
    })
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
            t = requestAnimationFrame(() => {
                t = undefined
                if (delta() !== 0) {
                    const nextIndex = currIndex() + delta()
                    props.onChange(props.images[currIndex() + delta()])
                    setCurrIndex(nextIndex)
                    setDelta(0)
                }

            })
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
        {/*         <Pannel>
            <GalleryThumbnails {...mergeProps(props)} />
        </Pannel> */}
    </>
}