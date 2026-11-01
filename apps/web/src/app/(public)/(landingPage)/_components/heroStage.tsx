"use client";

import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { HERO_FORM_HOLD_SECONDS } from "./heroScenarios";
import { HeroStatic } from "./heroStatic";
import { HeroStaticForm } from "./heroStaticForm";

const HeroAnimation = dynamic(() => import("./heroAnimation"), {
  ssr: false,
  loading: () => <HeroStaticForm />,
});

const STAGE_LABEL =
  "Illustrative example: a study-abroad enquiry form and a job application form each break apart and become a conversation that asks a follow-up before saving the answer.";

export function HeroStage() {
  // The first render is always the static form. The animation is only mounted
  // after hydration, so the server render, the pre-hydration render and the
  // reduced-motion frame are all chosen with CSS, never by a flash-prone
  // one-off matchMedia check.
  const [animate, setAnimate] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateMotionPreference = () => {
      const shouldAnimate = !motionQuery.matches;
      setAnimate(shouldAnimate);
      if (shouldAnimate) setReady(false);
    };

    updateMotionPreference();
    motionQuery.addEventListener("change", updateMotionPreference);

    return () =>
      motionQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  return (
    <div
      role="img"
      aria-label={STAGE_LABEL}
      className="relative mx-auto mt-6 h-[420px] w-full max-w-[1040px] overflow-hidden rounded-[22px] min-[900px]:h-[400px] min-[900px]:rounded-[28px]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.08)_1px,transparent_0)] bg-[length:22px_22px] [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_75%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 size-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-marketing-blue-300/55 blur-[60px] min-[900px]:size-[420px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[18%] top-[12%] size-[220px] rounded-full bg-marketing-blue-200/55 blur-[60px] min-[900px]:size-[260px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[4%] right-[12%] size-[200px] rounded-full bg-marketing-blue-200/55 blur-[60px] min-[900px]:size-[240px]"
      />

      <div
        aria-hidden="true"
        data-hero-animation
        className={cn(
          "absolute inset-0 transition-opacity duration-150",
          ready ? "opacity-100" : "opacity-0",
        )}
      >
        {animate ? (
          <HeroAnimation
            initialTime={HERO_FORM_HOLD_SECONDS}
            onReady={() => setReady(true)}
          />
        ) : null}
      </div>

      <div
        aria-hidden="true"
        data-hero-static-form
        className={cn(
          "absolute inset-0 transition-opacity duration-150 motion-reduce:hidden",
          ready ? "opacity-0" : "opacity-100",
        )}
      >
        <HeroStaticForm />
      </div>

      <div
        aria-hidden="true"
        data-hero-static-chat
        className="absolute inset-0 hidden motion-reduce:block"
      >
        <HeroStatic />
      </div>
    </div>
  );
}
