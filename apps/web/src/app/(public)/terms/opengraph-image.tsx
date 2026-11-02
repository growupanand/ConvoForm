import {
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/components/marketing/ogImage";

export const alt =
  "ConvoForm terms and conditions: the terms that govern your use of ConvoForm, the conversational form builder and website.";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "Legal",
    title: "Terms and Conditions",
    description:
      "The terms that govern your use of ConvoForm, the conversational form builder and website.",
  });
}
