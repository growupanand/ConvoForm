import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

type Props = {
  children: React.ReactNode;
  title: string;
};

export function SectionCard({ children, title }: Props) {
  return (
    <Card className="border-none shadow-none bg-transparent w-full">
      <CardHeader className="sticky top-16 pb-4 backdrop-blur-md bg-white/60">
        <h2 className="font-semibold tracking-tight text-xl">{title}</h2>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
