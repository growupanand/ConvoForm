"use client";

import MainNavTab from "../../_components/mainNavTab";

type Props = {
  formId: string;
};

export function IntegrationsSidebar({ formId }: Props) {
  return (
    <div className="h-full w-full flex flex-col space-y-4">
      <div className="space-y-4">
        <MainNavTab formId={formId} />
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
