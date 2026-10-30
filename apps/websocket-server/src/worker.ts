import { RealtimeHub } from "./realtimeHub";

export { RealtimeHub };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/healthcheck") {
      return Response.json({
        status: "ok",
        timestamp: new Date().toISOString(),
      });
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
