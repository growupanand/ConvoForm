import { Metadata } from "next";
import { Badge } from "@convoform/ui/components/ui/badge";

import { ReleaseCard } from "@/components/changeLogPage/releaseCard";
import BrandName from "@/components/common/brandName";
import { changelog } from "@/lib/data/changelog";
import { changeLogSchema } from "@/lib/validations/changeLog";

export const metadata: Metadata = {
  title: "Changelog",
};

export default function Page() {
  const changeLogValidation = changeLogSchema.safeParse(changelog);
  const changeLogs = changeLogValidation.success
    ? changeLogValidation.data
    : [];
  const removedEmptyReleases = changeLogs.filter(
    (release) =>
      release.commits.features.length > 0 ||
      release.commits.improvements.length > 0 ||
      release.commits.fixes.length > 0,
  );

  return (
    <div>
      <div className="sticky  top-0 z-50 mb-10 border-b bg-white/70 shadow-sm backdrop-blur">
        <div className="  w-full  p-3 lg:container ">
          <BrandName className="text-xl lg:text-2xl" />
        </div>
      </div>
      <main className="lg:container">
        <div className="mb-10 flex flex-col items-center justify-center lg:mb-20">
          <Badge variant="secondary" className="font-medium">
            Changelog
          </Badge>
          <h1 className="text-xl font-bold lg:text-5xl">Changes and updates</h1>
        </div>
        <div className="flex items-start justify-center">
          <div className="w-full max-w-[700px]">
            {removedEmptyReleases.map((release) => (
              <ReleaseCard key={release.title} release={release} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
