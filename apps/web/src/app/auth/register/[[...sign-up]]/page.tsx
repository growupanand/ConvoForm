import { SignUp, auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

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
