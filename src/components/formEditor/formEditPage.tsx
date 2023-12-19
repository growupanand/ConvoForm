"use client";

import { FormWithFields } from "@/lib/types/form";
import FormPreview from "./formPreview";
import FormEditor from "../formEditor";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useState } from "react";

type Props = {
  form: FormWithFields;
};

type State = {
  form: FormWithFields;
};

export default function FormEditPage(props: Props) {
  const [state, setState] = useState<State>({
    form: props.form,
  });
  const { form } = state;

  const onUpdateForm = (form: FormWithFields) => {
    setState({ form });
  };

  return (
    <div className="flex h-full">
      <div className=" w-[400px] bg-gray-50">
        <Card className="bg-transparent border-0 shadow-none">
          <CardHeader>
            <CardTitle>Editor</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <FormEditor form={form} onUpdated={onUpdateForm} />
          </CardContent>
        </Card>
      </div>
      <div className="grow flex flex-col">
        <FormPreview form={form} />
      </div>
    </div>
  );
}
