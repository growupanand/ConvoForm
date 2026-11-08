import {
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/components/marketing/ogImage";

export const alt =
  "ConvoForm articles: notes on AI follow-ups, scripted branching, and forms that talk back.";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "Articles",
    title: "Notes on forms that talk back",
    description:
      "Use-case walkthroughs on AI follow-ups and scripted branching, with the limits stated plainly.",
  });
}
