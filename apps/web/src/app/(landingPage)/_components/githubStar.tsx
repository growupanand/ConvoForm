import { Badge } from "@convoform/ui/components/ui/badge";
import { Star } from "lucide-react";

import { getGitHubStars } from "@/lib/github";

async function GithubStars() {
  const stars = await getGitHubStars();

  return (
    <Badge
      variant="secondary"
      className="group gap-1 rounded-full active:scale-125"
    >
      <Star
        size={15}
        className=" fill-yellow-500 stroke-yellow-600 transition-all group-[:active]:-translate-y-10 group-[:hover]:-rotate-90 group-[:active]:scale-150"
      />
      <span>{stars} Stars</span>
    </Badge>
  );
}

export { GithubStars };
