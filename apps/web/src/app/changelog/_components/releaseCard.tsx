import { type Release, commitCategories } from "@/lib/validations/changeLog";
import { Badge } from "@convoform/ui/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
} from "@convoform/ui/components/ui/card";
import { CommitList } from "./commitList";

const categoryBadgeVariants = {
  features: "customSuccess",
  improvements: "customInfo",
  fixes: "customDanger",
} as const;

export const ReleaseCard = ({ release }: { release: Release }) => {
  // filter out categories that have no commits
  const categories = commitCategories.filter(
    (category) => release.commits[category].length > 0,
  );

  return (
    <Card className="max-lg:rounded-none w-full">
      <CardHeader>
        <div className="flex gap-4 items-center justify-between">
          <div className="font-bold text-xl ">{release.title}</div>
          <div className="flex items-center gap-1 flex-wrap">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={categoryBadgeVariants[category]}
                className="font-normal text-sm capitalize"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {categories.map((category) => (
            <CommitList
              key={category}
              commitCategory={category}
              commits={release.commits[category]}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
