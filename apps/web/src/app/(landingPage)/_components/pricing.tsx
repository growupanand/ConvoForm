import { Button } from "@convoform/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@convoform/ui/components/ui/card";
import { CheckCircle } from "lucide-react";

import { LinkN } from "@/components/common/linkN";
import { SectionCard } from "@/components/sectionCard";
import { type Plan, freePlan } from "@convoform/common";

export function Pricing() {
  return (
    <SectionCard title="Pricing">
      <PlanCard plan={freePlan} />
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
    <div className="flex items-start justify-between space-x-10 text-sm">
      <div className="flex items-start gap-2">
        <div className="mt-1">
          <CheckCircle color="green" size={15} />
        </div>
        <div className="">{featureName}</div>
      </div>
      <div className=" whitespace-nowrap font-medium">{featureText}</div>
    </div>
  );
};

const PlanCard = ({ plan }: { plan: Plan }) => {
  return (
    <Card className="w-fit font-montserrat shadow-lg">
      <CardHeader>
        <CardTitle>
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium capitalize">{plan.name}</span>
            <span className="text-xl">
              {plan.price}{" "}
              <span className="text-sm text-muted-foreground">/month</span>
            </span>
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
          className="w-full rounded-full font-bold font-montserrat"
          asChild
        >
          <LinkN href="/auth/register">Sign up</LinkN>
        </Button>
      </CardFooter>
    </Card>
  );
};
