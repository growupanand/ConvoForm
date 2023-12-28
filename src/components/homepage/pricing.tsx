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

type PlanFeature = {
  name: string;
  featureValue: string;
};

type Plan = {
  name: string;
  price: string;
  features: PlanFeature[];
};

const freePlan: Plan = {
  name: "Free plan",
  price: "$0/month",
  features: [
    {
      name: "Create forms",
      featureValue: "Unlimited",
    },
    {
      name: "See Responses",
      featureValue: "Unlimited",
    },
  ],
};

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
  featureValue,
}: {
  featureName: string;
  featureValue: string;
}) => {
  return (
    <div className="flex justify-between items-center space-x-2">
      <div className="flex items-center gap-2">
        <div>
          <CheckCircle color="green" size={15} />
        </div>
        <div className="text-sm text-gray-700">{featureName}</div>
      </div>
      <div className="text-sm text-gray-900 font-medium">{featureValue}</div>
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
            <span className="text-xl">{plan.name}</span>
            <Badge variant="secondary">{plan.price}</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-5">
          <div>
            {plan.features.map((feature) => (
              <FeatureListItem
                key={feature.name}
                featureName={feature.name}
                featureValue={feature.featureValue}
              />
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="rounded-full w-full" asChild>
          <Link href={isLoggedin ? "/dashboard" : "/auth/register"}>
            Sign up now
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
