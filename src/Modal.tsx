import { css } from "@emotion/css";
import { createEffect, createSignal, JSX, on, onCleanup, splitProps } from "solid-js";
import useTimeout from "./useTimeout";

const styleModal = css({
    position: "fixed",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: "#0000",
    transition: "all 500ms ease-in",
    "&>div": {
        margin: "0.8rem",
        overflow: "auto",
        maxHeight: "98vh",
    }
})

const styleOpenned = css({
    backdropFilter: 'blur(2px) saturate(50%) brightness(80%)',
    backgroundColor: "#0001"
})

export interface ModalProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'style'> {
    open: boolean
    onClose: () => void
    delay?: number
    style?: JSX.CSSProperties
}
export function Modal(props: ModalProps) {
    const [localProp, forwardProp] = splitProps(props, ['open', 'onClose', 'delay', 'style'])
    const setTimeout = useTimeout()
    const [visibility, setVisibility] = createSignal(localProp.open)
    const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            localProp.onClose()
        }
    }
    createEffect(on(() => localProp.open, () => {
        if (visibility() !== localProp.open) {
            if (localProp.open) {
                setVisibility(true)
                window.addEventListener('keydown', handleEscape)
                onCleanup(() => window.removeEventListener('keydown', handleEscape))
            } else {
                setTimeout(() => setVisibility(false), localProp.delay ?? 500)
            }
        }
    }, { defer: true }))

    return (<div
        role="dialog"
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