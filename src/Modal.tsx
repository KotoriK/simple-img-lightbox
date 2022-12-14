import { css } from "@emotion/css";
import { createEffect, createSignal, JSX, on, splitProps } from "solid-js";
import useTimeout from "./useTimeout";

const styleModal = css({
    /*CSS contributor 
作者：heibaimeng
链接：https://juejin.im/post/5cf3d3ba5188257c6b5171fd
来源：掘金
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。 */
    position: "fixed",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: 'unset',
    backgroundColor: "#0000",
    transition: "all 500ms ease-in",
    "& > div": {
        margin: "0.8rem",
        overflow: "auto",
        maxHeight: "98vh",
    }
})

const styleOpenned = css({
    backdropFilter: 'blur(5px)',
    backgroundColor: "rgba(0, 0, 0, 0.50)"

})

export interface ModalProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'style'> {
    open: boolean
    onClose: () => void
    delay?: number
    style?: JSX.CSSProperties
}
export function Modal(props: ModalProps) {
    const [localProp, forwardProp] = splitProps(props, ['open', 'onClose', 'delay', 'style'])
    const [setTimeout] = useTimeout()
    const [visibility, setVisibility] = createSignal(localProp.open)
    createEffect(on(() => localProp.open, () => {
        if (visibility() !== localProp.open) {
            if (localProp.open) {
                setVisibility(true)
            } else {
                setTimeout(() => setVisibility(false), localProp.delay ?? 500)
            }
        }
    }, { defer: true }))
    return (<div
        onClick={localProp.onClose}
        style={{
            visibility: (visibility() ? 'visible' : 'hidden'),
            ...localProp.style
        }}
        classList={{ [styleModal]: true, [styleOpenned]: localProp.open }}
        {...forwardProp}
    />
    )
}