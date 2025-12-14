/**
 * @deprecated This component is no longer used in production.
 * The main navigation is now handled by HeaderNav.tsx
 * This file is kept for reference during migration but can be safely deleted.
 * Last reviewed: 2025-12-14
 */
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { SearchResults } from "./SearchResults";
import { Logo } from "@/components/Logo";
import { EnhancedLanguageSwitcher } from "@/components/language/EnhancedLanguageSwitcher";
import { MultilingualSearchResults } from "@/components/language/MultilingualSearchResults";

export function TopNavigation() {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const themeLinks = [
    { title: t('themes.ancientIndia'), path: "/themes/ancient-india" },
    { title: t('themes.indianOcean'), path: "/themes/indian-ocean-world" },
    { title: t('themes.scripts'), path: "/themes/scripts-inscriptions" },
    { title: t('themes.geology'), path: "/themes/geology-deep-time" },
    { title: t('themes.empires'), path: "/themes/empires-exchange" }
  ];

  const mainNavItems = [
    { title: t('navigation.fieldNotes'), path: "/field-notes" },
    { title: t('navigation.maps'), path: "/maps-data" },
    { title: t('navigation.readingRoom'), path: "/reading-room" },
    { title: t('navigation.about'), path: "/about" }
  ];

  return (
    <>
      <nav className="bg-background border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link 
                to="/" 
                className="flex items-center gap-3 group"
                aria-label="Srangam home page"
              >
                <Logo variant="symbol" size={32} />
                <span className="font-serif text-xl font-semibold text-epigraphyMaroon group-hover:text-oceanTeal transition-colors">
                  Srangam
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                to="/" 
                className={`text-sm font-medium transition-colors hover:text-ocean ${
                  isActive('/') ? 'text-ocean' : 'text-foreground'
                }`}
              >
                {t('navigation.home')}
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-saffron transition-colors">
                  {t('navigation.collections')} <ChevronDown size={14} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 bg-background border-border z-50">
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/batch/muziris-kutai-ashoka"
                      className="text-sm text-foreground hover:text-saffron transition-colors"
                    >
                      {t('navigation.scriptsTradeEmpire')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/batch/bujang-nagapattinam-ocean"
                      className="text-sm text-foreground hover:text-saffron transition-colors"
                    >
                      {t('navigation.oceanNetworks')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    <span className="text-sm text-muted-foreground">
                      {t('navigation.archaeologicalInsights')}
                    </span>
                  </DropdownMenuItem>
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-t border-border mt-2 pt-2">
                    स्रोत | Sources
                  </div>
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/sources"
                      className="text-sm text-foreground hover:text-saffron transition-colors font-semibold"
                    >
                      Sources Index
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/sources/edicts"
                      className="text-sm text-foreground hover:text-saffron transition-colors"
                    >
                      Royal Edicts
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/sources/epigraphy"
                      className="text-sm text-foreground hover:text-saffron transition-colors"
                    >
                      Epigraphic Database
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/sources/trade-docs"
                      className="text-sm text-foreground hover:text-saffron transition-colors"
                    >
                      Trade Documents
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/sources/sanskrit-terminology"
                      className="text-sm text-foreground hover:text-saffron transition-colors"
                    >
                      Sanskrit Terminology
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-ocean transition-colors">
                  {t('navigation.themes')} <ChevronDown size={14} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-background border-border z-50">
                  {themeLinks.map((theme) => (
                    <DropdownMenuItem key={theme.path} asChild>
                      <Link 
                        to={theme.path}
                        className="text-sm text-foreground hover:text-ocean transition-colors"
                      >
                        {theme.title}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {mainNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors hover:text-ocean ${
                    isActive(item.path) ? 'text-ocean' : 'text-foreground'
                  }`}
                >
                  {item.title}
                </Link>
              ))}
            </div>

            {/* Search and Mobile Menu */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    type="text"
                    placeholder={t('navigation.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    className="pl-10 w-64 hidden sm:block text-sm"
                  />
                </div>
                {searchQuery && isSearchFocused && (
                  <MultilingualSearchResults 
                    query={searchQuery} 
                    onClose={() => setSearchQuery("")}
                  />
                )}
              </div>

              {/* Enhanced Language Switcher */}
              <div className="hidden sm:block">
                <EnhancedLanguageSwitcher variant="compact" showAvailability={true} />
              </div>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-4 py-2 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 text-sm font-medium text-foreground hover:text-ocean transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navigation.home')}
              </Link>
              
              <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t('navigation.themes')}
              </div>
              {themeLinks.map((theme) => (
                <Link
                  key={theme.path}
                  to={theme.path}
                  className="block px-6 py-2 text-sm text-foreground hover:text-ocean transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {theme.title}
                </Link>
              ))}
              
              {mainNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block px-3 py-2 text-sm font-medium text-foreground hover:text-ocean transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.title}
                </Link>
              ))}
              
              {/* Mobile Enhanced Language Switcher */}
              <div className="px-3 py-2">
                <EnhancedLanguageSwitcher variant="compact" showAvailability={true} />
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}