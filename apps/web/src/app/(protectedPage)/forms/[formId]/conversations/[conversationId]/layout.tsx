import { Card } from "@convoform/ui";
import type { Metadata } from "next";

type Props = {
  children: React.ReactNode;
  params: { formId: string };
};

export const metadata: Metadata = {
  title: "Conversation page",
};

export default function Layout(props: Readonly<Props>) {
  const { children } = props;

  return <Card className="h-full overflow-auto">{children}</Card>;
}
