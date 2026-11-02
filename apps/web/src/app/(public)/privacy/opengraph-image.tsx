import {
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/components/marketing/ogImage";

export const alt =
  "ConvoForm privacy policy: how ConvoForm collects, uses, discloses and safeguards the information you share.";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "Legal",
    title: "Privacy Policy",
    description:
      "How ConvoForm collects, uses, discloses and safeguards the information you share when you build conversational forms.",
  });
}
