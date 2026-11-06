import { Bubble, Thread } from "@/components/common/stageshow";

import { JOB_MESSAGES, JOB_PROFILE } from "./jobApplicationStory";
import "./jobApplicationScene.css";

// The job-application hero's one scene, rendered from any state. The live
// Stage drives it with a script; the still frames render the same body from a
// fixed state, so the first paint, the poster and the replay never drift apart.

export type JobApplicationState = {
  phase: "chat" | "profile";
  msgs: number;
  typing: boolean;
  draft: string;
  /** How many profile fields have landed. */
  saved: number;
};

export const JOB_INITIAL: JobApplicationState = {
  phase: "chat",
  msgs: 1,
  typing: false,
  draft: "",
  saved: 0,
};

export const JOB_POSTER: JobApplicationState = {
  phase: "profile",
  msgs: JOB_MESSAGES.length,
  typing: false,
  draft: "",
  saved: JOB_PROFILE.length,
};

export function JobApplicationSceneBody({
  state: s,
}: {
  state: JobApplicationState;
}) {
  const typingMessage =
    s.typing &&
    s.msgs < JOB_MESSAGES.length &&
    JOB_MESSAGES[s.msgs]?.from === "them"
      ? 1
      : 0;

  return (
    <div className="job-scene" aria-hidden>
      <div className="job-grid" />

      <div className="job-card" data-phase={s.phase}>
        <div className="job-head">
          <span className="job-title">
            <span className="job-title__chat">Job application</span>
            <span className="job-title__profile">Candidate profile</span>
          </span>
          <span className="job-head__who">Rahul Mehta</span>
          <span className="job-chip">Illustrative data</span>
        </div>
        <div className="job-rule" />

        <div className="job-chat">
          <div className="job-thread-box">
            <Thread className="job-thread">
              {JOB_MESSAGES.slice(0, s.msgs + typingMessage).map((m, i) => (
                <Bubble
                  key={m.text}
                  from={m.from}
                  typing={i === s.msgs}
                  source={m.from === "me" ? "draft" : undefined}
                  className={m.followUp ? "job-followup" : undefined}
                >
                  {m.text}
                </Bubble>
              ))}
            </Thread>
          </div>

          <div className="job-composer">
            <span className="job-composer__text" data-target="draft">
              {s.draft}
              {s.draft && <i className="job-caret" />}
            </span>
            <span
              className="job-composer__ph"
              data-hide={s.draft ? "" : undefined}
            >
              Type your answer
            </span>
          </div>
        </div>

        <div className="job-profile">
          <div className="job-profile__grid">
            {JOB_PROFILE.map((field, index) => (
              <div
                key={field.key}
                className="job-cell"
                data-on={index < s.saved || undefined}
                data-highlighted={field.highlighted || undefined}
              >
                <div className="job-cell__key">{field.key}</div>
                <div className="job-cell__value">{field.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
