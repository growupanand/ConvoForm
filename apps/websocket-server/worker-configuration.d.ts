interface Env {
  REALTIME: DurableObjectNamespace;
  NEXT_PUBLIC_APP_URL: string;
  INTERNAL_EMAIL_API_SECRET: string;
  WEBHOOK_DELIVERY: Workflow<{ deliveryId: string }>;
}
