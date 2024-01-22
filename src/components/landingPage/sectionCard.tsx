import { montserrat } from "@/app/fonts";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "../ui/card";

type Props = {
  children: React.ReactNode;
  title: string;
  headerClassName?: string;
  sectionClassName?: string;
  stickyHeader?: boolean;
};

export function SectionCard({
  children,
  title,
  headerClassName,
  sectionClassName,
  stickyHeader,
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
              " sticky top-14 z-30 bg-background/70 backdrop-blur",
            headerClassName,
          )}
        >
          <h2
            className={cn(
              "text-xl font-semibold tracking-tight",
              montserrat.className,
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
