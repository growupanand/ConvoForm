import { constantTimeEqual } from "@convoform/common";
import { RealtimeHub } from "./realtimeHub";
import { WebhookDeliveryWorkflow } from "./webhookDeliveryWorkflow/workflow";

export { RealtimeHub, WebhookDeliveryWorkflow };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/healthcheck") {
      return Response.json({
        status: "ok",
        timestamp: new Date().toISOString(),
      });
    }

    if (url.pathname === "/broadcast" && request.method === "POST") {
      const expectedSecret = env.INTERNAL_EMAIL_API_SECRET;
      const authorization = request.headers.get("authorization") ?? "";

      if (
        !expectedSecret ||
        !constantTimeEqual(authorization, `Bearer ${expectedSecret}`)
      ) {
        return new Response("Unauthorized", { status: 401 });
      }

      const id = env.REALTIME.idFromName("global");
      return env.REALTIME.get(id).fetch(request);
    }

    const upgrade = request.headers.get("Upgrade");
    if (upgrade?.toLowerCase() === "websocket") {
      const id = env.REALTIME.idFromName("global");
      return env.REALTIME.get(id).fetch(request);
    }

    if (upgrade) {
      return new Response("Expected WebSocket", { status: 426 });
    }

    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
