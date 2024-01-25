import { redirect } from "next/navigation";
import { auth, SignUp } from "@clerk/nextjs";

export default function Page() {
  const { userId } = auth();
  if (userId) {
    redirect("/dashboard");
  }
  return (
    <div className="flex items-center justify-center">
      <SignUp />
    </div>
  );
}
