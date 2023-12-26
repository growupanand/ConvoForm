import { auth } from "@clerk/nextjs";

export const getUserId = () => {
  const { userId } = auth();
  if (!userId) {
    const error = new Error("User is not logged in");
    error.name = "Unauthorized";
    throw error;
  }
  return userId;
};
