import { FormDesignProvider } from "@/components/formViewer/formDesignContext";

type Props = {
  children: React.ReactNode;
  params: { formId: string };
};

export default function Layout({
  children,
  params: { formId },
}: Readonly<Props>) {
  return <FormDesignProvider formId={formId}>{children}</FormDesignProvider>;
}
