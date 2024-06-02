import Image from "next/image";
import GroovySittingDoodle from "public/images/GroovySittingDoodle.svg";
import MessyDoodle from "public/images/MessyDoodle.svg";
import UnboxingDoodle from "public/images/UnboxingDoodle.svg";

export enum IllustrationImageEnum {
  GroovySittingDoodle = "GroovySittingDoodle",
  UnboxingDoodle = "UnboxingDoodle",
  MessyDoodle = "MessyDoodle",
}

type IllustrationImageName = keyof typeof IllustrationImageEnum;

const illustrationMapping = {
  [IllustrationImageEnum.GroovySittingDoodle]: GroovySittingDoodle,
  [IllustrationImageEnum.UnboxingDoodle]: UnboxingDoodle,
  [IllustrationImageEnum.MessyDoodle]: MessyDoodle,
};

export function EmptyCard({
  title,
  description,
  illustration,
  actionButton,
}: {
  title: string;
  illustration?: IllustrationImageName | React.ReactNode;
  description?: string;
  actionButton?: React.ReactNode;
}) {
  const getIllustration = () => {
    if (illustration) {
      if (
        typeof illustration === "string" &&
        illustration in IllustrationImageEnum
      ) {
        const IllustrationComponent =
          illustrationMapping[
            IllustrationImageEnum[illustration as IllustrationImageName]
          ];
        return (
          <span className="relative h-[200px] w-full">
            <Image
              fill
              alt="Illustration for empty state"
              src={IllustrationComponent}
            />
          </span>
        );
      }
      return illustration;
    }
    return null;
  };

  return (
    <div className="flex  flex-col items-center justify-center py-10">
      {getIllustration()}
      <h3 className="mt-2 text-xl font-medium text-gray-700 lg:text-2xl">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-center text-base text-gray-500 lg:text-lg">
          {description}
        </p>
      )}
      {actionButton && (
        <div className="mt-10 flex items-center justify-center">
          {actionButton}
        </div>
      )}
    </div>
  );
}
