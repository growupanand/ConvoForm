"use client";

import Image from "next/image";
import { useState } from "react";

import {
  FOUNDER_NAME,
  FOUNDER_PHOTO_FALLBACK_URL,
  FOUNDER_PHOTO_PATH,
} from "./content";

export function FounderPhoto() {
  const [src, setSrc] = useState(FOUNDER_PHOTO_PATH);

  return (
    <Image
      src={src}
      alt={FOUNDER_NAME}
      width={48}
      height={48}
      sizes="48px"
      loading="lazy"
      unoptimized={src === FOUNDER_PHOTO_FALLBACK_URL}
      onError={() => {
        if (src !== FOUNDER_PHOTO_FALLBACK_URL) {
          setSrc(FOUNDER_PHOTO_FALLBACK_URL);
        }
      }}
      className="size-12 shrink-0 rounded-full border-[1.25px] border-marketing-hair bg-marketing-hair-soft object-cover"
    />
  );
}
