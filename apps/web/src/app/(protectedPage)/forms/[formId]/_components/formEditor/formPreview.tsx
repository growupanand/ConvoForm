import { formSubmissionSchema } from "@convoform/db/src/schema";

import {
  EmptyCard,
  IllustrationImageEnum,
} from "@/components/common/emptyCard";
import { FormViewer } from "@/components/formViewer/formViewer";

export const FormPreview = ({ form }: { form: any }) => {
  const validForm = formSubmissionSchema.safeParse(form);
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
  <EmptyCard
    title="Unable to preview form"
    description="The form cannot be previewed due to empty form or invalid fields."
    illustration={IllustrationImageEnum.MessyDoodle}
  />
);

const FormNotFound = () => (
  <p className="text-muted-foreground">Form not found</p>
);
