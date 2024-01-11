import BrandName from "../brandName";

type Props = {
  endScreenMessage: string;
};

export const EndScreen = (props: Props) => {
  const message = props.endScreenMessage || "Thank you for filling the form!";
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-center text-2xl font-bold">{message}</h1>
      <p className="text-center text-muted-foreground">
        You can now close this window.
      </p>
      <div className="mt-10 flex items-center gap-3">
        <p className="text-sm text-muted-foreground">
          This form is created at -
        </p>
        <BrandName />
      </div>
    </div>
  );
};
