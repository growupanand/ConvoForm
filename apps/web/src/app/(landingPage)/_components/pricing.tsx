import { Badge } from "@convoform/ui/components/ui/badge";
import { Button } from "@convoform/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@convoform/ui/components/ui/card";
import { CheckCircle } from "lucide-react";

import { montserrat } from "@/app/fonts";
import { LinkN } from "@/components/common/linkN";
import { SectionCard } from "@/components/sectionCard";
import { freePlan } from "@/lib/config/pricing";
import { Plan } from "@/lib/types/pricing";
import { cn } from "@/lib/utils";

export function Pricing() {
  return (
    <SectionCard stickyHeader title="Pricing">
      <div className="grid grid-cols-1">
        <PlanCard plan={freePlan} />
      </div>
    </SectionCard>
  );
}

const FeatureListItem = ({
  featureName,
  featureText,
}: {
  featureName: string;
  featureText: string;
}) => {
  return (
    <div className="flex items-start justify-between space-x-2">
      <div className="flex items-start gap-2">
        <div className="mt-1">
          <CheckCircle color="green" size={15} />
        </div>
        <div className="text-md text-gray-500">{featureName}</div>
      </div>
      <div
        className={cn(
          "text-md whitespace-nowrap font-medium text-black",
          montserrat.className,
        )}
      >
        {featureText}
      </div>
    </div>
  );
};

const PlanCard = ({ plan }: { plan: Plan }) => {
  return (
    <Card className="  w-full rounded-xl  shadow-xl">
      <CardHeader>
        <CardTitle>
          <div className="flex items-center justify-between">
            <span className={cn("text-xl", montserrat.className)}>
              {plan.name}
            </span>
            <Badge variant="secondary" className="text-sm">
              {plan.price}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-5 space-y-2">
          {plan.features.map((feature) => (
            <FeatureListItem
              key={feature.name}
              featureName={feature.name}
              featureText={feature.featureText}
            />
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className={cn("w-full rounded-full font-bold", montserrat.className)}
          asChild
        >
          <LinkN href="/auth/register">Sign up now</LinkN>
        </Button>
      </CardFooter>
    </Card>
  );
};
