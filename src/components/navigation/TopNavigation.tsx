import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { SearchResults } from "./SearchResults";

export function TopNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const themeLinks = [
    { title: "Ancient India", path: "/themes/ancient-india" },
    { title: "Indian Ocean World", path: "/themes/indian-ocean-world" },
    { title: "Scripts & Inscriptions", path: "/themes/scripts-inscriptions" },
    { title: "Geology & Deep Time", path: "/themes/geology-deep-time" },
    { title: "Empires & Exchange", path: "/themes/empires-exchange" }
  ];

  const mainNavItems = [
    { title: "Field Notes", path: "/field-notes" },
    { title: "Maps & Data", path: "/maps-data" },
    { title: "Reading Room", path: "/reading-room" },
    { title: "About", path: "/about" }
  ];

  return (
    <>
      <nav className="bg-background border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="font-serif text-xl font-semibold text-foreground hover:text-ocean transition-colors">
                Srangam
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
                Home
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-ocean transition-colors">
                  Themes <ChevronDown size={14} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-background border-border">
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
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    className="pl-10 w-64 hidden sm:block text-sm"
                  />
                </div>
                {searchQuery && isSearchFocused && (
                  <SearchResults 
                    query={searchQuery} 
                    onClose={() => setSearchQuery("")}
                  />
                )}
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
                Home
              </Link>
              
              <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Themes
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
            </div>
          </div>
        )}
      </nav>
    </>
  );
}