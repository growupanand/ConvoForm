import LoginButton from "@/components/loginButton";
import { getCurrentUser } from "@/lib/session";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <LoginButton user={user} />
    </main>
  );
}
