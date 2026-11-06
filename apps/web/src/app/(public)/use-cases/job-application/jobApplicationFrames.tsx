import {
  JOB_INITIAL,
  JOB_POSTER,
  JobApplicationSceneBody,
} from "./jobApplicationSceneBody";
import "./jobApplicationFrames.css";

// The hero's two still frames. They render the same scene body as the live
// Stage, from a fixed state, and scale it with a container-relative design
// pixel. The first paint, the reduced-motion poster and the live run line up.

/** The first frame: the CTC question, waiting for an answer. */
export function JobApplicationStartFrame() {
  return (
    <div className="job-frame job">
      <div className="job-frame__inner">
        <JobApplicationSceneBody state={JOB_INITIAL} />
      </div>
    </div>
  );
}

/** The final frame: the candidate profile the conversation produced. */
export function JobApplicationFinalFrame() {
  return (
    <div className="job-frame job">
      <div className="job-frame__inner">
        <JobApplicationSceneBody state={JOB_POSTER} />
      </div>
    </div>
  );
}
