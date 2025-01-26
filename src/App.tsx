import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import QuestionnaireVoting from "@/pages/QuestionnaireVoting";
import QuestionnaireAnalytics from "@/pages/QuestionnaireAnalytics";
import QuestionnaireForm from "@/pages/QuestionnaireForm";
import ExportData from "@/pages/ExportData";
import AIReport from "@/pages/AIReport";
import Users from "@/pages/Users";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AppSidebar } from "@/components/AppSidebar";
import { QuestionnaireResponses } from "@/components/QuestionnaireResponses";
import { FICForm } from "@/components/FICForm";

const queryClient = new QueryClient();

const AppLayout = ({ children }: { children: React.ReactNode }) => {
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
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SidebarProvider>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/formulario" element={<QuestionnaireForm />} />
                <Route path="/novo-questionario" element={
                  <ProtectedRoute>
                    <div className="space-y-8">
                      <h1 className="text-2xl font-bold">Novo Questionário FIC</h1>
                      <FICForm />
                    </div>
                  </ProtectedRoute>
                } />
                <Route
                  path="/voting"
                  element={
                    <ProtectedRoute>
                      <QuestionnaireVoting />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <QuestionnaireAnalytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/export"
                  element={
                    <ProtectedRoute>
                      <ExportData />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ai-report"
                  element={
                    <ProtectedRoute>
                      <AIReport />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute>
                      <Users />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </AppLayout>
            <Toaster />
          </SidebarProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;