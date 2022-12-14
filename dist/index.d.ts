import { Accessor } from 'solid-js';
import { JSX } from 'solid-js/jsx-runtime';
import { MountableElement } from 'solid-js/web';

export declare function FullscreenImage(props: FullscreenImageProp): JSX.Element;

declare interface FullscreenImageProp extends Omit<JSX.ImgHTMLAttributes<HTMLImageElement>, 'children'> {
    /**
     * 作为位置参照的元素
     */
    img?: HTMLImageElement;
}

export declare function renderLightbox(img: Accessor<HTMLImageElement | undefined>, container: MountableElement): () => void;

export { }
