"use client";

import { useAuth, useClerk } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";

import Spinner from "@/components/common/spinner";
import { OrganizationPicker } from "./organizationPicker";

export function ActivatePersonalOrganization({
  organizationId,
}: {
  organizationId: string;
}) {
  const { isLoaded } = useAuth();
  const { setActive } = useClerk();
  const startedRef = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!isLoaded || startedRef.current) {
      return;
    }

    startedRef.current = true;

    void setActive({ organization: organizationId })
      .then(() => {
        window.location.assign("/forms");
      })
      .catch((error: unknown) => {
        console.error("Failed to activate personal workspace", error);
        setFailed(true);
      });
  }, [isLoaded, organizationId, setActive]);

  if (failed) {
    return <OrganizationPicker />;
  }

  return <Spinner size="lg" label="Setting up your workspace" />;
}
