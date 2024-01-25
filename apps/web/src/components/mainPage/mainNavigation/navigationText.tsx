type Props = {
  text: string;
};

function NavigationText({ text }: Readonly<Props>) {
  return (
    <div>
      <div className="flex items-center justify-between ">
        <span className="text-muted-foreground ps-4 text-sm font-normal">
          {text}
        </span>
      </div>
    </div>
  );
}

export { NavigationText };
