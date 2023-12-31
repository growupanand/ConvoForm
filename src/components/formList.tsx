"use client";
import { Form } from "@prisma/client";
import { useEffect, useState } from "react";
import { FormListItem } from "./formListItem";
import { getFormsController } from "@/lib/controllers/form";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import FormListLoading from "./formListLoading";

type State = {
  isLoading: boolean;
  forms: Form[];
};

export default function FormList() {
  const [state, setState] = useState<State>({
    isLoading: true,
    forms: [],
  });
  const { forms, isLoading } = state;
  const emptyForms = forms.length === 0;

  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const fetchForms = async () => {
    setState((cs) => ({
      ...cs,
      isLoading: true,
    }));
    try {
      const formsResponse = await getFormsController(workspaceId);
      setState((cs) => ({
        ...cs,
        forms: formsResponse,
      }));
    } catch (err) {
      toast({
        title: "Unable to fetch forms",
        action: (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={isLoading}
            onClick={fetchForms}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Retry"}
          </Button>
        ),
      });
    } finally {
      setState((cs) => ({
        ...cs,
        isLoading: false,
      }));
    }
  };

  const onFormDelete = (form: Form) =>
    setState((cs) => ({
      ...cs,
      forms: cs.forms.filter((item) => item.id !== form.id),
    }));

  useEffect(() => {
    fetchForms();
  }, []);

  return (
    <div>
      {isLoading && <FormListLoading />}
      {!isLoading && emptyForms && (
        <p className="text-muted-foreground">No form</p>
      )}
      {!isLoading && !emptyForms && (
        <div className="grid divide-y divide-border border-b">
          {forms.map((form) => (
            <FormListItem key={form.id} form={form} onDeleted={onFormDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
