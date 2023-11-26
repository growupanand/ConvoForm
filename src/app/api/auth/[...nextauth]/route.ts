import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

/**
 * We are storing the authOptions in a separate file to fix below build error. (https://github.com/vercel/next.js/discussions/50511)
 * 
 * Type error: Route "src/app/api/auth/[...nextauth]/route.tsx" does not match the required types of a Next.js Route.
  "authOptions" is not a valid Route export field.
 */

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
