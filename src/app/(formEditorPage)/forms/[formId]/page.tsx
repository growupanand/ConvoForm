import FormEditPage from "@/components/formEditor/formEditPage";
import { getFormDetailsWithFields } from "@/lib/dbControllers/form";
import { getCurrentUser } from "@/lib/session";
import { notFound } from "next/navigation";

type Props = {
  params: { formId: string };
};

export default async function FormPage(props: Props) {
  const { formId } = props.params;
  const user = await getCurrentUser();
  const form = await getFormDetailsWithFields(formId, user.id);
  if (!form) {
    return notFound();
  }
  return <FormEditPage form={form} />;
}
