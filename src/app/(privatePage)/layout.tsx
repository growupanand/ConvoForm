import { OrganizationRequired } from "@/components/wrappers/OrganizationRequired";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return <OrganizationRequired>{children}</OrganizationRequired>;
}
