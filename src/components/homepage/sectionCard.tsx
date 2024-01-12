import { montserrat } from "@/app/fonts";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "../ui/card";

type Props = {
  children: React.ReactNode;
  title: string;
};

export function SectionCard({ children, title }: Props) {
  return (
    <Card className="w-full border-none bg-transparent shadow-none">
      <CardHeader className="sticky top-16 bg-gray-50/60 pb-4 backdrop-blur-md">
        <h2
          className={cn(
            "text-xl font-semibold tracking-tight",
            montserrat.className,
          )}
        >
          {title}
        </h2>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
