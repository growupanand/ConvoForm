export function ListItem({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className=" py-1 px-2 align-middle transition-all hover:bg-gray-50">
      {children}
    </div>
  );
}
