


type NavbarLink = {
    name: string;
    href: string;
    };


export const appNavbarConfig= {
    dashboardLinks : [
        {
          name: "Dashboard",
          href: "/dashboard",
        },
        {
          name: "Workspaces",
          href: "/dashboard/workspaces",
        },
      ] as NavbarLink[]
};