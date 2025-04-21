import type { Commit, CommitCategory } from "@convoform/release";
import { CommitItem } from "./commitListItem";

export const CommitList = ({
  commitCategory,
  commits,
}: {
  commitCategory: CommitCategory;
  commits: Commit[];
}) => {
  return (
    <div className="space-y-2">
      <div className="font-medium text-lg capitalize">{commitCategory}</div>
      <ul className="grid gap-1">
        {commits.map((commit, index) => (
          <li key={`${index}-${commit.href}`}>
            <CommitItem commit={commit} />
          </li>
        ))}
      </ul>
    </div>
  );
};
