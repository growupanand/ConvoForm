export function PageShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string | React.ReactNode;
}) {
  return (
    <div className="pb-5">
      <div className="mb-10 ">
        {typeof title === "string" ? (
          <h1 className="px-3 py-2 text-xl font-medium lg:text-2xl">{title}</h1>
        ) : (
          title
        )}
      </div>
      {children}
    </div>
  );
}
