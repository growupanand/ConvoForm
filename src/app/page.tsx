import LogOutButton from "@/components/logoutButton";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/session";
import Link from "next/link";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        {user ? (
          <>
            <p>Welcome {user.name}</p>
            <LogOutButton />
          </>
        ) : (
          <Button>
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
    </main>
  );
}
