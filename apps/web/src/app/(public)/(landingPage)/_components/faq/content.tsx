import { PLAN_LIMITS, formatFileSize } from "@convoform/common";
import { BETA_LIMITS } from "@convoform/file-storage/constants";
import type { ReactNode } from "react";

/**
 * Owner TODO (#516): confirm the production conversation provider
 * (`CONVERSATION_MODEL`) and set its display name here. While it is `null`
 * the FAQ ships without the "(currently …)" clause.
 */
export const AI_PROVIDER: string | null = null;

const betaResponses = PLAN_LIMITS.FREE_RESPONSES;
const betaStorage = formatFileSize(BETA_LIMITS.MAX_STORAGE_PER_ORG);
const maxFileSize = formatFileSize(BETA_LIMITS.MAX_FILE_SIZE);
const retentionDays = BETA_LIMITS.RETENTION_DAYS;

const dataProviderSentence = AI_PROVIDER
  ? `To run the conversation, answers are sent to a third-party AI model provider (currently ${AI_PROVIDER}).`
  : "To run the conversation, answers are sent to a third-party AI model provider.";

export type FaqItem = {
  id: string;
  question: string;
  answer: ReactNode;
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "is-it-free",
    question: "Is it free?",
    answer: (
      <>
        Yes. ConvoForm is in beta, and every feature is free while we&apos;re in
        beta. The beta limits are {betaResponses} responses per organization and{" "}
        {betaStorage} of file storage (files up to {maxFileSize} each, kept for{" "}
        {retentionDays} days).
      </>
    ),
  },
  {
    id: "self-host",
    question: "Can I self-host?",
    answer: (
      <>
        Yes. ConvoForm is open source (Apache 2.0). Follow the self-hosting
        guide on{" "}
        <a
          href="https://docs.convoform.com/getting-started/self-hosting"
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="rounded-sm text-marketing-blue-600 underline decoration-marketing-blue-200 underline-offset-4 transition-colors duration-200 hover:text-marketing-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketing-blue-600"
        >
          docs.convoform.com
        </a>{" "}
        to run it with Docker Compose and your own PostgreSQL database and AI
        provider key.
      </>
    ),
  },
  {
    id: "whatsapp-mobile",
    question: "Does it work on WhatsApp and mobile?",
    answer:
      "Share your form link anywhere, including WhatsApp and your Instagram bio. People tap it and chat in their phone's browser. ConvoForm doesn't run inside WhatsApp and doesn't send WhatsApp messages.",
  },
  {
    id: "data-storage",
    question: "Where is my data stored?",
    answer: (
      <>
        On the cloud version, forms and responses are stored in a PostgreSQL
        database in Singapore (AWS ap-southeast-1, hosted by Neon), and the web
        app runs in Vercel's Singapore region. Uploaded files are stored on
        Cloudflare R2. {dataProviderSentence} If you self-host, everything stays
        on your own server and database, with the AI provider you choose.
      </>
    ),
  },
  {
    id: "google-form-import",
    question: "Can I import my existing Google Form?",
    answer:
      "Yes. Sign in, then import a Google Form from your Google Drive to turn it into a conversational form.",
  },
];
