"use client";

import {
  SecondaryNavigation,
  type SecondaryNavigationItem,
} from "@/components/common/secondaryNavigation";
import { Zap } from "lucide-react";
import MainNavTab from "../../_components/mainNavTab";

type Props = {
  formId: string;
};

export function IntegrationsSidebar({ formId }: Props) {
  const secondaryNavigationItems: SecondaryNavigationItem[] = [
    {
      title: "Data sync",
      href: `/forms/${formId}/integrations`,
      icon: <Zap className="size-4" />,
    },
  ];

  return (
    <div className="h-full w-full flex flex-col space-y-4">
      <div className="space-y-4">
        <MainNavTab formId={formId} />
        <SecondaryNavigation items={secondaryNavigationItems} />
      </div>
    </div>
  );
}

const IntegrationsSidebarSkeleton = ({ formId }: { formId: string }) => {
  return (
    <div className="h-full w-full flex flex-col space-y-4">
      <div className="space-y-4">
        <MainNavTab formId={formId} />
      </div>
    </div>
  );
};

IntegrationsSidebar.Skeleton = IntegrationsSidebarSkeleton;
