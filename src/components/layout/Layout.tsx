import { HeaderNav } from "@/components/navigation/HeaderNav";
import { Footer } from "@/components/layout/Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HeaderNav />
      <main className="flex-1 pb-16 lg:pb-0">
        {children}
      </main>
      <Footer />
    </div>
  );
}