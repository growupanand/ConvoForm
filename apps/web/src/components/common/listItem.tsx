export function ListItem({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className=" py-1 ps-1 align-middle transition-all hover:bg-gray-50">
      {children}
    </div>
  );
}
