import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import QuestionnaireVoting from "@/pages/QuestionnaireVoting";
import QuestionnaireAnalytics from "@/pages/QuestionnaireAnalytics";
import QuestionnaireForm from "@/pages/QuestionnaireForm";
import ExportData from "@/pages/ExportData";
import AIReport from "@/pages/AIReport";
import Users from "@/pages/Users";
import { FICForm } from "@/components/FICForm";
import { DimensionManager } from "@/components/FICForm/DimensionManager";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/formulario" element={<QuestionnaireForm />} />
      <Route path="/novo-questionario" element={
        <ProtectedRoute>
          <div className="space-y-8">
            <h1 className="text-2xl font-bold">Novo Questionário FIC</h1>
            <DimensionManager />
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
  );
}