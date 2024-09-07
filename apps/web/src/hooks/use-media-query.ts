import { useEffect, useState } from "react";

type MediaQuery = string | number;

export function useMediaQuery(query: MediaQuery): [boolean, boolean] {
  const [matches, setMatches] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(String(query));

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
      setIsLoading(false);
    };

    // Initial check
    setMatches(mediaQueryList.matches);
    setIsLoading(false);

    // Add listener for changes
    mediaQueryList.addEventListener("change", handleChange);

    // Clean up listener on unmount
    return () => {
      mediaQueryList.removeEventListener("change", handleChange);
    };
  }, [query]);

  return [matches, isLoading];
}
