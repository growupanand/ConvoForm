import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

type Props = {
  children: React.ReactNode;
  title: string;
};

export function SectionCard({ children, title }: Props) {
  return (
    <Card className="border-none shadow-none bg-transparent w-full">
      <CardHeader className="sticky top-16 pb-4 backdrop-blur-md bg-white/60">
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
