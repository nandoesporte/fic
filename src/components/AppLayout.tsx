import { useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const showSidebar = !['/voting', '/formulario', '/login', '/vote-success', '/form-success'].includes(location.pathname);

  if (!showSidebar) {
    return (
      <div className="min-h-screen w-full bg-background">
        <div className="container mx-auto py-4 sm:py-8 px-4 sm:px-6">
          {children}
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 overflow-auto">
          <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 sm:px-4">
            <SidebarTrigger />
            <span className="text-sm text-muted-foreground">Menu</span>
          </header>
          <div className="container mx-auto py-4 sm:py-8 px-4 sm:px-6">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}