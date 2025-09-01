import { TopNavigation } from "@/components/navigation/TopNavigation";
import { Footer } from "@/components/layout/Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNavigation />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}