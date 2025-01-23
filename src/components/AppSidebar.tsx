import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar } from "@/components/ui/sidebar";
import { ChevronLeft, ChevronRight, FileText, BarChart2, Database, FormInput, LayoutDashboard } from "lucide-react";
import { useState } from "react";

export function AppSidebar() {
  const { pathname } = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="relative">
      <Sidebar className={cn(
        "border-r bg-gray-100/40 transition-all duration-300",
        isCollapsed ? "w-[60px]" : "w-[300px]"
      )}>
        <ScrollArea className="h-full">
          <div className="space-y-4 py-4">
            <div className="px-3 py-2">
              <div className="space-y-1">
                <Link to="/">
                  <Button
                    variant={pathname === "/" ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isCollapsed && "justify-center px-2"
                    )}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    {!isCollapsed && <span className="ml-2">Dashboard</span>}
                  </Button>
                </Link>
                <Link to="/formulario">
                  <Button
                    variant={pathname === "/formulario" ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isCollapsed && "justify-center px-2"
                    )}
                  >
                    <FormInput className="h-4 w-4" />
                    {!isCollapsed && <span className="ml-2">Formulário</span>}
                  </Button>
                </Link>
                <Link to="/voting">
                  <Button
                    variant={pathname === "/voting" ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isCollapsed && "justify-center px-2"
                    )}
                  >
                    <FileText className="h-4 w-4" />
                    {!isCollapsed && <span className="ml-2">Questionários</span>}
                  </Button>
                </Link>
                <Link to="/analytics">
                  <Button
                    variant={pathname === "/analytics" ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isCollapsed && "justify-center px-2"
                    )}
                  >
                    <BarChart2 className="h-4 w-4" />
                    {!isCollapsed && <span className="ml-2">Análise de Votos</span>}
                  </Button>
                </Link>
                <Link to="/export">
                  <Button
                    variant={pathname === "/export" ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isCollapsed && "justify-center px-2"
                    )}
                  >
                    <Database className="h-4 w-4" />
                    {!isCollapsed && <span className="ml-2">Exportar Dados</span>}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </ScrollArea>
      </Sidebar>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-2 z-10 rounded-full bg-gray-100 shadow-md"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}