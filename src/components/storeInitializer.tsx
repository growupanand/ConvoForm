"use client";

import { useFormStore } from "@/lib/store/formStore";
import { useWorkspaceStore } from "@/lib/store/workspaceStore";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

type Props = {
  stores: Array<"useFormStore" | "useWorkspaceStore">;
  children: React.ReactNode;
};

const storeAccessors = {
  useFormStore: useFormStore,
  useWorkspaceStore: useWorkspaceStore,
};

/**
 * Here we can initialize the store with the initial state.
 */

export const StoreInitializer = ({ children, stores }: Props) => {
  const storeAccessorsHooks = {} as Record<string, any>;
  stores.forEach((store) => {
    storeAccessorsHooks[store] = storeAccessors[store]?.();
  });

  const initializeStores = () => {
    stores.forEach((store) => {
      storeAccessorsHooks[store]?.initializeStore?.();
    });
  };
  const { orgId } = useAuth();

  useEffect(() => {
    initializeStores();
  }, [orgId]);
  return <>{children}</>;
};
