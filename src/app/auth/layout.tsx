import BrandName from "@/components/brandName";
import Spinner from "@/components/ui/spinner";
import { ClerkLoading } from "@clerk/nextjs";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Readonly<Props>) {
  return (
    <main className="container max-w-[900px]">
      <nav className="flex justify-center items-center p-3 mt-5">
        <BrandName className="text-3xl" />
      </nav>
      <ClerkLoading>
        <div className="w-full flex justify-center">
          <Spinner label="Please wait..." />
        </div>
      </ClerkLoading>
      {children}
    </main>
  );
}
