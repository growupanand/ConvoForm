import { Badge } from "@convoform/ui/components/ui/badge";

import { Commit, CommitSections } from "@/lib/validations/changeLog";
import { CommitItem } from "./commitItem";

const sectionBadgeVariants = {
  features: "customSuccess",
  improvements: "customInfo",
  fixes: "customDanger",
} as const;

export const CommitSection = ({
  section,
  commits,
}: {
  section: CommitSections;
  commits: Commit[];
}) => {
  return (
    <div>
      <Badge
        variant={sectionBadgeVariants[section]}
        className="mb-3 text-xs font-normal capitalize"
      >
        {section}
      </Badge>
      <ul className="grid gap-2 ps-3">
        {commits.map((commit) => (
          <li key={commit.shorthash} className="border-b pb-2">
            <CommitItem commit={commit} />
          </li>
        ))}
      </ul>
    </div>
  );
};
