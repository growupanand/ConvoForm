// components/Layout.tsx
import { ReactNode } from "react";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "framer-motion";

const variants = {
  hidden: { opacity: 0, x: -200, y: 0 },
  enter: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: 0, y: -100 },
};

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { asPath } = useRouter();

  return (
    <AnimatePresence initial={false} exitBeforeEnter>
      <motion.div
        key={asPath}
        variants={variants}
        initial="hidden"
        animate="enter"
        exit="exit"
        transition={{ type: "linear" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default Layout;
