import { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@convoform/ui/components/ui/badge";
import { Button } from "@convoform/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
} from "@convoform/ui/components/ui/card";
import { ExternalLink } from "lucide-react";

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
      <div className="sticky top-0 z-50 h-16 w-full  border-b bg-white/80 shadow-sm backdrop-blur-lg">
        <div className="  w-full  p-3 lg:container ">
          <BrandName className="text-xl lg:text-2xl" />
        </div>
      </div>
      <main className="py-5 lg:container ">
        <div className="mx-auto flex max-w-[700px] flex-col items-center justify-center">
          <div className=" flex flex-col items-center justify-center py-5">
            <Badge variant="secondary" className="font-medium">
              Changelog
            </Badge>
            <h2 className="text-xl font-bold lg:text-3xl">
              Changes and updates
            </h2>
          </div>
          <Card className="mb-10">
            <CardContent className="pt-6">
              <CardDescription className="text-lg">
                {`Feel like something's missing?, just post any feature request or
                idea here, and we will notify you once they are ready.`}
              </CardDescription>
            </CardContent>
            <CardFooter>
              <div className="flex justify-end ">
                <Button asChild variant="secondary">
                  <Link
                    target="_blank"
                    href="https://convoform.canny.io/feature-requests"
                  >
                    Request Feature
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
          <div className="flex  items-start justify-center">
            <div className="w-full ">
              {removedEmptyReleases.map((release) => (
                <ReleaseCard key={release.title} release={release} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
