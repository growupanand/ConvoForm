import {
  type Commit,
  type CommitCategory,
  type Release,
  generateMDXComponentFileName,
  generateReleaseMDXFileName,
  releaseMDXComponents,
} from "@convoform/release";
import { Badge } from "@convoform/ui";
import { Card, CardContent, CardHeader } from "@convoform/ui";
import { CommitList } from "./commitList";

const categoryBadgeVariants = {
  features: "customSuccess",
  improvements: "customInfo",
  fixes: "customDanger",
} as const;

const mdxFileNames = Object.keys(releaseMDXComponents ?? {});

export const ReleaseCard = ({ release }: { release: Release }) => {
  const releaseCategories = release.commits.reduce<
    Record<CommitCategory, Commit[]>
  >(
    (acc, commit) => {
      if (!acc[commit.type]) {
        acc[commit.type] = [];
      }
      acc[commit.type].push(commit);
      return acc;
    },
    {} as Record<CommitCategory, Commit[]>,
  );

  const categories = Object.keys(releaseCategories) as CommitCategory[];

  const releaseMDXFileName = generateReleaseMDXFileName(release.version);
  const releaseMDXComponentName = generateMDXComponentFileName(
    releaseMDXFileName,
  ) as keyof typeof releaseMDXComponents;
  const isMDXComponentExist = mdxFileNames.includes(releaseMDXComponentName);
  const MDXComponent = isMDXComponentExist
    ? releaseMDXComponents[releaseMDXComponentName]
    : () => null;

  return (
    <Card className="max-lg:rounded-none w-full">
      <CardHeader>
        <div className="flex gap-4 items-center justify-between">
          <div className="font-bold text-xl ">{release.version}</div>
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
        <div className="grid space-y-4">
          {isMDXComponentExist && (
            <div>
              <MDXComponent />
            </div>
          )}

          {categories.map((category) => (
            <CommitList
              key={category}
              commitCategory={category}
              commits={release.commits.filter((i) => i.type === category)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
