"use client";

import { useSession } from "next-auth/react";

export const useUser = () => {
  const { data, status } = useSession();

  const user = data?.user;

  return { user, status };
};
