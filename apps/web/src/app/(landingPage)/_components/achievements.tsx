import Image from "next/image";
import Link from "next/link";

export function Achievements() {
  return (
    <div className="flex items-center justify-center">
      <Link
        href="https://peerlist.io/growupanand/project/convoform?utm_source=convoform.com"
        target="_blank"
        rel="noopener noreferrer nofollow"
        aria-label="Visit project page on Peerlist"
      >
        <div className="overflow-hidden rounded-full bg-white p-4 shadow-md outline outline-gray-100">
          <Image
            src="/images/winnerPeerlist.svg"
            alt="winner project of the month"
            width={130}
            height={128}
            quality={100}
          />
        </div>
      </Link>
    </div>
  );
}
