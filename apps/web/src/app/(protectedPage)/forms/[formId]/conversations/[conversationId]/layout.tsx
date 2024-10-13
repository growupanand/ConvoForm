import { Button } from "@convoform/ui/components/ui/button";
import { Card } from "@convoform/ui/components/ui/card";
import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import { Link } from "next-view-transitions";

type Props = {
  children: React.ReactNode;
  params: { formId: string };
};

export const metadata: Metadata = {
  title: "Conversation page",
};

export default function Layout({ children, params }: Readonly<Props>) {
  return (
    <Card className="h-full">
      <div className="pt-2">
        <Button variant="link" asChild>
          <Link href={`/forms/${params.formId}/conversations`}>
            <ChevronLeft />{" "}
            <span className="transition-all-conversation-heading">
              All conversations
            </span>
          </Link>
        </Button>
      </div>
      {children}
    </Card>
  );
}
