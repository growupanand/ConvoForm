ALTER TABLE "ChannelConnection" DROP CONSTRAINT "ChannelConnection_formId_Form_id_fk";
--> statement-breakpoint
ALTER TABLE "ChannelConnection" ALTER COLUMN "formId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ChannelConnection" ALTER COLUMN "channelIdentifier" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ChannelConnection" ADD CONSTRAINT "ChannelConnection_formId_Form_id_fk" FOREIGN KEY ("formId") REFERENCES "public"."Form"("id") ON DELETE set null ON UPDATE cascade;