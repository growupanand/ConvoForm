import {
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/components/marketing/ogImage";

export const alt =
  "ConvoForm changelog: product updates and new features, release by release.";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "Changelog",
    title: "Product updates, release by release",
    description:
      "New features, improvements and fixes in every ConvoForm release.",
  });
}
