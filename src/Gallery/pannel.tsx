import { css } from "@emotion/css"
import { type ParentProps, createSignal, Show } from "solid-js"

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
export default function Pannel(props: ParentProps) {
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