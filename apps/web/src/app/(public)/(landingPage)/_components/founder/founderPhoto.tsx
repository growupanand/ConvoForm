import Image from "next/image";

import { FOUNDER_NAME, FOUNDER_PHOTO_URL } from "./content";

export function FounderPhoto() {
  return (
    <Image
      src={FOUNDER_PHOTO_URL}
      alt={FOUNDER_NAME}
      width={48}
      height={48}
      sizes="48px"
      loading="lazy"
      unoptimized
      className="size-12 shrink-0 rounded-full border-[1.25px] border-marketing-hair bg-marketing-hair-soft object-cover"
    />
  );
}
