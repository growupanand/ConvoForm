import { Badge } from "@convoform/ui";

import { SectionCard } from "@/components/sectionCard";

export function HowToUseSection() {
  return (
    <SectionCard title="How to use">
      <div className="space-y-6 text-base">
        <StepListItem stepNumber={1}>
          <h3 className="font-semibold">Design Your Form</h3>
          <p className="max-w-screen-sm font-light">
            Use AI or build from scratch. Your perfect form in minutes!
          </p>
        </StepListItem>
        <StepListItem stepNumber={2}>
          <h3 className="font-semibold">Share Instantly</h3>
          <p className="max-w-screen-sm font-light">
            Send your link and let ConvoForm handle the conversations naturally.
          </p>
        </StepListItem>
        <StepListItem stepNumber={3}>
          <h3 className="font-semibold">Collect Insights</h3>
          <p className="max-w-screen-sm font-light">
            View organized responses with full transcripts. Simple, powerful
            data.
          </p>
        </StepListItem>
      </div>
    </SectionCard>
  );
}

const StepBadge = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <Badge variant="secondary" className=" text-base font-normal">
      {children}
    </Badge>
  );
};

const StepListItem = ({
  children,
  stepNumber,
}: { children: React.ReactNode; stepNumber: number }) => {
  return (
    <div className="flex items-start gap-4">
      <StepBadge>{stepNumber}</StepBadge>
      <div className="">{children}</div>
    </div>
  );
};
