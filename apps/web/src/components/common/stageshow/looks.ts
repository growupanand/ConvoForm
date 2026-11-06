import { createContext, useContext } from "react";

/** wide: the design size. compact: the smaller design used below `compact.below`. */
export type Layout = "wide" | "compact";

type Look = { layout: Layout };

export const LookContext = createContext<Look>({ layout: "wide" });
export const useLook = () => useContext(LookContext);
