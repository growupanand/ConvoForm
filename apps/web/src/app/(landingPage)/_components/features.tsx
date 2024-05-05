import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@convoform/ui/components/ui/card";
import { Cpu, MessageSquare, Shield, SlidersHorizontal } from "lucide-react";

import { SectionCard } from "@/components/sectionCard";
import { cn } from "@/lib/utils";

export function Features() {
  return (
    <SectionCard stickyHeader title="Features">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FeatureListItem
          title="AI-Powered Form Generation"
          description="Describe your form, and our AI does the heavy lifting."
          icon={
            <Cpu className="stroke-primary-500 size-6 fill-white lg:size-10" />
          }
        />
        <FeatureListItem
          title="Effortless form creation"
          description="ConvoForm's intuitive builder makes crafting forms a breeze."
          icon={
            <SlidersHorizontal className="stroke-primary-500 size-6 fill-white lg:size-10" />
          }
        />
        <FeatureListItem
          title="Engaging conversations"
          description="Ditch boring forms for dynamic, AI-powered conversations."
          icon={
            <MessageSquare className="stroke-primary-500 size-6 fill-white lg:size-10" />
          }
        />
        <FeatureListItem
          title="Secure and accessible"
          description="Securely collect and store sensitive information on any device."
          icon={
            <Shield className="stroke-primary-500 size-6 fill-white lg:size-10" />
          }
        />
      </div>
    </SectionCard>
  );
}

const FeatureListItem = ({
  title,
  description,
  className,
  icon,
}: {
  title: string;
  description: string;
  className?: string;
  icon?: React.ReactNode;
}) => (
  <Card
    className={cn(
      "h-full w-full rounded-3xl  p-2 shadow-inner lg:p-5",
      className,
    )}
  >
    <CardHeader>
      <CardTitle className="flex items-start gap-2 text-left text-2xl font-normal leading-none tracking-tight lg:gap-3">
        {icon ? <span className="size-6 lg:size-10">{icon}</span> : undefined}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-left">{description}</p>
    </CardContent>
  </Card>
);
