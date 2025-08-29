// src/App.tsx
import { Toaster } from "sonner";
import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import { Header } from "@/components/Header";
import Home from "./pages/Home";
import Tools from "./pages/Tools";
import Contact from "./pages/Contact";
import SavedTools from "./pages/SavedTools";
import SubmitTool from "./pages/SubmitTool";
import PricingPage from "./pages/Pricing";
import LearnAI from "./pages/LearnAI";

import { PageTransition } from "@/components/Motion";

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/tools" element={<PageTransition><Tools /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          <Route path="/saved" element={<PageTransition><SavedTools /></PageTransition>} />
          <Route path="/submit" element={<PageTransition><SubmitTool /></PageTransition>} />
          <Route path="/pricing" element={<PageTransition><PricingPage /></PageTransition>} />
          <Route path="/learn-ai" element={<PageTransition><LearnAI /></PageTransition>} />
        </Routes>
      </AnimatePresence>
      <Toaster />
    </div>
  );
}

export default App;
