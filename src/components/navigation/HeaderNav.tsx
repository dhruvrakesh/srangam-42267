import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ChevronDown, Globe, Menu as MenuIcon, X, Home, Map as MapIcon, BookOpen, List, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { EnhancedLanguageSwitcher } from "@/components/language/EnhancedLanguageSwitcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SearchResults } from "@/components/navigation/SearchResults";

type NavItem = { 
  label: string; 
  href?: string; 
  desc?: string; 
  children?: NavItem[] 
};

type NavConfig = {
  primary: NavItem[];
  utilities: { 
    searchPlaceholder: string; 
    languages: string[]; 
    i18nOptions: { showIAST: boolean } 
  };
};

export function HeaderNav() {
  const [cfg, setCfg] = useState<NavConfig | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [combo, setCombo] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load navigation config
    fetch("/config/nav.config.json")
      .then(res => res.json())
      .then(setCfg)
      .catch(console.error);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    let timer: any;
    function onKey(e: KeyboardEvent) {
      // Ignore if typing in input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
        window.dispatchEvent(new CustomEvent("shortcut_trigger", { 
          detail: { shortcut: "/" } 
        }));
      }
      
      if (e.key.toLowerCase() === "m") {
        navigate("/maps-data");
        window.dispatchEvent(new CustomEvent("shortcut_trigger", { 
          detail: { shortcut: "m" } 
        }));
      }
      
      // Combo: g then s
      setCombo(prev => {
        const next = [...prev, e.key.toLowerCase()].slice(-2);
        if (next.join("") === "gs") {
          navigate("/sources-method");
          window.dispatchEvent(new CustomEvent("shortcut_trigger", { 
            detail: { shortcut: "gs" } 
          }));
        }
        clearTimeout(timer);
        timer = setTimeout(() => setCombo([]), 700);
        return next;
      });
    }
    
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(timer);
    };
  }, [navigate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSearchDropdown(false);
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      window.dispatchEvent(new CustomEvent("search_submit", { 
        detail: { query: searchQuery.trim() } 
      }));
    }
  };

  const handleNavClick = (label: string, href?: string) => {
    window.dispatchEvent(new CustomEvent("nav_click", { 
      detail: { label, href } 
    }));
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!cfg) return null;

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          
          {/* Mobile menu toggle */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden"
                aria-label="Open menu"
              >
                <MenuIcon className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <MobileNavContent cfg={cfg} onItemClick={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            onClick={() => {
              scrollToTop();
              handleNavClick("Home", "/");
            }}
          >
            <Logo variant="symbol" size={32} />
            <span className="hidden sm:block font-serif text-xl tracking-wide">Srangam</span>
          </Link>

          {/* Navigation area with hover group */}
          <div className="hidden lg:flex items-center group/nav">
            {/* Subtle vertical divider - opacity increases on hover */}
            <Separator 
              orientation="vertical" 
              className="h-6 mx-4 bg-border/50 transition-opacity duration-200 group-hover/nav:bg-border/70" 
            />

            {/* Primary navigation */}
            <nav className="flex items-center gap-2" role="navigation" aria-label="Primary">
              {cfg.primary.map((item) => (
                <NavNode key={item.label} item={item} onItemClick={handleNavClick} />
              ))}
              <Button variant="outline" size="sm" asChild className="ml-2">
                <Link to="/admin" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="font-medium">Admin</span>
                </Link>
              </Button>
            </nav>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search */}
          <div 
            ref={searchContainerRef}
            className="relative hidden md:block w-80"
          >
            <form onSubmit={handleSearch}>
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
              <Input
                ref={searchRef}
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(e.target.value.trim().length >= 2);
                }}
                onFocus={() => {
                  if (searchQuery.trim().length >= 2) setShowSearchDropdown(true);
                }}
                onBlur={() => {
                  // Delay to allow click on dropdown results
                  setTimeout(() => setShowSearchDropdown(false), 200);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setShowSearchDropdown(false);
                    searchRef.current?.blur();
                  }
                }}
                className="pl-9"
                placeholder={cfg.utilities.searchPlaceholder}
                aria-label="Search"
              />
            </form>
            {showSearchDropdown && searchQuery.trim().length >= 2 && (
              <SearchResults 
                query={searchQuery} 
                onClose={() => {
                  setShowSearchDropdown(false);
                  setSearchQuery("");
                }} 
              />
            )}
          </div>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Language switcher */}
          <EnhancedLanguageSwitcher />
        </div>
        
        {/* ARIA live region for announcements */}
        <div id="nav-announcements" className="sr-only" aria-live="polite" />
      </header>

      {/* Bottom mobile tabs */}
      <MobileBottomTabs />
    </>
  );
}

