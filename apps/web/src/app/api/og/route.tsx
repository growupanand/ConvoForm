import { getFrontendBaseUrl } from "@/lib/url";
import { ImageResponse } from "next/og";
import { Background } from "./_components/background";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    <Background tw="justify-start items-center">
      <div
        style={{
          clipPath: "polygon(0% -30%, 200% 140%, 200% 200%, -30% 200%)",
        }}
        tw="flex absolute h-full w-full bg-slate-200"
      />
      <div tw="flex flex-col justify-center items-center p-20">
        <h1 tw="text-[50px] text-blue-700">ConvoForm.com</h1>
        <p tw="text-[70px] text-black break-words text-center">
          Create your own AI-Powered conversational form
        </p>
        <img
          alt=""
          style={{ objectFit: "fill" }}
          tw="w-[150px] h-[150px]"
          src={new URL("logo.png", getFrontendBaseUrl()).toString()}
        />{" "}
      </div>
    </Background>,
    {
      width: 1200,
      height: 630,
    },
  );
}
