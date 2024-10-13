import {
  Card,
  CardContent,
  CardHeader,
} from "@convoform/ui/components/ui/card";

import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  title: string;
  headerClassName?: string;
  sectionClassName?: string;
  stickyHeader?: boolean;
  titleClassName?: string;
};

export function SectionCard({
  children,
  title,
  headerClassName,
  sectionClassName,
  stickyHeader,
  titleClassName,
}: Props) {
  return (
    <section>
      <Card
        className={cn(
          "w-full border-none bg-transparent shadow-none",
          sectionClassName,
        )}
      >
        <CardHeader
          className={cn(
            "pb-4 ",
            stickyHeader &&
              " sticky top-14 z-30 bg-white/30   backdrop-blur-md",
            headerClassName,
          )}
        >
          <h2
            className={cn(
              "font-montserrat text-xl font-semibold tracking-tight drop-shadow-[0px_0px_4px_white]",
              titleClassName,
            )}
          >
            {title}
          </h2>
        </CardHeader>
        <CardContent className="z-40">{children}</CardContent>
      </Card>
    </section>
  );
}
