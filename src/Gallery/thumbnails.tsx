import { createEffect, createSignal, For } from "solid-js"
import { GalleryProps } from "./interface"
import { awaitImage } from "await-res"
import { css } from "@emotion/css"

const styleThumbnailRow = css({
    display: 'flex',
    gap: 8,
    "& >*": {
        contentVisibility: 'auto',
        containIntrinsicSize: "auto none auto 100px"
    }
})
export type GalleryThumbnailProps = Pick<GalleryProps, 'images' | 'onChange'> & { currIndex: number }
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
export default function GalleryThumbnails(props: GalleryThumbnailProps) {
    const [centerAt, setCenterAt] = createSignal(0)
    return <div class={styleThumbnailRow}
        onClick={e => e.stopPropagation()}
        onScroll={e => {
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