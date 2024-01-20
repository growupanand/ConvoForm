import { Button } from "../../ui/button";

type Props = {
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

function NavigationActionButton({ disabled, onClick, children }: Props) {
  return (
    <Button
      variant="link"
      className="pe-0 hover:no-underline"
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export { NavigationActionButton };
