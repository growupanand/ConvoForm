import FormEditPage from "@/components/formEditor/formEditPage";
import { getFormDetailsWithFields } from "@/lib/dbControllers/form";

type Props = {
  params: { formId: string };
};

export default async function FormPage(props: Props) {
  const { formId } = props.params;
  const form = await getFormDetailsWithFields(formId);
  return <FormEditPage form={form} />;
}
