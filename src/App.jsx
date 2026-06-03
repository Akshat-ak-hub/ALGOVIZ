import React, { useState } from "react";
import NavBarHeader from "./components/NavBarHeader";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import TreeVisualizer from "./components/TreeVisualizer";
import GraphVisualizer from "./components/GraphVisualizer";
import LearnPage from "./pages/LearnPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");

  return (
    <div className="flex flex-col min-h-screen bg-[#121212] text-slate-200 font-sans">
      <NavBarHeader currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-grow">
        {currentPage === "home" && <HomePage setCurrentPage={setCurrentPage} />}
        {currentPage === "tree-visualizer" && <TreeVisualizer />}
        {currentPage === "graph-visualizer" && <GraphVisualizer />}
        {currentPage === "learn" && <LearnPage />}
      </main>
      <Footer />
    </div>
  );
}
