import { SectionCard } from "@/components/sectionCard";
import { formatDate } from "@/lib/utils";
import type { CommitSections, Release } from "@/lib/validations/changeLog";
import { CommitSection } from "./commitSection";

export const commitsSections = [
  "features",
  "improvements",
  "fixes",
] as CommitSections[];

export const ReleaseCard = ({ release }: { release: Release }) => {
  const commitSectionsWithCommits = commitsSections.filter(
    (section) => release.commits[section].length > 0,
  );

  return (
    <SectionCard
      stickyHeader
      headerClassName="border-b mb-5"
      title={`${release.title} - ${formatDate(release.isoDate)}`}
    >
      <div className="grid gap-3 lg:ps-20">
        {commitSectionsWithCommits.map((section) => (
          <CommitSection
            key={section}
            section={section}
            commits={release.commits[section]}
          />
        ))}
      </div>
    </SectionCard>
  );
};
