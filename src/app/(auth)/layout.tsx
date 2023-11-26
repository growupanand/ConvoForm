import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: Readonly<Props>) {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-gray-100">
      <Card className="shadow-md bg-white flex flex-col rounded-md border md:min-w-[400px] min-h-[400px]">
        <CardHeader>
          <CardTitle className=" text-center">Smart form wizard</CardTitle>
        </CardHeader>
        <CardContent className="grow">{children}</CardContent>
      </Card>
    </div>
  );
}
