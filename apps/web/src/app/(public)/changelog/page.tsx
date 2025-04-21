import { formatDate } from "@/lib/utils";
import { releaseSchema, releases } from "@convoform/release";
import { Button, Timeline, TimelineItem } from "@convoform/ui";
import { Card, CardContent, CardHeader } from "@convoform/ui";
import { Dot } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ReleaseCard } from "./_components/releaseCard";

export const metadata: Metadata = {
  title: "Changelog",
};

const firstCommitLink =
  "https://github.com/growupanand/ConvoForm/commit/386b516dc3f86c32113c114592cc22dca7f549c8";

const changeLogValidation = releaseSchema.array().safeParse(releases);
const parsedReleases = changeLogValidation.success
  ? changeLogValidation.data
  : [];
const removedEmptyReleases = parsedReleases.filter(
  (release) => release.commits.length > 0,
);

export default async function Page() {
  return (
    <main className="lg:container mx-auto pb-14">
      <div className="my-4 lg:my-12">
        <h1 className="text-xl font-bold lg:text-3xl  text-center bg-background py-2 lg:py-5 ">
          Changelog
        </h1>
        <p className="text-lg lg:text-2xl text-muted-foreground text-center lg:mb-5">
          Product updates and new features
        </p>
      </div>
      <div className="mx-auto grid ">
        <Timeline>
          <TimelineItem timelineTitle="Your Voice Matters">
            <div className="space-y-4">
              <Button asChild variant="default" size="lg">
                <Link
                  target="_blank"
                  href="https://convoform.canny.io/feature-requests"
                >
                  Suggest a Feature
                </Link>
              </Button>
              <p className="text-muted-foreground">
                Have an idea that would make our product better? We're all ears!
              </p>
            </div>
          </TimelineItem>
          {removedEmptyReleases.map((release) => (
            <TimelineItem
              key={release.version}
              timelineTitle={formatDate(release.isoDate)}
            >
              <ReleaseCard release={release} />
            </TimelineItem>
          ))}
          <TimelineItem timelineTitle={formatDate("2023-11-23")}>
            <Card>
              <CardHeader className="font-bold text-xl">Let's Go!</CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="">
                    <Dot className="size-4" />
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="capitalize"
                    asChild
                  >
                    <Link
                      href={firstCommitLink}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                    >
                      First commit
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TimelineItem>
        </Timeline>
      </div>
    </main>
  );
}
