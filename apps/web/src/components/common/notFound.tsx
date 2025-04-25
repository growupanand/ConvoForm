import BrandNameLink from "./brandName";

type Props = {
  title?: string;
  description?: string;
  code?: number;
  action?: React.ReactNode;
};

function NotFoundPage({ title, description, code, action }: Readonly<Props>) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 ">
      <h1 className="animate-bounce text-9xl font-bold text-gray-800 dark:text-gray-200 ">
        {code?.toString() ?? "404"}
      </h1>
      <h2 className="mt-2 text-3xl font-semibold text-gray-600 dark:text-gray-300 ">
        {title ?? "Page not found"}
      </h2>
      <p className="mt-2 max-w-lg text-center text-lg text-gray-500 dark:text-gray-400">
        {description ??
          "The page you are looking for might have been removed or is temporarily unavailable."}
      </p>
      {action && (
        <div className="flex justify-center items-center gap-2">{action}</div>
      )}
      <div className="mt-10">
        <BrandNameLink />
      </div>
    </div>
  );
}

export { NotFoundPage };
