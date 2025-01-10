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
    <div className="grid gap-y-6">
      {navigationLinks.map((navLink) => {
        if ("links" in navLink) {
          return (
            <div key={navLink.title}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground font-semibold ">
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
                <div className="grid gap-y-1">
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
                        key={`${link.link}-${link.name}`}
                        isActive={link.isActive}
                        link={link.link}
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
            key={`${navLink.link}-${navLink.name}`}
            isActive={navLink.isActive}
            link={navLink.link}
            name={navLink.name}
          />
        );
      })}
    </div>
  );
}

export { MainNavigation as NavigationLinks };
