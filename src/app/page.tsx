import BrandName from "@/components/brandName";
import { Button } from "@/components/ui/button";
import { SignInButton, UserButton, auth } from "@clerk/nextjs";
import Link from "next/link";

export default async function Home() {
  const { userId } = auth();
  return (
    <main className="min-h-screen container">
      <nav className="flex justify-between items-center p-3">
        <BrandName />
        <div>
          <div className="flex items-center gap-3 p-5">
            {userId ? (
              <>
                <Link href="/dashboard">
                  <Button variant="secondary">Go to Dashboard</Button>
                </Link>
                <UserButton />
              </>
            ) : (
              <SignInButton />
            )}
          </div>
        </div>
      </nav>
    </main>
  );
}
