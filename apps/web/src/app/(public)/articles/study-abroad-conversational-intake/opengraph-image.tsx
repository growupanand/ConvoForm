import {
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/components/marketing/ogImage";

export const alt =
  "AI follow-ups versus scripted branching, shown on a real study-abroad student-intake example.";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "Article · Study abroad",
    title: "A follow-up is not a branch",
    description:
      "Scripted branching chooses from paths you wrote. An AI follow-up writes the clarification the answer needs.",
  });
}
