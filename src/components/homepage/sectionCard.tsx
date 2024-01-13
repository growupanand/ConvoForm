import { montserrat } from "@/app/fonts";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "../ui/card";

type Props = {
  children: React.ReactNode;
  title: string;
  headerClassName?: string;
};

export function SectionCard({ children, title, headerClassName }: Props) {
  return (
    <section>
      <Card className="w-full border-none bg-transparent shadow-none">
        <CardHeader
          className={cn(
            "sticky top-14 z-30 bg-background/70 pb-4 backdrop-blur ",
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
