import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShell } from "../_components/pageShell";
import { ChannelConnectionsList } from "./_components/channelConnectionsList";
import { ChannelConnectionsListLoading } from "./_components/channelConnectionsListLoading";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Channels",
};

/**
 * Server component for the centralized Channels management page.
 * Displays all channel connections across every form in the current organization.
 *
 * @example
 * ```tsx
 * <ChannelsPage />
 * ```
 */
export default async function ChannelsPage() {
  return (
    <PageShell title="Channels">
      <Suspense fallback={<ChannelConnectionsListLoading />}>
        <ChannelConnectionsList />
      </Suspense>
    </PageShell>
  );
}
