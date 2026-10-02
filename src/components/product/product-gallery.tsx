import Image from "next/image";

import type { GalleryImage } from "@/lib/catalog";

// Swipeable full-bleed carousel on small screens; a stacked column of large
// images beside the sticky product information from lg.
export function ProductGallery({ images }: { images: GalleryImage[] }) {
  return (
    <ul
      aria-label="Product images"
      className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] lg:flex-col lg:gap-grid lg:overflow-visible"
    >
      {images.map((image, index) => (
        <li
          key={`${image.src}-${index}`}
          className="media aspect-product w-full shrink-0 snap-center"
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            preload={index === 0}
            sizes="(width >= 64rem) 58vw, 100vw"
            style={{
              objectPosition: image.focus,
              transformOrigin: image.focus,
              scale: image.zoom,
            }}
          />
          {images.length > 1 && (
            <span className="type-label absolute right-3 bottom-3 bg-paper px-2 py-1 lg:hidden">
              {index + 1} / {images.length}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
