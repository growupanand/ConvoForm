import { FormViewer } from "@/components/newFormViewer/formViewer";
import { formUpdateSchema } from "@/lib/validations/form";

export const FormPreview = ({ form }: { form: any }) => {
  const validForm = formUpdateSchema.safeParse(form);
  const isValidForm = validForm.success;

  if (!form) {
    return <FormNotFound />;
  }
  if (!isValidForm) {
    return <InvalidForm />;
  }
  return <FormViewer form={form} isPreview={false} />;
};

const InvalidForm = () => (
  <p className="text-muted-foreground">
    Unable to preview form, Please check all form details are filled.
  </p>
);

const FormNotFound = () => (
  <p className="text-muted-foreground">Form not found</p>
);
