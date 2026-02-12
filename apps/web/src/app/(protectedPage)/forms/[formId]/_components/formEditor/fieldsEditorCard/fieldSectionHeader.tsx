import { SectionHeading } from "@convoform/ui";

export function FieldSectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return <SectionHeading description={description}>{title}</SectionHeading>;
}
