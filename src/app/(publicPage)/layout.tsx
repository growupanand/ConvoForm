import BrandName from "@/components/brandName";
import { UserButton, auth } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  const { userId } = auth();

  return (
    <main className="min-h-screen container">
      <nav className="flex justify-between items-center p-3">
        <BrandName />
        <div className="flex items-center gap-3">
          {userId ? (
            <>
              <Link href="/dashboard">
                <Button variant="secondary">Go to Dashboard</Button>
              </Link>
              <UserButton />
            </>
          ) : (
            <div className="flex gap-3">
              <Link href="/auth/register">
                <Button variant="secondary">Sign Up</Button>
              </Link>
              <Link href="/auth/sign-in">
                <Button>Sign In</Button>
              </Link>
            </div>
          )}
        </div>
      </nav>
      {children}
    </main>
  );
}
