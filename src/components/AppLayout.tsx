import { useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const showSidebar = !['/voting', '/formulario', '/login'].includes(location.pathname);

  return (
    <div className="min-h-screen flex w-full bg-background">
      {showSidebar && <AppSidebar />}
      <div className="flex-1 overflow-auto">
        {showSidebar && (
          <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 sm:px-4">
            <SidebarTrigger className="md:hidden" />
            <span className="text-sm text-muted-foreground">Menu</span>
          </header>
        )}
        <div className="container mx-auto py-4 sm:py-8 px-4 sm:px-6">
          {children}
        </div>
      </div>
    </div>
  );
}