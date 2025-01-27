"use client";

import type { Workspace } from "@convoform/db/src/schema";
import { motion, stagger, useAnimate } from "motion/react";
import { useEffect } from "react";

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
  workspace: Workspace;
};

export function FormList({ workspace }: Readonly<Props>) {
  const [scope, animate] = useAnimate();

  const { isLoading, data } = api.form.getAll.useQuery({
    workspaceId: workspace.id,
    organizationId: workspace.organizationId,
  });

  const forms = data ?? [];
  const emptyForms = forms.length === 0;

  const { data: formWithConversationsCount } =
    api.conversation.getCountByFormIds.useQuery({
      organizationId: workspace.organizationId,
      formIds: forms.map((form) => form.id),
    });

  const getConversationsCount = (formId: string) => {
    return (
      formWithConversationsCount?.find((form) => form.id === formId)
        ?.conversationCount ?? 0
    );
  };

  const loadListItems = async () => {
    if (!isLoading && !emptyForms) {
      animate(
        ".slide-down-list-item",
        { opacity: 1, translate: 0 },
        { delay: stagger(0.1), duration: 0.2 },
      );
    }
  };

  useEffect(() => {
    loadListItems();
  }, [forms.length]);

  if (isLoading) {
    return <FormListLoading />;
  }

  return (
    <div className="h-full" ref={scope}>
      {emptyForms && (
        <EmptyCard
          title="No Forms Yet"
          description="Get started by creating your first form. Click the button below to get started."
          illustration={IllustrationImageEnum.UnboxingDoodle}
          actionButton={<CreateFormButton workspace={workspace} />}
        />
      )}
      {!emptyForms && (
        <ListCard>
          {forms.map((form) => (
            <motion.div
              className="slide-down-list-item"
              initial={{ opacity: 0, translate: "0 -0.5rem" }}
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
