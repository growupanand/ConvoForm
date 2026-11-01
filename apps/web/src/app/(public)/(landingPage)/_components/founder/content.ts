/**
 * Owner-editable founder note.
 *
 * This is the only place the note copy lives. Rewrite the quote below in your
 * own words; the card, signature and photo are handled by `founderNote.tsx`.
 */
export const FOUNDER_NOTE_QUOTE =
  "I built ConvoForm because forms collect what people type, not what they mean. It's open source, so you can see exactly how it handles your respondents' answers. If something doesn't work for you, tell me and I'll fix it.";

export const FOUNDER_NAME = "Utkarsh Anand";
export const FOUNDER_ROLE = "Builder of ConvoForm";
export const FOUNDER_SIGNATURE = `${FOUNDER_NAME} · ${FOUNDER_ROLE}`;
export const FOUNDER_GITHUB_URL = "https://github.com/growupanand";

/**
 * GitHub avatar until the owner's photo is committed to
 * `public/images/founder/` (square, at least 256px). Point this back at the
 * local file once it exists.
 */
export const FOUNDER_PHOTO_URL = "https://github.com/growupanand.png";
