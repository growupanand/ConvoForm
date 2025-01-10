import { Badge } from "@convoform/ui/components/ui/badge";

import { SectionCard } from "@/components/sectionCard";

export function HowToUseSection() {
  return (
    <SectionCard title="How to use">
      <div className="space-y-6 text-base">
        <StepListItem stepNumber={1}>
          <h3 className="font-semibold">Craft Your Form</h3>
          <p className="max-w-screen-sm font-light">
            Generate using AI by explaining your needs or create from scratch by
            just providing the required fields
          </p>
        </StepListItem>
        <StepListItem stepNumber={2}>
          <h3 className="font-semibold">Share with Ease</h3>
          <p className="max-w-screen-sm font-light">
            Once satisfied with your form design, share the link. Watch
            ConvoForm do the conversation with the respondents for you
          </p>
        </StepListItem>
        <StepListItem stepNumber={3}>
          <h3 className="font-semibold">Check Out the Responses</h3>
          <p className="max-w-screen-sm font-light">
            View neatly parsed collected data in structured table format with
            transcripts
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
