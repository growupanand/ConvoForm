import {
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/components/marketing/ogImage";

export const alt =
  "ConvoForm use cases: start with the work you already do and collect the details your team needs before the first call.";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "Use cases",
    title: "Start with the work you already do",
    description:
      "Each use case collects the details your team actually needs, asks a follow-up when an answer is unclear, and leaves you a clean record to review.",
  });
}
