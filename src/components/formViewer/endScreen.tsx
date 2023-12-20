type Props = {
  endScreenMessage: string;
};

export const EndScreen = (props: Props) => {
  const message = props.endScreenMessage || "Thank you for filling the form!";
  return (
    <div className="flex flex-col justify-center items-center">
      <h1 className="text-2xl font-bold text-center">{message}</h1>
      <p className="text-center text-muted-foreground">
        You can now close this window.
      </p>
    </div>
  );
};
