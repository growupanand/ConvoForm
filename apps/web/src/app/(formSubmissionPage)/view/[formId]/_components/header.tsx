import type { Form } from "@convoform/db/src/schema";
import Image from "next/image";

export function FormSubmissionPageHeader({
  form,
}: {
  form: Pick<
    Form,
    | "organizationName"
    | "organizationLogoUrl"
    | "showOrganizationLogo"
    | "showOrganizationName"
  >;
}) {
  const {
    showOrganizationName,
    organizationName,
    showOrganizationLogo,
    organizationLogoUrl,
  } = form;
  return (
    <header className="border-b bg-white">
      <div className=" flex items-center justify-start gap-3 p-3 lg:container">
        {showOrganizationLogo && organizationLogoUrl && (
          <Image
            alt="Organization Logo"
            src={organizationLogoUrl}
            width={30}
            height={30}
          />
        )}
        {showOrganizationName && organizationName && (
          <h1 className="text-xl lg:text-2xl">{organizationName}</h1>
        )}
      </div>
    </header>
  );
}
