import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShell } from "../../_components/pageShell";
import { IntegrationList } from "./_components/integrationList";
import IntegrationListLoading from "./_components/integrationListLoading";

export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Integrations",
};

/**
 * Server component for the Integrations page.
 * Uses PageShell for consistent layout and Suspense for loading the integrations list.
 *
 * @example
 * ```tsx
 * <IntegrationsPage />
 * ```
 */
export default async function IntegrationsPage() {
  return (
    <PageShell title="Integrations">
      <Suspense fallback={<IntegrationListLoading />}>
        <IntegrationList />
      </Suspense>
    </PageShell>
  );
}
