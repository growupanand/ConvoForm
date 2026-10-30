import { SignIn } from "@clerk/nextjs";

import { clerkAuthAppearance } from "../../clerkAuthAppearance";

export default function Page() {
  return <SignIn appearance={clerkAuthAppearance} />;
}
