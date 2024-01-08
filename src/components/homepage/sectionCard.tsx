import { montserrat } from "@/app/fonts";
import { Card, CardHeader, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  title: string;
};

export function SectionCard({ children, title }: Props) {
  return (
    <Card className="border-none shadow-none bg-transparent w-full">
      <CardHeader className="sticky top-16 pb-4 backdrop-blur-md bg-white/60">
        <h2
          className={cn(
            "font-semibold tracking-tight text-xl",
            montserrat.className
          )}
        >
          {title}
        </h2>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
