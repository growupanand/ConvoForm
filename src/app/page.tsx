import BrandName from "@/components/brandName";
import LogOutButton from "@/components/logoutButton";
import { Button } from "@/components/ui/button";
import { getLoggedStatus } from "@/lib/session";
import Link from "next/link";

export default async function Home() {
  const isUserLoggedIn = await getLoggedStatus();

  return (
    <main className="min-h-screen container">
      <nav className="flex justify-between items-center p-3">
        <BrandName />
        <div>
          {isUserLoggedIn ? (
            <div className="flex items-center gap-3 p-5">
              <Link href="/dashboard">
                <Button variant="secondary">Go to Dashboard</Button>
              </Link>
              <LogOutButton />
            </div>
          ) : (
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          )}
        </div>
      </nav>
    </main>
  );
}
