import React, { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LanguageProvider } from "@/components/language/LanguageProvider";
import { HelmetProvider } from 'react-helmet-async';
import { Loader2 } from 'lucide-react';
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";

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
const BeginJourney = lazy(() => import("./pages/BeginJourney"));
const Articles = lazy(() => import("./pages/Articles"));
const FieldNotes = lazy(() => import("./pages/FieldNotes"));
const MapsData = lazy(() => import("./pages/MapsData"));
const ReadingRoom = lazy(() => import("./pages/ReadingRoom"));
const SourcesMethod = lazy(() => import("./pages/SourcesMethod"));
const Search = lazy(() => import("./pages/Search"));
const About = lazy(() => import("./pages/About"));
const Brand = lazy(() => import("./pages/Brand"));

// Lazy load research pages
const ResearchSubmission = lazy(() => import("./pages/ResearchSubmission"));
const Partnership = lazy(() => import("./pages/Partnership"));
const SupportResearch = lazy(() => import("./pages/SupportResearch"));
const DataVisualization = lazy(() => import("./pages/DataVisualization"));
const ResearchNetwork = lazy(() => import("./pages/ResearchNetwork"));

// Lazy load article pages
const MonsoonTradeClock = lazy(() => import("./pages/articles/MonsoonTradeClock"));
const ScriptsThatSailed = lazy(() => import("./pages/articles/ScriptsThatSailed"));
const ScriptsThatSailedII = lazy(() => import("./pages/articles/ScriptsThatSailedII"));
const GondwanaToHimalaya = lazy(() => import("./pages/articles/GondwanaToHimalaya"));
const IndianOceanPowerNetworks = lazy(() => import("./pages/articles/IndianOceanPowerNetworks"));
const AshokaKandaharEdicts = lazy(() => import("./pages/articles/AshokaKandaharEdicts"));
const ReasessingAshokaLegacy = lazy(() => import("./pages/articles/ReasessingAshokaLegacy"));
const KutaiYupaBorneo = lazy(() => import("./pages/articles/KutaiYupaBorneo"));
const MaritimeMemoriesSouthIndia = lazy(() => import("./pages/articles/MaritimeMemoriesSouthIndia"));
const RidersOnMonsoon = lazy(() => import("./pages/articles/RidersOnMonsoon"));
const PepperAndBullion = lazy(() => import("./pages/articles/PepperAndBullion"));
const EarthSeaSangam = lazy(() => import("./pages/articles/EarthSeaSangam"));
const JambudvipaConnected = lazy(() => import("./pages/articles/JambudvipaConnected"));
const CosmicIslandSacredLand = lazy(() => import("./pages/articles/CosmicIslandSacredLand"));
const StonePurana = lazy(() => import("./pages/articles/StonePurana"));
const JanajatiOralTraditions = lazy(() => import("./pages/articles/JanajatiOralTraditions"));
const SacredTreeHarvestRhythms = lazy(() => import("./pages/articles/SacredTreeHarvestRhythms"));
const StoneSongAndSea = lazy(() => import("./pages/articles/StoneSongAndSea"));
const CholaNavalRaid = lazy(() => import("./pages/articles/CholaNavalRaid"));
const AsuraExilesIndoIranian = lazy(() => import("./pages/articles/AsuraExilesIndoIranian"));
const SariraAtmanVedicPreservation = lazy(() => import("./pages/articles/SariraAtmanVedicPreservation"));
const RishiGenealogiesVedicTradition = lazy(() => import("./pages/articles/RishiGenealogiesVedicTradition"));
const ReasessingRigvedaAntiquity = lazy(() => import("./pages/articles/ReasessingRigvedaAntiquity"));
const GeomythologyLandReclamation = lazy(() => import("./pages/GeomythologyLandReclamation"));
const DashanamiAsceticsSacredGeography = lazy(() => import("./pages/articles/DashanamiAsceticsSacredGeography"));
const ContinuousHabitationUttarapatha = lazy(() => import("./pages/articles/ContinuousHabitationUttarapatha"));
const SomnathaPrabhasaItihasa = lazy(() => import("./pages/articles/SomnathaPrabhasaItihasa"));
const RingingRocksRhythmicCosmology = lazy(() => import("./pages/articles/RingingRocksRhythmicCosmology"));
const BatchBujangNagapattinamOcean = lazy(() => import("./pages/BatchBujangNagapattinamOcean"));
const BatchMuzirisKutaiAshoka = lazy(() => import("./pages/BatchMuzirisKutaiAshoka"));
const Sitemap = lazy(() => import("./pages/Sitemap"));
const SitemapXML = lazy(() => import("./pages/SitemapXML"));

