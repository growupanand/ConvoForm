import BrandName from "../common/brandName";

type Props = {
  endScreenMessage: string;
};

export const EndScreen = (props: Props) => {
  const message =
    props.endScreenMessage !== ""
      ? props.endScreenMessage
      : "Thank you for filling the form!";
  return (
    <div className="flex flex-col items-center justify-center">
      <p className="text-muted-foreground text-center">
        You can now close this window.
      </p>
      <h1 className="whitespace-break-spaces break-words text-center text-2xl font-semibold lg:text-4xl">
        {message}
      </h1>
      <div className="mt-10 flex items-center">
        <p className="text-muted-foreground mr-2 text-sm">Form created using</p>
        <BrandName />
      </div>
    </div>
  );
};
