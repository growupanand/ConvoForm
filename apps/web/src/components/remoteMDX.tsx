import { MDXRemote } from "next-mdx-remote/rsc";

export default async function RemoteMdxPage({ url }: { url: string }) {
  // MDX text - can be from a local file, database, CMS, fetch, anywhere...
  const res = await fetch(url);
  if (res.ok && res.status === 200) {
    const markdown = await res.text();

    return (
      <div className="prose">
        <MDXRemote source={markdown} />
      </div>
    );
  }
  return null;
}
