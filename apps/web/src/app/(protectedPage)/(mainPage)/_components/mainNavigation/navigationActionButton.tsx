import { Button } from "@convoform/ui/components/ui/button";

type Props = {
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

function NavigationActionButton({ disabled, onClick, children }: Props) {
  return (
    <Button
      variant="outline"
      className="p-1 rounded-full  hover:no-underline h-auto"
      disabled={disabled}
      onClick={onClick}
      size="sm"
    >
      {children}
    </Button>
  );
}

export { NavigationActionButton };
