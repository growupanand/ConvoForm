import {
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/components/marketing/ogImage";

export const alt =
  "ConvoForm for hiring teams: collect experience, CTC and notice period through an AI conversation before the first screening call.";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "Job applications",
    title: "Candidate answers, before the first call",
    description:
      "Experience, CTC and notice period, collected in one conversation.",
  });
}
