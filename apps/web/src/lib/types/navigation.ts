import { NavigationTextVariants } from "@/app/(protectedPage)/(mainPage)/_components/mainNavigation/navigationText";

export type NavItemAction = {
  label: string;
  onClick: () => Promise<void>;
};

export type NavLink = {
  path: string;
  name: string;
  isActive?: boolean;
  getIsActive?: (path: string) => boolean;
  disabled?: boolean;
};

export type NavText = {
  text: string;
  variant?: NavigationTextVariants;
  action?: NavItemAction;
};

export type NavSection = {
  title: string;
  links: NavLink[] | NavText[];
  action?: {
    onClick: () => Promise<void>;
    disabled?: boolean;
    icon: any;
  };
};

export type NavigationConfig = NavSection[] | NavLink[] | NavText[];
