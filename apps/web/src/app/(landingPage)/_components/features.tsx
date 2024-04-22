import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@convoform/ui/components/ui/card";

import { SectionCard } from "@/components/sectionCard";
import { cn } from "@/lib/utils";

export function Features() {
  return (
    <SectionCard stickyHeader title="Features">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FeatureListItem
          title="Easy to use"
          description="The form builder is simple to use, even for those who are not technical."
        />
        <FeatureListItem
          title="Conversational"
          description="The forms are conversational, which makes them more engaging and easier to complete."
        />
        <FeatureListItem
          title="Responsive"
          description="The forms are responsive, so they can be used on any device."
        />
        <FeatureListItem
          title="Secure"
          description="The forms are secure, so you can be confident that your data is safe."
        />
      </div>
    </SectionCard>
  );
}

const FeatureListItem = ({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) => (
  <Card
    className={cn(
      "h-full w-full rounded-3xl  p-2 shadow-inner lg:p-5",
      className,
    )}
  >
    <CardHeader>
      <CardTitle className="text-left text-2xl font-normal leading-none tracking-tight lg:text-center">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-left">{description}</p>
    </CardContent>
  </Card>
);
