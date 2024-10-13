"use client";

import { useEffect, useRef } from "react";

type Props = {
  value: string;
};

/**
 * This hook is used to automatically set the height of an input element to
 * fit its content. It is designed to be used with the ControlledInput component.
 *
 * @param {{ value: string }} props
 * @param {string} props.value The value of the input element
 *
 * @returns {{ inputRef: React.MutableRefObject<HTMLTextAreaElement | HTMLInputElement | null> }}
 *          The ref for the input element
 */
export const useAutoHeightHook = ({ value }: Props) => {
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      // Reset height to auto to get the correct scrollHeight
      inputRef.current.style.height = "auto";
      // Set the height to the scrollHeight
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [value]);

  return { inputRef };
};
