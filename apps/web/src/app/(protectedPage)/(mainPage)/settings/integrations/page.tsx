"use client";

import { api } from "@/trpc/react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@convoform/ui";
import { toast } from "@convoform/ui";
import { Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function IntegrationsPage() {
  const router = useRouter();
  const utils = api.useUtils();
  const { data: integrations, isLoading } = api.integration.list.useQuery(
    undefined,
    {
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    },
  );
  const connectMutation = api.integration.connect.useMutation({
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const disconnectMutation = api.integration.disconnect.useMutation({
    onSuccess: () => {
      toast.success("Disconnected successfully");
      router.refresh(); // Refresh server components
      utils.integration.list.invalidate(); // Invalidate client cache
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleConnect = (provider: string) => {
    connectMutation.mutate({ provider });
  };

  const handleDisconnect = (provider: string) => {
    if (confirm("Are you sure you want to disconnect?")) {
      disconnectMutation.mutate({ provider });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 space-y-6">
        <h1 className="text-3xl font-bold">Integrations</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold">Integrations</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {integrations?.map((integration) => (
          <Card key={integration.id}>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>{integration.name}</CardTitle>
                <CardDescription>
                  {integration.connected ? "Connected" : "Not connected"}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {integration.connected ? (
                <Button
                  variant="destructive"
                  onClick={() => handleDisconnect(integration.id)}
                  disabled={disconnectMutation.isPending}
                >
                  Disconnect
                </Button>
              ) : (
                <Button
                  onClick={() => handleConnect(integration.id)}
                  disabled={connectMutation.isPending}
                >
                  Connect
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
