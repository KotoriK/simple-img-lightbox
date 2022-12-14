import { Accessor, } from "solid-js";
import { MountableElement, render } from "solid-js/web";
import FullscreenImage from "./FullscreenImage";

export default function renderLightbox(img: Accessor<HTMLImageElement | undefined>, container: MountableElement) {
    return render(() => <FullscreenImage src={img()?.src} img={img()!} />, container);
}