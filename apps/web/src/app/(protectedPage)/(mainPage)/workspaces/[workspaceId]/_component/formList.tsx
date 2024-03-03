"use client";

import { useEffect } from "react";
import { motion, stagger, useAnimate } from "framer-motion";

import { ListCard } from "@/components/common/list";
import { api } from "@/trpc/react";
import { FormListItem } from "./formListItem";
import FormListLoading from "./formListLoading";

type Props = {
  workspaceId: string;
  orgId: string;
};

export default function FormList({ workspaceId, orgId }: Readonly<Props>) {
  const [scope, animate] = useAnimate();

  const { isLoading, data } = api.form.getAll.useQuery({
    workspaceId,
    organizationId: orgId,
  });

  const forms = data ?? [];
  const emptyForms = forms.length === 0;

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
  }, [isLoading, emptyForms]);

  if (isLoading) {
    return <FormListLoading />;
  }

  return (
    <div className="h-full" ref={scope}>
      {emptyForms && <p className="text-muted-foreground">No form</p>}
      {!emptyForms && (
        <ListCard>
          {forms.map((form) => (
            <motion.div
              className="slide-down-list-item"
              initial={{ opacity: 0, translate: "0 -0.5rem" }}
              key={form.id}
            >
              <FormListItem form={form} />
            </motion.div>
          ))}
        </ListCard>
      )}
    </div>
  );
}
