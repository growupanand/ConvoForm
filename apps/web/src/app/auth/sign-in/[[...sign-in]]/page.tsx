import { redirect } from "next/navigation";
import { auth, SignIn } from "@clerk/nextjs";

export default function Page() {
  const { userId } = auth();
  if (userId) {
    redirect("/dashboard");
  }
  return (
    <div className=" flex items-center justify-center">
      <SignIn />
    </div>
  );
}
