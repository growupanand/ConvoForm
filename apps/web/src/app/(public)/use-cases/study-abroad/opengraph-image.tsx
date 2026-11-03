import {
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/components/marketing/ogImage";

export const alt =
  "ConvoForm for study-abroad consultants: collect student intake details through an AI conversation before the first counselling call.";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "Study abroad",
    title: "Student intake, before the first call",
    description:
      "Collect destination, course, intake, marks, budget and test details through an AI conversation, so counsellors start with context.",
  });
}
