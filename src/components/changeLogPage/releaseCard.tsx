import { CommitSections, Release } from "@/lib/validations/changeLog";
import { SectionCard } from "../landingPage/sectionCard";
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
      title={`${release.title} - ${release.isoDate}`}
      headerClassName="bg-transparent top-12 py-2 lg:py-3"
    >
      <div className="grid gap-3">
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
