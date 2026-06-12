import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import NavBarHeader from "./components/NavBarHeader";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import TreeVisualizer from "./components/TreeVisualizer";
import GraphVisualizer from "./components/GraphVisualizer";
import SortingVisualizer from "./components/SortingVisualizer";
import LearnPage from "./pages/LearnPage";

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const pageTransition = {
  duration: 0.2,
  ease: "easeOut",
};

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage setCurrentPage={setCurrentPage} />;
      case "tree-visualizer":
        return <TreeVisualizer />;
      case "graph-visualizer":
        return <GraphVisualizer />;
      case "sorting-visualizer":
        return <SortingVisualizer />;
      case "learn":
        return <LearnPage />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-base text-slate-200 font-sans">
      <NavBarHeader currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}
