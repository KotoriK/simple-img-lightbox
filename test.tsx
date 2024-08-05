/* @refresh reload */
import { css } from '@emotion/css';
import { createSignal, For, observable } from 'solid-js';
import { render } from 'solid-js/web';
import FullscreenImage from './src/FullscreenImage';
import { renderLightbox } from './src';
import Gallery from './src/Gallery';

const [img, setImg] = createSignal<HTMLImageElement | undefined>(undefined, { equals: false })
const candidateUrl: string[] = [
    ...(await Promise.all(Object.values(import.meta.glob('./picture/*.jpg', { as: 'url' })).map(fn => fn()))),
    'https://cdn.jsdelivr.net/gh/jmhobbs/cultofthepartyparrot.com/parrots/hd/thumbsupparrot.gif',
    'https://cdn.jsdelivr.net/gh/AOMediaCodec/av1-avif@master/testFiles/Netflix/avif/hdr_cosmos01000_cicp9-16-0_lossless.avif'
]
function randomPicture() {
    return candidateUrl[Math.round((candidateUrl.length - 1) * Math.random())]
}
const pictures = document.createElement('div')
const container = document.body
document.body.append(pictures)

const styleImageList = css({

    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,1fr)",
    gridTemplateRows: 'repeat(20,1fr)',
    gridAutoFlow: "column dense",
    gap: "10px",
    maxWidth: '100vw'
})
const styleItem = css({
    maxWidth: '100%',
    maxHeight: '100%'
})

const handleImgClick = (e: MouseEvent) => {
    setImg((e.target as HTMLImageElement))
}
render(() => <div class={styleImageList}>
    <For each={new Array(100).fill(0)}>
        {item => <div>
            <img class={styleItem} src={randomPicture()}
                onClick={handleImgClick} />
        </div>}
    </For>
</div>, pictures);

render(() => <FullscreenImage img={img()!} slotAfter={<Gallery images={Array.from(document.querySelectorAll(`.${styleImageList} img`))} curr={img()!} onChange={setImg} />} />, container);


observable(img).subscribe(console.log)