import { Button } from "@convoform/ui";
import { Card } from "@convoform/ui";
import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

type Props = {
  children: React.ReactNode;
  params: { formId: string };
};

export const metadata: Metadata = {
  title: "Conversation page",
};

export default async function Layout(props: Readonly<Props>) {
  const params = await props.params;

  const { children } = props;

  return (
    <Card className="h-full">
      <div className="pt-2">
        <Button variant="link" asChild>
          <Link href={`/forms/${params.formId}/conversations`}>
            <ChevronLeft className="size-4" />{" "}
            <span className="transition-all-conversation-heading">
              Responses
            </span>
          </Link>
        </Button>
      </div>
      {children}
    </Card>
  );
}
