import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { SectionCard } from "./sectionCard";

export function Features() {
  return (
    <SectionCard title="Features">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FeatureListItem
          title="Easy to use"
          description="The form builder is simple to use, even for those who are not technical."
          className="rounded-3xl md:rounded-none md:rounded-tl-3xl"
        />
        <FeatureListItem
          title="Conversational"
          description="The forms are conversational, which makes them more engaging and easier to complete."
          className="rounded-3xl md:rounded-none md:rounded-tr-3xl"
        />
        <FeatureListItem
          title="Responsive"
          description="The forms are responsive, so they can be used on any device."
          className="rounded-3xl md:rounded-none md:rounded-bl-3xl"
        />
        <FeatureListItem
          title="Secure"
          description="The forms are secure, so you can be confident that your data is safe."
          className="rounded-3xl md:rounded-none md:rounded-br-3xl"
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
  <Card className={cn("w-full h-full rounded-none p-2 lg:p-5", className)}>
    <CardHeader>
      <CardTitle className="text-2xl font-semibold leading-none tracking-tight text-left lg:text-center">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-left">{description}</div>
    </CardContent>
  </Card>
);
