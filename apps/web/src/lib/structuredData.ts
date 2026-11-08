import { type ReactNode, isValidElement } from "react";

type FaqEntry = {
  question: string;
  answer: ReactNode;
};

/**
 * Extracts the visible text from the same React nodes the FAQ section renders,
 * so structured data cannot drift from the content on the page.
 */
export function plainTextFromReactNode(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }

  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(plainTextFromReactNode).join("");
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return plainTextFromReactNode(node.props.children);
  }

  return "";
}

export function createFaqPageJsonLd(faqs: readonly FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: plainTextFromReactNode(faq.answer),
      },
    })),
  };
}

export const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ConvoForm",
  description:
    "ConvoForm turns a static form into a short conversation. AI drafts the form, respondents answer in chat, and vague answers get a follow-up before they are saved.",
  url: "https://www.convoform.com/",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
} as const;
