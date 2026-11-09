import { relations } from "drizzle-orm";

import { channelConnection } from "./channelConnections/channelConnection";
import { conversation } from "./conversations/conversation";
import { fileUpload } from "./fileUploads/fileUpload";
import { formDesign } from "./formDesigns/formDesigns";
import { formField } from "./formFields/formField";
import { form } from "./forms/form";
import { formIntegration } from "./integrations/formIntegration";
import { integration } from "./integrations/integration";
import { organization } from "./organizations/organization";
import { webhookDelivery } from "./webhooks/webhookDelivery";
import { webhookEndpoint } from "./webhooks/webhookEndpoint";

export const formFieldRelations = relations(formField, ({ one }) => ({
  form: one(form, {
    fields: [formField.formId],
    references: [form.id],
  }),
}));

export const formRelations = relations(form, ({ many }) => ({
  formFields: many(formField),
  conversations: many(conversation),
  formIntegrations: many(formIntegration),
  webhookEndpoints: many(webhookEndpoint),
}));

export const conversationRelations = relations(conversation, ({ one }) => ({
  form: one(form, {
    fields: [conversation.formId],
    references: [form.id],
  }),
}));

export const integrationRelations = relations(integration, ({ many }) => ({
  formIntegrations: many(formIntegration),
}));

export const formIntegrationRelations = relations(
  formIntegration,
  ({ one }) => ({
    form: one(form, {
      fields: [formIntegration.formId],
      references: [form.id],
    }),
    integration: one(integration, {
      fields: [formIntegration.integrationId],
      references: [integration.id],
    }),
  }),
);

export const channelConnectionRelations = relations(
  channelConnection,
  ({ one }) => ({
    form: one(form, {
      fields: [channelConnection.formId],
      references: [form.id],
    }),
  }),
);

export const fileUploadRelations = relations(fileUpload, ({ one }) => ({
  organization: one(organization, {
    fields: [fileUpload.organizationId],
    references: [organization.id],
  }),
  form: one(form, {
    fields: [fileUpload.formId],
    references: [form.id],
  }),
  conversation: one(conversation, {
    fields: [fileUpload.conversationId],
    references: [conversation.id],
  }),
}));

export const formDesignsRelations = relations(formDesign, ({ one }) => ({
  form: one(form, {
    fields: [formDesign.formId],
    references: [form.id],
  }),
}));

export const webhookEndpointRelations = relations(
  webhookEndpoint,
  ({ one, many }) => ({
    form: one(form, {
      fields: [webhookEndpoint.formId],
      references: [form.id],
    }),
    deliveries: many(webhookDelivery),
  }),
);

export const webhookDeliveryRelations = relations(
  webhookDelivery,
  ({ one }) => ({
    endpoint: one(webhookEndpoint, {
      fields: [webhookDelivery.endpointId],
      references: [webhookEndpoint.id],
    }),
  }),
);
