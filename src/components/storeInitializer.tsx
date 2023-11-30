"use client";

import { useWorkspaceStore } from "@/lib/store/workspaceStore";
import { useEffect } from "react";

/**
 * Here we can initialize the store with the initial state.
 */

export const StoreInitializer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const workspaceStore = useWorkspaceStore();

  const initializeStores = () => {
    workspaceStore.fetchWorkspaces();
  };

  useEffect(() => {
    initializeStores();
  }, []);
  return <>{children}</>;
};
