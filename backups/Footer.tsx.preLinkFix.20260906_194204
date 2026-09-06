import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Mail, MapPin, BookOpen } from "lucide-react";
import { IconMonsoon, IconScript, IconBasalt } from "@/components/icons";
import { Logo } from "@/components/Logo";

export function Footer() {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log("Newsletter signup:", email);
    setEmail("");
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-foreground">
              Stay Connected
            </h3>
            <p className="text-sm text-muted-foreground">
              Get updates on new research, field discoveries, and upcoming exhibitions.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button type="submit" className="bg-ocean hover:bg-ocean/90">
                  <Mail size={16} />
                </Button>
              </div>
            </form>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-foreground">
              Explore
            </h3>
            <nav className="space-y-2">
              <Link to="/field-notes" className="block text-sm text-muted-foreground hover:text-ocean transition-colors">
                Field Notes & Updates
              </Link>
              <Link to="/maps-data" className="block text-sm text-muted-foreground hover:text-ocean transition-colors">
                Interactive Maps & Data
              </Link>
              <Link to="/reading-room" className="block text-sm text-muted-foreground hover:text-ocean transition-colors">
                Reading Room
              </Link>
              <Link to="/sources-method" className="block text-sm text-muted-foreground hover:text-ocean transition-colors font-medium">
                Sources & Method
              </Link>
              <Link to="/sitemap" className="block text-sm text-muted-foreground hover:text-ocean transition-colors">
                साइट मानचित्र | Site Map
              </Link>
            </nav>
          </div>

          {/* Project Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Logo variant="symbol" size={24} />
              <h3 className="font-serif text-lg font-semibold text-foreground">
                About Srangam
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Exploring the interconnected histories of the Indian Ocean through archaeology, 
              epigraphy, and deep time perspectives.
            </p>
            <div className="flex items-center gap-4 text-muted-foreground">
              <IconMonsoon size={20} className="text-ocean" />
              <IconScript size={20} className="text-gold" />
              <IconBasalt size={20} className="text-laterite" />
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Srangam Project. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/about" className="hover:text-ocean transition-colors">
                <BookOpen size={16} className="inline mr-1" />
                About
              </Link>
              <Link to="/contact" className="hover:text-ocean transition-colors">
                <MapPin size={16} className="inline mr-1" />
                Contact
              </Link>
              <Link to="/brand" className="hover:text-oceanTeal transition-colors">
                Brand Assets
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}