function NavNode({ 
  item, 
  onItemClick 
}: { 
  item: NavItem; 
  onItemClick: (label: string, href?: string) => void;
}) {
  if (!item.children) {
    return (
      <Button variant="ghost" size="sm" asChild>
        <Link 
          to={item.href ?? "#"} 
          onClick={() => onItemClick(item.label, item.href)}
        >
          {item.label}
        </Link>
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1"
          onClick={() => {
            window.dispatchEvent(new CustomEvent("menu_open", { 
              detail: { menu: item.label } 
            }));
          }}
        >
          {item.label}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[680px] p-4" 
        align="start"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.currentTarget.dispatchEvent(new Event("click", { bubbles: true }));
          }
        }}
      >
        {item.desc && (
          <div className="mb-3 text-sm text-muted-foreground">{item.desc}</div>
        )}
        <div className="grid grid-cols-2 gap-2">
          {item.children.map(child => (
            <Link
              key={child.label}
              to={child.href ?? "#"}
              className={cn(
                "block rounded-lg px-3 py-2 hover:bg-accent hover:text-accent-foreground",
                "focus:bg-accent focus:text-accent-foreground focus:outline-none"
              )}
              onClick={() => onItemClick(child.label, child.href)}
            >
              <div className="text-sm font-medium">{child.label}</div>
              {child.desc && (
                <div className="text-xs text-muted-foreground mt-1">{child.desc}</div>
              )}
            </Link>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function MobileNavContent({ 
  cfg, 
  onItemClick 
}: { 
  cfg: NavConfig; 
  onItemClick: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <SheetHeader>
        <SheetTitle>Navigation</SheetTitle>
      </SheetHeader>
      
      <nav className="flex-1 mt-6 space-y-2 overflow-y-auto">
        {cfg.primary.map(item => (
          <div key={item.label}>
            <Link
              to={item.href ?? "#"}
              className="block px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground font-medium"
              onClick={onItemClick}
            >
              {item.label}
            </Link>
            {item.children && (
              <div className="ml-4 mt-1 space-y-1">
                {item.children.map(child => (
                  <Link
                    key={child.label}
                    to={child.href ?? "#"}
                    className="block px-3 py-1 rounded text-sm hover:bg-accent/50 hover:text-accent-foreground"
                    onClick={onItemClick}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {/* Admin Link - Mobile */}
        <div className="pt-4 border-t border-border">
          <Link
            to="/admin"
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground font-medium"
            onClick={onItemClick}
          >
            <LayoutDashboard className="h-4 w-4" />
            Admin Dashboard
          </Link>
        </div>
      </nav>
    </div>
  );
}

function MobileBottomTabs() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-background border-t border-border shadow-sm lg:hidden">
      <div className="grid grid-cols-4 text-xs">
        <Link 
          to="/" 
          className="flex flex-col items-center py-2 px-1 hover:bg-accent hover:text-accent-foreground min-h-[48px] justify-center"
        >
          <Home className="h-5 w-5 mb-1" />
          <span>Home</span>
        </Link>
        <Link 
          to="/themes/indian-ocean-world" 
          className="flex flex-col items-center py-2 px-1 hover:bg-accent hover:text-accent-foreground min-h-[48px] justify-center"
        >
          <List className="h-5 w-5 mb-1" />
          <span>Themes</span>
        </Link>
        <Link 
          to="/maps-data" 
          className="flex flex-col items-center py-2 px-1 hover:bg-accent hover:text-accent-foreground min-h-[48px] justify-center"
        >
          <MapIcon className="h-5 w-5 mb-1" />
          <span>Map</span>
        </Link>
        <Link 
          to="/search" 
          className="flex flex-col items-center py-2 px-1 hover:bg-accent hover:text-accent-foreground min-h-[48px] justify-center"
        >
          <BookOpen className="h-5 w-5 mb-1" />
          <span>Search</span>
        </Link>
      </div>
    </nav>
  );
}