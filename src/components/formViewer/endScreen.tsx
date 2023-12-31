import BrandName from "../brandName";

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
      <div className="mt-10 flex items-center gap-3">
        <p className="text-muted-foreground text-sm">
          This form is created at -
        </p>
        <BrandName />
      </div>
    </div>
  );
};
