import { useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const showSidebar = !['/voting', '/formulario'].includes(location.pathname);

  return (
    <div className="min-h-screen flex w-full bg-background">
      {showSidebar && <AppSidebar />}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto py-8 px-6">
          {children}
        </div>
      </div>
    </div>
  );
}