// Lazy load oceanic article system
const OceanicRouter = lazy(() => import("./pages/oceanic/OceanicRouter"));
const OceanicBharat = lazy(() => import("./pages/oceanic/OceanicBharat"));

// Lazy load articles router
const ArticlesRouter = lazy(() => import("./pages/articles/ArticlesRouter"));

// Lazy load tools
const SanskritTranslator = lazy(() => import("./pages/SanskritTranslator"));
const JyotishHoroscope = lazy(() => import("./pages/JyotishHoroscope"));

// Admin Pages
const MarkdownImport = lazy(() => import("./pages/admin/MarkdownImport"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const ArticleManagement = lazy(() => import("./pages/admin/ArticleManagement"));
const TagManagement = lazy(() => import("./pages/admin/TagManagement"));
const CrossReferencesBrowser = lazy(() => import("./pages/admin/CrossReferencesBrowser"));
const CulturalTermsExplorer = lazy(() => import("./pages/admin/CulturalTermsExplorer"));
const ImportAnalytics = lazy(() => import("./pages/admin/ImportAnalytics"));
const PuranaReferences = lazy(() => import("./pages/admin/PuranaReferences"));
const GitHubSync = lazy(() => import("./pages/admin/GitHubSync"));
const ContextManagement = lazy(() => import("./pages/admin/ContextManagement"));
const Auth = lazy(() => import("./pages/Auth"));
import { AdminLayout } from "./components/admin/AdminLayout";

// Sources Pages
const Edicts = lazy(() => import("./pages/sources/Edicts"));
const Epigraphy = lazy(() => import("./pages/sources/Epigraphy"));
const TradeDocs = lazy(() => import("./pages/sources/TradeDocs"));
const SourcesIndex = lazy(() => import("./pages/sources/Index"));
const SanskritTerminology = lazy(() => import("./pages/sources/SanskritTerminology"));

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
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LanguageProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Layout>
                  <Suspense fallback={<PageLoadingFallback />}>
                    <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/begin-journey" element={<BeginJourney />} />
                  <Route path="/themes/ancient-india" element={<AncientIndia />} />
                  <Route path="/themes/indian-ocean-world" element={<IndianOceanWorld />} />
                  <Route path="/themes/scripts-inscriptions" element={<ScriptsInscriptions />} />
                  <Route path="/themes/geology-deep-time" element={<GeologyDeepTime />} />
                  <Route path="/themes/empires-exchange" element={<EmpiresExchange />} />
              <Route path="/field-notes" element={<FieldNotes />} />
              <Route path="/maps-data" element={<MapsData />} />
              <Route path="/data-viz" element={<DataVisualization />} />
              <Route path="/research-network" element={<ResearchNetwork />} />
              <Route path="/reading-room" element={<ReadingRoom />} />
              
              {/* Sources Routes */}
              <Route path="/sources" element={<SourcesIndex />} />
              <Route path="/sources/index" element={<SourcesIndex />} />
              <Route path="/sources/edicts" element={<Edicts />} />
              <Route path="/sources/epigraphy" element={<Epigraphy />} />
              <Route path="/sources/trade-docs" element={<TradeDocs />} />
              <Route path="/sources/sanskrit-terminology" element={<SanskritTerminology />} />
                  <Route path="/sources-method" element={<SourcesMethod />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/brand" element={<Brand />} />
                  <Route path="/monsoon-trade-clock" element={<MonsoonTradeClock />} />
                  <Route path="/scripts-that-sailed" element={<ScriptsThatSailed />} />
                  <Route path="/scripts-that-sailed-ii" element={<ScriptsThatSailedII />} />
                  <Route path="/gondwana-to-himalaya" element={<GondwanaToHimalaya />} />
                  <Route path="/indian-ocean-power-networks" element={<IndianOceanPowerNetworks />} />
          <Route path="/ashoka-kandahar-edicts" element={<AshokaKandaharEdicts />} />
          <Route path="/reassessing-ashoka-legacy" element={<ReasessingAshokaLegacy />} />
                  <Route path="/kutai-yupa-borneo" element={<KutaiYupaBorneo />} />
                  <Route path="/maritime-memories-south-india" element={<MaritimeMemoriesSouthIndia />} />
                  <Route path="/riders-on-monsoon" element={<RidersOnMonsoon />} />
                  <Route path="/pepper-and-bullion" element={<PepperAndBullion />} />
                  <Route path="/earth-sea-sangam" element={<EarthSeaSangam />} />
                  <Route path="/jambudvipa-connected" element={<JambudvipaConnected />} />
                  <Route path="/cosmic-island-sacred-land" element={<CosmicIslandSacredLand />} />
                  <Route path="/stone-purana" element={<StonePurana />} />
              <Route path="/janajati-oral-traditions" element={<JanajatiOralTraditions />} />
              <Route path="/sacred-tree-harvest-rhythms" element={<SacredTreeHarvestRhythms />} />
              <Route path="/stone-song-and-sea" element={<StoneSongAndSea />} />
              <Route path="/chola-naval-raid" element={<CholaNavalRaid />} />
              <Route path="/asura-exiles-indo-iranian" element={<AsuraExilesIndoIranian />} />
              <Route path="/sarira-and-atman-vedic-preservation" element={<SariraAtmanVedicPreservation />} />
            <Route path="/rishi-genealogies-vedic-tradition" element={<RishiGenealogiesVedicTradition />} />
            <Route path="/reassessing-rigveda-antiquity" element={<ReasessingRigvedaAntiquity />} />
            <Route path="/geomythology-land-reclamation" element={<GeomythologyLandReclamation />} />
            <Route path="/dashanami-ascetics-sacred-geography" element={<DashanamiAsceticsSacredGeography />} />
            <Route path="/continuous-habitation-uttarapatha" element={<ContinuousHabitationUttarapatha />} />
            <Route path="/somnatha-prabhasa-itihasa" element={<SomnathaPrabhasaItihasa />} />
            <Route path="/ringing-rocks-rhythmic-cosmology" element={<RingingRocksRhythmicCosmology />} />
            <Route path="/articles/somnatha-prabhasa-itihasa" element={<SomnathaPrabhasaItihasa />} />
            <Route path="/articles/ringing-rocks-rhythmic-cosmology" element={<RingingRocksRhythmicCosmology />} />
                  
                  {/* Articles browse page + dynamic article routes */}
                  <Route path="/articles/*" element={<ArticlesRouter />} />
                  
                  {/* Oceanic section remains separate */}
                  <Route path="/oceanic/*" element={<OceanicRouter />} />
                  
                  {/* Tools */}
                  <Route path="/sanskrit-translator" element={<SanskritTranslator />} />
                  <Route path="/jyotish-horoscope" element={<JyotishHoroscope />} />

                  <Route path="/themes/geology-deep-time/stone-purana" element={<StonePurana />} />
                  <Route path="/themes/ancient-india/pepper-routes" element={<IndianOceanPowerNetworks />} />
                  <Route path="/batch/bujang-nagapattinam-ocean" element={<BatchBujangNagapattinamOcean />} />
                  <Route path="/batch/muziris-kutai-ashoka" element={<BatchMuzirisKutaiAshoka />} />
                  <Route path="/research-submission" element={<ResearchSubmission />} />
                  <Route path="/partnership" element={<Partnership />} />
                  <Route path="/support-research" element={<SupportResearch />} />
                  <Route path="/sitemap" element={<Sitemap />} />
                  <Route path="/sitemap.xml" element={<SitemapXML />} />
                  
                  {/* Oceanic Bharat Landing Page */}
                  <Route path="/oceanic" element={<OceanicBharat />} />
                  
                  {/* Oceanic Bharat article system */}
                  <Route path="/oceanic/*" element={<OceanicRouter />} />
                  
                  {/* Auth Route */}
                  <Route path="/auth" element={<Auth />} />
                  
                  {/* Admin Routes with Layout - Protected */}
                  <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                    <Route index element={<Dashboard />} />
                    <Route path="articles" element={<ArticleManagement />} />
                    <Route path="import" element={<MarkdownImport />} />
                    <Route path="github-sync" element={<GitHubSync />} />
                    <Route path="tags" element={<TagManagement />} />
                    <Route path="cross-refs" element={<CrossReferencesBrowser />} />
                    <Route path="cultural-terms" element={<CulturalTermsExplorer />} />
                    <Route path="purana-refs" element={<PuranaReferences />} />
                    <Route path="analytics" element={<ImportAnalytics />} />
                    <Route path="context" element={<ContextManagement />} />
                  </Route>
                  
                  <Route path="*" element={<NotFound />} />
                  </Routes>
                  </Suspense>
              </Layout>
            </BrowserRouter>
          </TooltipProvider>
          </LanguageProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;