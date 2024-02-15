"use client";

import { ListCard } from "@/components/common/list";
import { api } from "@/trpc/react";
import { FormListItem } from "./formListItem";
import FormListLoading from "./formListLoading";

type Props = {
  workspaceId: string;
  orgId: string;
};

export default function FormList({ workspaceId, orgId }: Readonly<Props>) {
  const { isLoading, data } = api.form.getAll.useQuery({
    workspaceId,
    organizationId: orgId,
  });

  const forms = data ?? [];
  const emptyForms = forms.length === 0;

  if (isLoading) {
    return <FormListLoading />;
  }

  return (
    <div className="h-full">
      {emptyForms && <p className="text-muted-foreground">No form</p>}
      {!emptyForms && (
        <ListCard>
          {forms.map((form) => (
            <FormListItem key={form.id} form={form} />
          ))}
        </ListCard>
      )}
    </div>
  );
}
