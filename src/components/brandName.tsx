import Link from "next/link";

export default function BrandName() {
  return (
    <Link href="/">
      <span className="font-bold text-xl text-muted-foreground hover:text-foreground">
        Smart form wizard
      </span>
    </Link>
  );
}
