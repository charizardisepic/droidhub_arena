import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { RainbowKitProvider } from "@/components/RainbowKitProvider";
import { ArenaProvider } from "@/components/ArenaProvider";
import { ARENA_CONFIG, checkArenaEnvironment } from "@/lib/arenaConfig";

import Index from "./pages/Index";
import AppPage from "./pages/AppPage";
import NotFound from "./pages/NotFound";
import Docs from "./pages/Docs";
import ArenaTest from "./pages/ArenaTest";

const App = () => {
  const isArenaEnvironment = checkArenaEnvironment();
  
  return (
    <ThemeProvider defaultTheme="dark">
      {isArenaEnvironment ? (
        // Arena environment - use Arena SDK
        <ArenaProvider
          projectId={ARENA_CONFIG.PROJECT_ID}
          appName={ARENA_CONFIG.APP_NAME}
          appDescription={ARENA_CONFIG.APP_DESCRIPTION}
          appIcon={ARENA_CONFIG.APP_ICON}
        >
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/app" element={<AppPage />} />
                <Route path="/docs" element={<Docs />} />
                <Route path="/arena-test" element={<ArenaTest />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ArenaProvider>
      ) : (
        // Non-Arena environment - use RainbowKit
        <RainbowKitProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/app" element={<AppPage />} />
                <Route path="/docs" element={<Docs />} />
                <Route path="/arena-test" element={<ArenaTest />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </RainbowKitProvider>
      )}
    </ThemeProvider>
  );
};

export default App;
