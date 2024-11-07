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
              " sticky top-14 z-30 bg-white/30   backdrop-blur-md",
            headerClassName,
          )}
        >
          <SectionCardTitle>{title}</SectionCardTitle>
        </CardHeader>
        <CardContent className="z-40">{children}</CardContent>
      </Card>
    </section>
  );
}

export const SectionCardTitle = ({
  children,
}: { children: React.ReactNode }) => {
  return (
    <h2 className="font-montserrat text-xl font-semibold tracking-tight">
      {children}
    </h2>
  );
};
