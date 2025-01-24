import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar } from "@/components/ui/sidebar";
import { FileText, BarChart2, Database, FormInput, LayoutDashboard } from "lucide-react";

export function AppSidebar() {
  const { pathname } = useLocation();

  return (
    <Sidebar className="border-r bg-sidebar-background w-[300px] overflow-hidden" collapsible="icon">
      <ScrollArea className="h-full">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="space-y-1">
              <Link to="/">
                <Button
                  variant={pathname === "/" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              <Link to="/formulario">
                <Button
                  variant={pathname === "/formulario" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <FormInput className="mr-2 h-4 w-4" />
                  <span>Formulário</span>
                </Button>
              </Link>
              <Link to="/voting">
                <Button
                  variant={pathname === "/voting" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Questionários</span>
                </Button>
              </Link>
              <Link to="/analytics">
                <Button
                  variant={pathname === "/analytics" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <BarChart2 className="mr-2 h-4 w-4" />
                  <span>Análise de Votos</span>
                </Button>
              </Link>
              <Link to="/export">
                <Button
                  variant={pathname === "/export" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <Database className="mr-2 h-4 w-4" />
                  <span>Exportar Dados</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </ScrollArea>
    </Sidebar>
  );
}