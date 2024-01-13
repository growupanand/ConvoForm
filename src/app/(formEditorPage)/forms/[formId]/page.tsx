import { Metadata } from "next";

import FormEditPage from "@/components/formEditor/formEditPage";

export const metadata: Metadata = {
  title: "Form editor",
};

export default async function FormPage() {
  return <FormEditPage />;
}
