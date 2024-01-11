import { FormEditorPageHeader } from "@/components/formEditor/formEditorPageHeader";
import { StoreInitializer } from "@/components/storeInitializer";

type Props = {
  children: React.ReactNode;
};

export default async function AuthLayout({ children }: Readonly<Props>) {
  return (
    <StoreInitializer stores={["useFormStore"]}>
      <div className="relative flex h-screen flex-col ">
        <FormEditorPageHeader />
        <div className="grow">{children}</div>
      </div>
    </StoreInitializer>
  );
}
