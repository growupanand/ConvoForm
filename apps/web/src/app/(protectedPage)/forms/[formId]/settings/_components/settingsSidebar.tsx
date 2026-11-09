"use client";

import {
  SecondaryNavigation,
  type SecondaryNavigationItem,
} from "@/components/common/secondaryNavigation";
import { MessageSquare, Webhook, Zap } from "lucide-react";
import MainNavTab from "../../_components/mainNavTab";

type Props = {
  formId: string;
};

/**
 * Sidebar for the Settings tab, combining Integrations, Channels and Webhooks
 * navigation.
 *
 * @example
 * ```tsx
 * <SettingsSidebar formId="form_abc" />
 * ```
 */
export function SettingsSidebar({ formId }: Props) {
  const secondaryNavigationItems: SecondaryNavigationItem[] = [
    {
      title: "Integrations",
      href: `/forms/${formId}/settings`,
      icon: <Zap className="size-4" />,
    },
    {
      title: "Channels",
      href: `/forms/${formId}/settings/channels`,
      icon: <MessageSquare className="size-4" />,
    },
    {
      title: "Webhooks",
      href: `/forms/${formId}/settings/webhooks`,
      icon: <Webhook className="size-4" />,
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

const SettingsSidebarSkeleton = ({ formId }: { formId: string }) => {
  return (
    <div className="h-full w-full flex flex-col space-y-4">
      <div className="space-y-4">
        <MainNavTab formId={formId} />
      </div>
    </div>
  );
};

SettingsSidebar.Skeleton = SettingsSidebarSkeleton;
