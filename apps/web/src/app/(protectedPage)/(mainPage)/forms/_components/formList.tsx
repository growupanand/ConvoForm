"use client";

import { motion } from "motion/react";

import {
  EmptyCard,
  IllustrationImageEnum,
} from "@/components/common/emptyCard";
import { ListCard } from "@/components/common/list";
import { api } from "@/trpc/react";
import CreateFormButton from "./createFormButton";
import { FormListItem } from "./formListItem";
import FormListLoading from "./formListLoading";

type Props = {
  organizationId: string;
};

export function FormList({ organizationId }: Readonly<Props>) {
  const { isLoading, data } = api.form.getAll.useQuery({
    organizationId,
  });

  const forms = data ?? [];
  const emptyForms = forms.length === 0;

  const { data: formWithConversationsCount } =
    api.conversation.getCountByFormIds.useQuery({
      organizationId,
      formIds: forms.map((form) => form.id),
    });

  const getConversationsCount = (formId: string) => {
    return (
      formWithConversationsCount?.find((form) => form.id === formId)
        ?.conversationCount ?? 0
    );
  };

  if (isLoading) {
    return <FormListLoading />;
  }

  return (
    <div className="h-full">
      {emptyForms && (
        <EmptyCard
          title="No Forms Yet"
          description="Get started by creating your first form. Click the button below to get started."
          illustration={IllustrationImageEnum.UnboxingDoodle}
          actionButton={<CreateFormButton organizationId={organizationId} />}
        />
      )}
      {!emptyForms && (
        <ListCard>
          {forms.map((form, index) => (
            <motion.div
              className="slide-down-list-item"
              initial={{ opacity: 0, translate: "0 -0.5rem" }}
              animate={{ opacity: 1, translate: 0 }}
              transition={{ delay: index * 0.1, duration: 0.2 }}
              key={form.id}
            >
              <FormListItem
                form={form}
                conversationsCount={getConversationsCount(form.id)}
              />
            </motion.div>
          ))}
        </ListCard>
      )}
    </div>
  );
}
