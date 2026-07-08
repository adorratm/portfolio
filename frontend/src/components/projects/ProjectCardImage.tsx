'use client';

import Image from 'next/image';
import { useState } from 'react';

type ProjectCardImageProps = {
  src: string;
  alt: string;
  category: string;
};

/**
 * Proje kartı görseli — S3 / backend URL'leri için unoptimized, hata durumunda placeholder.
 */
export function ProjectCardImage({ src, alt, category }: ProjectCardImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex h-56 items-center justify-center bg-surface-container">
        <span className="pulse-animation rounded-full border border-tertiary/30 bg-tertiary/20 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-tertiary">
          {category}
        </span>
      </div>
    );
  }

  return (
    <div className="relative h-56 overflow-hidden">
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-transform duration-500 group-hover:scale-110"
        onError={() => setFailed(true)}
      />
      <div className="absolute inset-0 bg-linear-to-t from-background to-transparent" />
      <span className="pulse-animation absolute bottom-4 left-6 rounded-full border border-tertiary/30 bg-tertiary/20 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-tertiary backdrop-blur-sm">
        {category}
      </span>
    </div>
  );
}
