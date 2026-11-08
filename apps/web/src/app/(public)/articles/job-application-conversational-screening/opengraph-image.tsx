import {
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/components/marketing/ogImage";

export const alt =
  "AI follow-ups versus scripted branching, shown on a job-application CTC answer of “6”.";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "Article · Job applications",
    title: "Six, and what it means",
    description:
      "A candidate types “6” for CTC. A branch saves it. A follow-up asks whether it is current or expected pay.",
  });
}
