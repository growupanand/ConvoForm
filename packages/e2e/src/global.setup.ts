import { clerkSetup } from "@clerk/testing/playwright";

async function globalSetup() {
  await clerkSetup();
}

export default globalSetup;
