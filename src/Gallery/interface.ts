export interface GalleryProps {
    images: HTMLImageElement[]
    curr: HTMLImageElement
    onChange: (img: HTMLImageElement) => void
}