CREATE INDEX "idx_conversation_org_form" ON "Conversation" USING btree ("formId","organizationId");--> statement-breakpoint
CREATE INDEX "idx_conversation_org_status" ON "Conversation" USING btree ("organizationId","isInProgress");--> statement-breakpoint
CREATE INDEX "idx_conversation_form_status" ON "Conversation" USING btree ("formId","isInProgress");--> statement-breakpoint
CREATE INDEX "idx_conversation_created_at" ON "Conversation" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "idx_conversation_org_created_at" ON "Conversation" USING btree ("organizationId","createdAt");--> statement-breakpoint
CREATE INDEX "idx_conversation_finished_at" ON "Conversation" USING btree ("finishedAt") WHERE "Conversation"."finishedAt" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_form_org" ON "Form" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX "idx_form_user_id" ON "Form" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_form_published" ON "Form" USING btree ("isPublished") WHERE "Form"."isPublished" = true;--> statement-breakpoint
CREATE INDEX "idx_form_org_published" ON "Form" USING btree ("organizationId","isPublished");--> statement-breakpoint
CREATE INDEX "idx_form_field_form_id" ON "FormField" USING btree ("formId");