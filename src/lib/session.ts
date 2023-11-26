import { getServerSession } from "next-auth/next";
import { authOptions } from "./authOptions";
import { redirect } from "next/navigation";





/**
 * The function `getCurrentUser` retrieves the current user from the server session and redirects to
 * the home page if the session or user is not available.
 * @returns The user object from the session.
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/");
  };

  return session!.user
}



/**
 * The function `getLoggedStatus` returns a boolean indicating whether a user is logged in or not.
 * @returns a boolean value indicating whether a user is logged in or not.
 */
export async function getLoggedStatus() {
  const session = await getServerSession(authOptions);

  return !!session?.user
}