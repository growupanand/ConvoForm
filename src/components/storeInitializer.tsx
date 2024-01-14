"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

import { useFormStore } from "@/lib/store/formStore";

type Props = {
  stores: Array<"useFormStore">;
  children: React.ReactNode;
};

const storeAccessors = {
  useFormStore: useFormStore,
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
