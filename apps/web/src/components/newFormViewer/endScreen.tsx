import Image from "next/image";

import BrandName from "../common/brandName";

type Props = {
  endScreenMessage?: string;
};

export const EndScreen = (props: Props) => {
  const message = props.endScreenMessage || "Thank you for filling the form!";
  return (
    <div className="flex flex-col items-center justify-center">
      <p className="text-muted-foreground text-center">
        You can now close this window.
      </p>
      <h1 className="whitespace-break-spaces break-words text-center text-2xl font-semibold lg:text-4xl">
        {message}
      </h1>
      <div className="relative mt-10 h-[200px] w-full">
        <Image
          src="/images/GroovySittingDoodle.svg"
          alt="thank you image"
          fill
        />
      </div>
      <div className="mt-2 flex items-center">
        <p className="text-muted-foreground mr-2 text-sm">Form created using</p>
        <BrandName />
      </div>
    </div>
  );
};
