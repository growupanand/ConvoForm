import {
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/components/marketing/ogImage";

export const alt =
  "ConvoForm: forms that talk back. A form breaks apart and becomes a conversation that asks a follow-up.";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "Conversational forms",
    title: "Forms that talk back.",
    description:
      "ConvoForm chats with people, asks follow-ups when an answer is vague, and hands you clean, structured data.",
  });
}
