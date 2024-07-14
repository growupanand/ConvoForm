import { ProgressBar } from "@tremor/react";

export function TopProgressBar({ totalProgress }: { totalProgress: number }) {
  return (
    <ProgressBar
      showAnimation
      value={totalProgress}
      className="fixed -top-1.5 left-0"
    />
  );
}
