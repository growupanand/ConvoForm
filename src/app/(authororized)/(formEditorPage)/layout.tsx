import { StoreInitializer } from "@/components/storeInitializer";
import { FormEditorPageHeader } from "@/components/formEditorPageHeader";

type Props = {
  children: React.ReactNode;
};

export default async function AuthLayout({ children }: Readonly<Props>) {
  return (
    <StoreInitializer stores={["useFormStore"]}>
      <div className="h-screen relative flex flex-col ">
        <FormEditorPageHeader />
        <div className="grow">{children}</div>
      </div>
    </StoreInitializer>
  );
}
