import { Accessor } from 'solid-js';
import { JSX } from 'solid-js/jsx-runtime';
import { JSX as JSX_2 } from 'solid-js';
import { MountableElement } from 'solid-js/web';

export declare function FullscreenImage(props: FullscreenImageProp): JSX.Element;

export declare interface FullscreenImageProp extends Omit<JSX.ImgHTMLAttributes<HTMLCanvasElement>, 'children'> {
    /**
     * 作为位置参照的元素
     */
    img?: HTMLImageElement;
    slotAfter?: JSX.Element;
    slotBefore?: JSX.Element;
}

export declare function Gallery(props: GalleryProps): JSX_2.Element;

export declare interface GalleryProps {
    images: HTMLImageElement[];
    curr: HTMLImageElement;
    onChange: (img: HTMLImageElement) => void;
}

export declare function renderLightbox(img: Accessor<HTMLImageElement | undefined>, container: MountableElement): () => void;

export { }
