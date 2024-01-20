import { Star } from "lucide-react";

import { getGitHubStars } from "@/lib/github";
import { Badge } from "../ui/badge";

async function GithubStars() {
  const stars = await getGitHubStars();

  return (
    <Badge
      variant="secondary"
      className="group gap-1 rounded-full active:scale-125"
    >
      <Star
        size={15}
        className="fill-yellow-500 stroke-yellow-600 transition-all group-[:active]:-translate-y-2 group-[:active]:rotate-180  group-[:hover]:rotate-45 group-[:active]:scale-150"
      />
      <span>{stars} Stars</span>
    </Badge>
  );
}

export { GithubStars };
