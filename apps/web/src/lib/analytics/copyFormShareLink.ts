import posthog from "posthog-js";

import { copyLinkToClipboard } from "@/lib/url";

function formIdFromSubmissionLink(link: string) {
  return link.match(/\/view\/([^/?#]+)/)?.[1];
}

export function copyFormShareLink(link: string, formId?: string) {
  copyLinkToClipboard(link);
  const resolvedFormId = formId ?? formIdFromSubmissionLink(link);
  if (!resolvedFormId) {
    return;
  }
  posthog.capture("form:share", {
    method: "copy",
    formId: resolvedFormId,
  });
}
