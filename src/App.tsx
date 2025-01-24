import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/formulario" element={<QuestionnaireForm />} />
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
              </Routes>
            </div>
            <Toaster />
          </SidebarProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;