import { auth, OrganizationList } from "@clerk/nextjs";

type Props = {
  children: React.ReactNode;
};

export const OrganizationRequired = ({ children }: Readonly<Props>) => {
  const { orgId } = auth();

  if (!orgId) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <OrganizationList
          afterSelectOrganizationUrl="/dashboard"
          hidePersonal
        />
      </div>
    );
  }

  return <>{children}</>;
};
