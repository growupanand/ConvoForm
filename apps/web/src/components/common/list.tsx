export function ListCard({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="divide-border grid divide-y border-b">{children}</div>;
}
