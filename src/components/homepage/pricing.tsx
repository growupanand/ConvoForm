import { CheckCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { SectionCard } from "./sectionCard";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import Link from "next/link";
import { auth } from "@clerk/nextjs";
import { freePlan } from "@/lib/config/pricing";
import { Plan } from "@/lib/types/plan";
import { cn } from "@/lib/utils";
import { montserrat } from "@/app/fonts";

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
    <div className="flex justify-between items-start space-x-2">
      <div className="flex items-start gap-2">
        <div className="mt-1">
          <CheckCircle color="green" size={15} />
        </div>
        <div className="text-md text-gray-700">{featureName}</div>
      </div>
      <div className="text-md text-gray-900 font-semibold whitespace-nowrap">
        {featureText}
      </div>
    </div>
  );
};

const PlanCard = ({ plan }: { plan: Plan }) => {
  const { userId } = auth();
  const isLoggedin = !!userId;
  return (
    <Card className=" rounded-xl shadow-lg w-full">
      <CardHeader>
        <CardTitle>
          <div className="flex items-center justify-between">
            <span className={cn("text-xl", montserrat.className)}>
              {plan.name}
            </span>
            <Badge variant="secondary">{plan.price}</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-5">
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
          className={cn("rounded-full w-full", montserrat.className)}
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
