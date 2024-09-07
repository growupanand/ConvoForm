import { ScrollArea } from "@convoform/ui/components/ui/scroll-area";

import type { NavigationConfig } from "@/lib/types/navigation";
import { NavigationActionButton } from "./navigationActionButton";
import NavigationLinkItem from "./navigationLinkItem";
import { NavigationText } from "./navigationText";

function MainNavigation({
  navigationLinks,
}: {
  navigationLinks: NavigationConfig;
}) {
  return (
    <div className="grid gap-2">
      {navigationLinks.map((navLink) => {
        if ("links" in navLink) {
          return (
            <div key={navLink.title}>
              <div className="flex items-center justify-between ">
                <span className="text-muted-foreground ps-4 text-sm font-medium">
                  {navLink.title}
                </span>
                {navLink.action && (
                  <NavigationActionButton
                    onClick={navLink.action.onClick}
                    disabled={navLink.action.disabled}
                  >
                    {navLink.action.icon}
                  </NavigationActionButton>
                )}
              </div>
              <ScrollArea className="h-96">
                <div className="grid">
                  {navLink.links.map((link) =>
                    "text" in link ? (
                      <NavigationText
                        key={link.text}
                        text={link.text}
                        variant={link.variant}
                        action={link.action}
                      />
                    ) : (
                      <NavigationLinkItem
                        key={`${link.path}-${link.name}`}
                        isActive={link.isActive}
                        href={link.path}
                        name={link.name}
                      />
                    ),
                  )}
                </div>
              </ScrollArea>
            </div>
          );
        }

        if ("text" in navLink) {
          return (
            <NavigationText
              key={navLink.text}
              text={navLink.text}
              variant={navLink.variant}
              action={navLink.action}
            />
          );
        }

        return (
          <NavigationLinkItem
            key={`${navLink.path}-${navLink.name}`}
            isActive={navLink.isActive}
            href={navLink.path}
            name={navLink.name}
          />
        );
      })}
    </div>
  );
}

export { MainNavigation as NavigationLinks };
