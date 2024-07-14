/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";

import { getFrontendBaseUrl } from "@/lib/url";
import { Background } from "./_components/background";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    <Background tw="justify-start items-end">
      <div
        style={{
          clipPath: "polygon(0% -30%, 200% 140%, 200% 200%, -30% 200%)",
        }}
        tw="flex absolute h-full w-full bg-slate-200"
      >
        <img
          alt=""
          style={{ objectFit: "fill" }}
          tw="flex w-full h-full"
          src={new URL(
            "screenshots/formEditor.png",
            getFrontendBaseUrl(),
          ).toString()}
        />
      </div>
      <div tw="flex flex-col items-end p-20">
        <h1 tw="text-6xl">ConvoForm</h1>
        <p tw="text-4xl text-slate-700 break-words w-[500px] text-right">
          Create your own AI-Powered conversational form
        </p>
        <p tw="font-medium text-xl">convoform.com</p>
      </div>
    </Background>,
    {
      width: 1200,
      height: 630,
    },
  );
}
