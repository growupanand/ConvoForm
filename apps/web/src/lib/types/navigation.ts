import type { NavigationTextVariants } from "@/app/(protectedPage)/(mainPage)/_components/mainNavigation/navigationText";

export type NavItemAction = {
  label: string;
  onClick: () => Promise<void>;
};

export type NavLink = {
  link: string;
  name: string;
  isActive?: boolean;
  getIsActive?: (link: string) => boolean;
  disabled?: boolean;
  activeClassName?: string;
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
