import { SignUp } from "@clerk/nextjs";

import { clerkAuthAppearance } from "../../clerkAuthAppearance";

export default function Page() {
  return <SignUp appearance={clerkAuthAppearance} />;
}
