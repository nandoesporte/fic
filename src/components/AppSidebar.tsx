import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar } from "@/components/ui/sidebar";
import { FileText, BarChart2, Database, FormInput } from "lucide-react";

export function AppSidebar() {
  const { pathname } = useLocation();

  return (
    <Sidebar className="border-r bg-gray-100/40 w-[300px]">
      <ScrollArea className="h-full">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="space-y-1">
              <Link to="/formulario">
                <Button
                  variant={pathname === "/formulario" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <FormInput className="mr-2 h-4 w-4" />
                  Formulário
                </Button>
              </Link>
              <Link to="/voting">
                <Button
                  variant={pathname === "/voting" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Questionários
                </Button>
              </Link>
              <Link to="/analytics">
                <Button
                  variant={pathname === "/analytics" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <BarChart2 className="mr-2 h-4 w-4" />
                  Análise de Votos
                </Button>
              </Link>
              <Link to="/export">
                <Button
                  variant={pathname === "/export" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <Database className="mr-2 h-4 w-4" />
                  Exportar Dados
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </ScrollArea>
    </Sidebar>
  );
}