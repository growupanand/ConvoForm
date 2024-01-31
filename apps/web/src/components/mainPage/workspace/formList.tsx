"use client";

import { api } from "@/trpc/client";
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
        <div className="divide-border grid divide-y border-b">
          {forms.map((form) => (
            <FormListItem key={form.id} form={form} />
          ))}
        </div>
      )}
    </div>
  );
}
