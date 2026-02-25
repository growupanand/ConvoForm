CREATE TABLE "ChannelConnection" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"formId" text NOT NULL,
	"channelType" text NOT NULL,
	"channelConfig" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"organizationId" text NOT NULL,
	CONSTRAINT "ChannelConnection_id_unique" UNIQUE("id"),
	CONSTRAINT "uq_channel_connection_type_form" UNIQUE("channelType","formId")
);
--> statement-breakpoint
ALTER TABLE "Conversation" ADD COLUMN "channelType" text;--> statement-breakpoint
ALTER TABLE "Conversation" ADD COLUMN "channelSenderId" text;--> statement-breakpoint
ALTER TABLE "ChannelConnection" ADD CONSTRAINT "ChannelConnection_formId_Form_id_fk" FOREIGN KEY ("formId") REFERENCES "public"."Form"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "idx_channel_connection_form_id" ON "ChannelConnection" USING btree ("formId");--> statement-breakpoint
CREATE INDEX "idx_channel_connection_org_id" ON "ChannelConnection" USING btree ("organizationId");--> statement-breakpoint
ALTER TABLE "FormIntegration" ADD CONSTRAINT "FormIntegration_formId_Form_id_fk" FOREIGN KEY ("formId") REFERENCES "public"."Form"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "FormIntegration" ADD CONSTRAINT "FormIntegration_integrationId_Integration_id_fk" FOREIGN KEY ("integrationId") REFERENCES "public"."Integration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_conversation_channel_type" ON "Conversation" USING btree ("channelType") WHERE "Conversation"."channelType" IS NOT NULL;