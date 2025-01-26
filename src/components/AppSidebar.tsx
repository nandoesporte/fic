import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar } from "@/components/ui/sidebar";
import { FileText, BarChart2, Database, FormInput, LayoutDashboard, Brain, Users, ClipboardList } from "lucide-react";

export function AppSidebar() {
  const { pathname } = useLocation();

  return (
    <Sidebar className="border-r border-border bg-sidebar-background w-[275px] md:w-[275px] sm:w-full overflow-hidden" collapsible="icon">
      <ScrollArea className="h-full">
        <div className="space-y-4 py-6">
          <div className="px-4 sm:px-6">
            <div className="space-y-2 sm:space-y-3">
              <Link to="/">
                <Button
                  variant={pathname === "/" ? "secondary" : "ghost"}
                  className="w-full justify-start text-sm"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              <Link to="/respostas">
                <Button
                  variant={pathname === "/respostas" ? "secondary" : "ghost"}
                  className="w-full justify-start text-sm"
                >
                  <ClipboardList className="mr-2 h-4 w-4" />
                  <span>Respostas dos Questionários</span>
                </Button>
              </Link>
              <Link to="/formulario">
                <Button
                  variant={pathname === "/formulario" ? "secondary" : "ghost"}
                  className="w-full justify-start text-sm"
                >
                  <FormInput className="mr-2 h-4 w-4" />
                  <span>Formulário</span>
                </Button>
              </Link>
              <Link to="/voting">
                <Button
                  variant={pathname === "/voting" ? "secondary" : "ghost"}
                  className="w-full justify-start text-sm"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Sistema de Votação</span>
                </Button>
              </Link>
              <Link to="/analytics">
                <Button
                  variant={pathname === "/analytics" ? "secondary" : "ghost"}
                  className="w-full justify-start text-sm"
                >
                  <BarChart2 className="mr-2 h-4 w-4" />
                  <span>Análise de Votos</span>
                </Button>
              </Link>
              <Link to="/export">
                <Button
                  variant={pathname === "/export" ? "secondary" : "ghost"}
                  className="w-full justify-start text-sm"
                >
                  <Database className="mr-2 h-4 w-4" />
                  <span>Exportar Dados</span>
                </Button>
              </Link>
              <Link to="/ai-report">
                <Button
                  variant={pathname === "/ai-report" ? "secondary" : "ghost"}
                  className="w-full justify-start text-sm"
                >
                  <Brain className="mr-2 h-4 w-4" />
                  <span>Relatório IA</span>
                </Button>
              </Link>
              <Link to="/users">
                <Button
                  variant={pathname === "/users" ? "secondary" : "ghost"}
                  className="w-full justify-start text-sm"
                >
                  <Users className="mr-2 h-4 w-4" />
                  <span>Usuários</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </ScrollArea>
    </Sidebar>
  );
}