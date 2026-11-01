import { Fragment } from "react";

import { cn } from "@/lib/utils";
import { HERO_SCENARIOS } from "./heroScenarios";

const scenario = HERO_SCENARIOS[0];

// The exact form-hold frame of `HeroAnimation` (t = HERO_FORM_HOLD_SECONDS):
// the same card, size, position and labels, without the required-field error.
// Used for the server render, the first client render and the lazy-load
// fallback, so the hero never opens on the finished conversation.
export function HeroStaticForm() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex items-center justify-center"
    >
      <div className="relative h-[350px] w-[min(360px,calc(100%-40px))] rounded-[4px] border border-marketing-hair bg-marketing-hair-soft">
        <div className="absolute left-[19px] top-[19px] whitespace-nowrap font-body text-[13.5px] font-semibold leading-none text-marketing-muted">
          {scenario.title}
        </div>

        {scenario.fields.map((field, index) => (
          <Fragment key={field}>
            <div
              className="absolute left-[19px] whitespace-nowrap font-body text-xs leading-none text-marketing-text"
              style={{ top: 51 + index * 58 }}
            >
              {field} *
            </div>
            <div
              className={cn(
                "absolute left-[19px] right-[19px] rounded-[2px] border border-marketing-hair bg-white",
                index === 3 ? "h-[44px]" : "h-[30px]",
              )}
              style={{ top: 68 + index * 58 }}
            />
          </Fragment>
        ))}

        <div
          className="absolute left-[19px] grid h-[30px] w-[84px] place-items-center rounded-[2px] bg-marketing-slate font-body text-xs font-medium leading-none text-white"
          style={{ top: 301 }}
        >
          Submit
        </div>
      </div>
    </div>
  );
}
