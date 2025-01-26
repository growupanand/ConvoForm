import { Dot } from "lucide-react";
import Link from "next/link";

import { extractCommitMessage } from "@/lib/github";
import type { Commit } from "@convoform/release";
import { Button } from "@convoform/ui";

export const CommitItem = ({ commit }: { commit: Commit }) => {
  const commitMessage = extractCommitMessage(commit.message);

  return (
    <div className="flex items-center">
      <div className="">
        <Dot className="size-6" />
      </div>
      <Button
        variant="link"
        size="sm"
        className="capitalize text-wrap h-auto min-h-9"
        asChild
      >
        <Link
          href={commit.href}
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          {commitMessage}
        </Link>
      </Button>
    </div>
  );
};
