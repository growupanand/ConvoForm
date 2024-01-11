"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

import { useFormStore } from "@/lib/store/formStore";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Readonly<Props>) {
  const params = useParams();
  const formId = params?.formId as string | undefined;
  const formStore = useFormStore();

  useEffect(() => {
    if (formId) {
      formStore.initializeStore(formId);
    }
  }, [formId]);

  return <>{children}</>;
}
