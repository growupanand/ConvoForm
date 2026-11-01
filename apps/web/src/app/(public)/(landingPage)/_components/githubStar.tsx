import { Star } from "lucide-react";

import { getGitHubStars } from "@/lib/github";

async function GithubStars() {
  const stars = await getGitHubStars();

  return (
    <span className="inline-flex items-center gap-1 font-mono text-[12.5px] tabular-nums text-marketing-blue-600">
      <Star
        className="size-3.5 fill-marketing-blue-600 stroke-marketing-blue-600"
        aria-hidden="true"
      />
      {stars}
    </span>
  );
}

export { GithubStars };
