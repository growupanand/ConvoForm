import { NextAuthProvider } from "@/components/nextAuthProvider";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

type Props = {
  children: React.ReactNode;
};

export default async function AuthorizedLayout({ children }: Readonly<Props>) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }
  return <NextAuthProvider>{children}</NextAuthProvider>;
}
