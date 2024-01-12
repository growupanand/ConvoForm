import Link from "next/link";
import { auth } from "@clerk/nextjs";
import { CheckCircle } from "lucide-react";

import { montserrat } from "@/app/fonts";
import { freePlan } from "@/lib/config/pricing";
import { Plan } from "@/lib/types/plan";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { SectionCard } from "./sectionCard";

export function Pricing() {
  return (
    <SectionCard title="Pricing">
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
  const { userId } = auth();
  const isLoggedin = !!userId;
  return (
    <Card className=" w-full rounded-xl border-none shadow-lg shadow-gray-200">
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
          <Link href={isLoggedin ? "/dashboard" : "/auth/register"}>
            Sign up now
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
