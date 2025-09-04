import React, { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Loader2 } from 'lucide-react';

// Immediate load for critical pages
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

// Lazy load theme pages for better performance
const AncientIndia = lazy(() => import("./pages/themes/AncientIndia"));
const IndianOceanWorld = lazy(() => import("./pages/themes/IndianOceanWorld"));
const ScriptsInscriptions = lazy(() => import("./pages/themes/ScriptsInscriptions"));
const GeologyDeepTime = lazy(() => import("./pages/themes/GeologyDeepTime"));
const EmpiresExchange = lazy(() => import("./pages/themes/EmpiresExchange"));

// Lazy load secondary pages
const FieldNotes = lazy(() => import("./pages/FieldNotes"));
const MapsData = lazy(() => import("./pages/MapsData"));
const ReadingRoom = lazy(() => import("./pages/ReadingRoom"));
const About = lazy(() => import("./pages/About"));
const Brand = lazy(() => import("./pages/Brand"));

// Lazy load article pages
const MonsoonTradeClock = lazy(() => import("./pages/articles/MonsoonTradeClock"));
const ScriptsThatSailed = lazy(() => import("./pages/articles/ScriptsThatSailed"));
const GondwanaToHimalaya = lazy(() => import("./pages/articles/GondwanaToHimalaya"));
const PepperAndBullion = lazy(() => import("./pages/articles/PepperAndBullion"));
const CholaNavalRaid = lazy(() => import("./pages/articles/CholaNavalRaid"));
const AshokaKandaharEdicts = lazy(() => import("./pages/articles/AshokaKandaharEdicts"));
const KutaiYupaBorneo = lazy(() => import("./pages/articles/KutaiYupaBorneo"));
const MaritimeMemoriesSouthIndia = lazy(() => import("./pages/articles/MaritimeMemoriesSouthIndia"));
const RidersOnMonsoon = lazy(() => import("./pages/articles/RidersOnMonsoon"));
const EarthSeaSangam = lazy(() => import("./pages/articles/EarthSeaSangam"));
const BatchBujangNagapattinamOcean = lazy(() => import("./pages/BatchBujangNagapattinamOcean"));
const BatchMuzirisKutaiAshoka = lazy(() => import("./pages/BatchMuzirisKutaiAshoka"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Optimized loading component
function PageLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
        <p className="text-muted-foreground">Loading sacred knowledge...</p>
      </div>
    </div>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Suspense fallback={<PageLoadingFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/themes/ancient-india" element={<AncientIndia />} />
                <Route path="/themes/indian-ocean-world" element={<IndianOceanWorld />} />
                <Route path="/themes/scripts-inscriptions" element={<ScriptsInscriptions />} />
                <Route path="/themes/geology-deep-time" element={<GeologyDeepTime />} />
                <Route path="/themes/empires-exchange" element={<EmpiresExchange />} />
                <Route path="/field-notes" element={<FieldNotes />} />
                <Route path="/maps-data" element={<MapsData />} />
                <Route path="/reading-room" element={<ReadingRoom />} />
                <Route path="/about" element={<About />} />
                <Route path="/brand" element={<Brand />} />
                <Route path="/monsoon-trade-clock" element={<MonsoonTradeClock />} />
                <Route path="/scripts-that-sailed" element={<ScriptsThatSailed />} />
                <Route path="/gondwana-to-himalaya" element={<GondwanaToHimalaya />} />
                <Route path="/pepper-and-bullion" element={<PepperAndBullion />} />
                <Route path="/chola-srivijaya-1025" element={<CholaNavalRaid />} />
                <Route path="/ashoka-kandahar-edicts" element={<AshokaKandaharEdicts />} />
                <Route path="/kutai-yupa-borneo" element={<KutaiYupaBorneo />} />
                <Route path="/maritime-memories-south-india" element={<MaritimeMemoriesSouthIndia />} />
                <Route path="/riders-on-monsoon" element={<RidersOnMonsoon />} />
                <Route path="/earth-sea-sangam" element={<EarthSeaSangam />} />
                <Route path="/themes/ancient-india/pepper-routes" element={<PepperAndBullion />} />
                <Route path="/batch/bujang-nagapattinam-ocean" element={<BatchBujangNagapattinamOcean />} />
                <Route path="/batch/muziris-kutai-ashoka" element={<BatchMuzirisKutaiAshoka />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;