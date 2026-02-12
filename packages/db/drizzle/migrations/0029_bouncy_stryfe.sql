CREATE INDEX "idx_conversation_field_responses" ON "Conversation" USING gin ("formFieldResponses");--> statement-breakpoint
CREATE INDEX "idx_conversation_meta_data" ON "Conversation" USING gin ("metaData");--> statement-breakpoint
CREATE INDEX "idx_form_field_config" ON "FormField" USING gin ("fieldConfiguration");--> statement-breakpoint
DROP TYPE "public"."inputTypeEnum";