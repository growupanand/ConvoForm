export type NavLink = {
  path: string;
  name: string;
  isActive?: boolean;
  getIsActive?: (path: string) => boolean;
  disabled?: boolean;
};

export type NavText = {
  text: string;
};

export type NavSection = {
  title: string;
  links: NavLink[] | NavText[];
  action?: {
    onClick: () => void;
    disabled?: boolean;
    icon: any;
  };
};

export type NavigationConfig = NavSection[] | NavLink[] | NavText[];
