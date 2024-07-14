import { Badge } from "@convoform/ui/components/ui/badge";
import type { Metadata } from "next";

import BrandName from "@/components/common/brandName";
import { RequestFeatureCard } from "@/components/requestFeatureCard";
import { changelog } from "@/lib/data/changelog";
import { changeLogSchema } from "@/lib/validations/changeLog";
import { ReleaseCard } from "./_components/releaseCard";

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
      <div className="sticky top-0 z-50 h-16 w-full  border-b bg-white/80 shadow-sm backdrop-blur-lg">
        <div className="  w-full  p-3 lg:container ">
          <BrandName className="text-xl lg:text-2xl" />
        </div>
      </div>
      <main className="py-5 lg:container ">
        <div className="mx-auto flex  flex-col ">
          <div className=" flex flex-col items-center justify-center py-5">
            <Badge variant="secondary" className="font-medium">
              Changelog
            </Badge>
            <h2 className="text-xl font-bold lg:text-3xl">
              Changes and updates
            </h2>
          </div>
          <div className="mx-auto mb-10 max-w-[800px] px-5">
            <RequestFeatureCard />
          </div>

          <div>
            {removedEmptyReleases.map((release) => (
              <ReleaseCard key={release.title} release={release} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
