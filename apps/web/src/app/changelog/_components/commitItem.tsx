import { GitCommitHorizontal } from "lucide-react";
import Link from "next/link";

import { extractCommitMessage } from "@/lib/github";
import type { Commit } from "@/lib/validations/changeLog";

export const CommitItem = ({ commit }: { commit: Commit }) => {
  const commitMessage = extractCommitMessage(commit.message);

  return (
    <div className="items-start lg:flex">
      <Link
        href={commit.href}
        target="_blank"
        rel="noopener noreferrer nofollow"
      >
        <div className="flex items-center pt-1">
          <GitCommitHorizontal size={20} className="mr-2" />{" "}
          <span className="mr-2 text-xs">{commit.shorthash}</span>
        </div>
      </Link>
      <span className="text-md first-letter:capitalize">{commitMessage}</span>
    </div>
  );
};
