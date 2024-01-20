type Props = {
  text: string;
};

function NavigationText({ text }: Readonly<Props>) {
  return (
    <div>
      <div className="flex items-center justify-between ">
        <span className="ps-4 text-sm font-normal text-muted-foreground">
          {text}
        </span>
      </div>
    </div>
  );
}

export { NavigationText };
