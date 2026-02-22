"use client";

import {
  SecondaryNavigation,
  type SecondaryNavigationItem,
} from "@/components/common/secondaryNavigation";
import { MessageSquare } from "lucide-react";
import MainNavTab from "../../_components/mainNavTab";

type Props = {
  formId: string;
};

export function ChannelsSidebar({ formId }: Props) {
  const secondaryNavigationItems: SecondaryNavigationItem[] = [
    {
      title: "Channel connections",
      href: `/forms/${formId}/channels`,
      icon: <MessageSquare className="size-4" />,
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

const ChannelsSidebarSkeleton = ({ formId }: { formId: string }) => {
  return (
    <div className="h-full w-full flex flex-col space-y-4">
      <div className="space-y-4">
        <MainNavTab formId={formId} />
      </div>
    </div>
  );
};

ChannelsSidebar.Skeleton = ChannelsSidebarSkeleton;
