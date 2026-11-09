CREATE TABLE "WebhookEndpoint" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"formId" text NOT NULL,
	"organizationId" text NOT NULL,
	"url" text NOT NULL,
	"encryptedSecret" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"consecutiveFailures" integer DEFAULT 0 NOT NULL,
	"disabledAt" timestamp,
	"disabledReason" text,
	CONSTRAINT "WebhookEndpoint_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "WebhookDelivery" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"endpointId" text NOT NULL,
	"conversationId" text,
	"organizationId" text NOT NULL,
	"eventType" text DEFAULT 'response.completed' NOT NULL,
	"isTest" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"lastStatusCode" integer,
	"lastLatencyMs" integer,
	"lastError" text,
	"workflowInstanceId" text,
	"deliveredAt" timestamp,
	CONSTRAINT "WebhookDelivery_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "WebhookEndpoint" ADD CONSTRAINT "WebhookEndpoint_formId_Form_id_fk" FOREIGN KEY ("formId") REFERENCES "public"."Form"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_endpointId_WebhookEndpoint_id_fk" FOREIGN KEY ("endpointId") REFERENCES "public"."WebhookEndpoint"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_webhook_endpoint_form_id" ON "WebhookEndpoint" USING btree ("formId");--> statement-breakpoint
CREATE INDEX "idx_webhook_endpoint_organization_id" ON "WebhookEndpoint" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX "idx_webhook_delivery_endpoint_created_at" ON "WebhookDelivery" USING btree ("endpointId","createdAt");--> statement-breakpoint
CREATE INDEX "idx_webhook_delivery_conversation_id" ON "WebhookDelivery" USING btree ("conversationId");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_webhook_delivery_endpoint_conversation_event" ON "WebhookDelivery" USING btree ("endpointId","conversationId","eventType") WHERE "WebhookDelivery"."isTest" = false;