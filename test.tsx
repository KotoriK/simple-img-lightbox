/* @refresh reload */
import { css } from '@emotion/css';
import { createSignal, For, from, observable } from 'solid-js';
import { render } from 'solid-js/web';
import FullscreenImage from './src/FullscreenImage';

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
const container = document.createElement('div')
document.body.append(pictures, container)

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
render(() => <div class={styleImageList}>
    <For each={new Array(100).fill(0)}>
        {item => <div>
            <img class={styleItem} src={randomPicture()}
                onClick={(e) => setImg((e.target as HTMLImageElement))} />
        </div>}
    </For>
</div>, pictures);

render(() => <FullscreenImage src={img()?.src} img={img()!} />, container);


observable(img).subscribe(console.log)