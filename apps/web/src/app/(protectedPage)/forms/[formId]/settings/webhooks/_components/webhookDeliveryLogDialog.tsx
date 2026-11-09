"use client";

import { formatDateTime } from "@/lib/utils";
import { api } from "@/trpc/react";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@convoform/ui";
import { RotateCw } from "lucide-react";
import { useEffect, useState } from "react";

const PAGE_SIZE = 10;

type DeliveryStatus = "pending" | "delivering" | "success" | "failed";

const STATUS_VARIANTS: Record<
  DeliveryStatus,
  {
    label: string;
    variant: "customSuccess" | "customDanger" | "customInfo" | "secondary";
  }
> = {
  success: { label: "Success", variant: "customSuccess" },
  failed: { label: "Failed", variant: "customDanger" },
  delivering: { label: "Delivering", variant: "customInfo" },
  pending: { label: "Pending", variant: "secondary" },
};

function DeliveryStatusBadge({
  status,
  isTest,
}: {
  status: DeliveryStatus;
  isTest: boolean;
}) {
  const config = STATUS_VARIANTS[status] ?? {
    label: status,
    variant: "secondary" as const,
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge variant={config.variant}>{config.label}</Badge>
      {isTest && <Badge variant="outline">Test</Badge>}
    </div>
  );
}

type Props = {
  endpointId: string;
  endpointUrl: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Per-endpoint delivery log. Polls while a delivery is still pending or in
 * flight, then stops.
 */
export function WebhookDeliveryLogDialog({
  endpointId,
  endpointUrl,
  open,
  onOpenChange,
}: Props) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (open) {
      setPage(1);
    }
  }, [endpointId, open]);

  const deliveriesQuery = api.webhookEndpoint.deliveries.useQuery(
    { id: endpointId, page, pageSize: PAGE_SIZE },
    {
      enabled: open,
      refetchOnWindowFocus: false,
      refetchInterval: (query) =>
        query.state.data?.items.some(
          (delivery) =>
            delivery.status === "pending" || delivery.status === "delivering",
        )
          ? 3_000
          : false,
    },
  );

  const data = deliveriesQuery.data;
  const totalPages = data?.totalPages ?? 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Delivery log</DialogTitle>
          <DialogDescription className="break-all">
            {endpointUrl}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-muted-foreground text-xs">
              Only status, response code, latency and error class are stored.
              Payloads are never logged.
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => deliveriesQuery.refetch()}
              disabled={deliveriesQuery.isFetching}
            >
              <RotateCw className="mr-2 size-4" />
              Refresh
            </Button>
          </div>

          {deliveriesQuery.isLoading ? (
            <div className="space-y-2">
              {["row-1", "row-2", "row-3", "row-4"].map((key) => (
                <Skeleton key={key} className="h-10 w-full" />
              ))}
            </div>
          ) : data?.items.length ? (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>HTTP</TableHead>
                    <TableHead>Latency</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell>
                        <DeliveryStatusBadge
                          status={delivery.status as DeliveryStatus}
                          isTest={delivery.isTest}
                        />
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {delivery.lastStatusCode ?? "—"}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {delivery.lastLatencyMs != null
                          ? `${delivery.lastLatencyMs} ms`
                          : "—"}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {delivery.attempts}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDateTime(new Date(delivery.createdAt).getTime())}
                      </TableCell>
                      <TableCell>
                        {delivery.lastError ? (
                          <span
                            className="block max-w-[240px] truncate"
                            title={delivery.lastError}
                          >
                            {delivery.lastError}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-md border border-dashed p-8 text-center">
              <p className="font-medium">No deliveries yet</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Send a test delivery to verify this endpoint.
              </p>
            </div>
          )}

          {data && data.total > 0 && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-muted-foreground text-xs">
                Page {data.page} of {totalPages} ({data.total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1 || deliveriesQuery.isFetching}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                  disabled={page >= totalPages || deliveriesQuery.isFetching}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
