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
    <div className="flex gap-5 px-5 pt-5 h-[calc(100vh-100px)]">
      <div className=" z-40 rounded-lg overflow-y-scroll min-w-[300px] w-[400px]">
        <Card className="border-0 shadow-none bg-transparent">
          <CardContent>
            <FormEditor form={form} onUpdated={onUpdateForm} />
          </CardContent>
        </Card>
      </div>
      <div className="grow ">
        <FormPreview form={form} />
      </div>
    </div>
  );
}
