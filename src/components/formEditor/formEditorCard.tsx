"use client";

import FormEditor from "../formEditor";
import { Card, CardContent } from "../ui/card";
import { useFormEditorContext } from "@/app/(formEditorPage)/context";

export default function FormEditorCard() {
  const { form, handleUpdateForm } = useFormEditorContext();

  return (
    <Card className="bg-transparent border-0 shadow-none">
      <CardContent className="pt-3">
        <FormEditor form={form} onUpdated={handleUpdateForm} />
      </CardContent>
    </Card>
  );
}
