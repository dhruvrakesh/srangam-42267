import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import Home from "./pages/Home";
import AncientIndia from "./pages/themes/AncientIndia";
import IndianOceanWorld from "./pages/themes/IndianOceanWorld";
import ScriptsInscriptions from "./pages/themes/ScriptsInscriptions";
import GeologyDeepTime from "./pages/themes/GeologyDeepTime";
import EmpiresExchange from "./pages/themes/EmpiresExchange";
import FieldNotes from "./pages/FieldNotes";
import MapsData from "./pages/MapsData";
import ReadingRoom from "./pages/ReadingRoom";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import MonsoonTradeClock from "./pages/articles/MonsoonTradeClock";
import ScriptsThatSailed from "./pages/articles/ScriptsThatSailed";
import GondwanaToHimalaya from "./pages/articles/GondwanaToHimalaya";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
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
            <Route path="/monsoon-trade-clock" element={<MonsoonTradeClock />} />
            <Route path="/scripts-that-sailed" element={<ScriptsThatSailed />} />
            <Route path="/gondwana-to-himalaya" element={<GondwanaToHimalaya />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
