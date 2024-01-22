import * as z from "zod";

const schema = z.object({
  stargazers_count: z.number(),
});

export async function getGitHubStars() {
  const res = await fetch(
    "https://api.github.com/repos/growupanand/ConvoForm",
    { next: { revalidate: 600 } }, // 10min
  );
  const json = await res.json();
  const github = schema.safeParse(json);

  if (!github.success) return 0;
  return github.data.stargazers_count;
}

/**
 * This function is designed to extract commit messages from given message string using regex.
 *
 * The function can handle commit messages in the following formats:
 * - "type: #153 this is commit subject"
 * - "#153 this is commit subject"
 * - "type: this is commit subject"
 *
 * In each of these formats, it locates and extracts the 'commit message' part.
 *
 * @param {string} message - The commit message that needs to be parsed. This will be a string
 * that matches one of the formats specified above.
 *
 * @returns {string} - The extracted commit message if the input matches any expected format.
 * If the input string doesn't match any expected format, it returns the original commit message".
 */
export function extractCommitMessage(message: string) {
  const regex = /(\w+:\s)?#?\d*\s?(.+)/;
  const match = message.match(regex);

  // match[2] would contain the commit message if the regex matches the string
  return match ? match[2] : message;
}
