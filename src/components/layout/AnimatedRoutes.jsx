import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Home from "@/pages/Home";
import Setup from "@/pages/Setup";
import Game from "@/pages/Game";
import Rules from "@/pages/Rules";
import Shop from "@/pages/Shop";
import PageNotFound from "@/lib/PageNotFound";

const ORDER = { "/": 0, "/shop": 1, "/rules": 2, "/setup": 3, "/game": 4 };

const variants = {
  enter: (dir) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};

function AnimatedPage({ children }) {
  const location = useLocation();
  const prev = React.useRef(location.pathname);
  const dir = (ORDER[location.pathname] ?? 99) >= (ORDER[prev.current] ?? 0) ? 1 : -1;
  React.useEffect(() => { prev.current = location.pathname; }, [location.pathname]);

  return (
    <motion.div
      key={location.pathname}
      custom={dir}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: "tween", ease: "easeInOut", duration: 0.28 }}
      className="absolute inset-0"
    >
      {children}
    </motion.div>
  );
}

export default function AnimatedRoutes() {
  const location = useLocation();
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <AnimatedPage key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/game" element={<Game />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </AnimatedPage>
      </AnimatePresence>
    </div>
  );
}