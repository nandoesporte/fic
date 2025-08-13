import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import { QuestionnaireVoting } from "@/pages/QuestionnaireVoting";
import QuestionnaireAnalytics from "@/pages/QuestionnaireAnalytics";
import QuestionnaireForm from "@/pages/QuestionnaireForm";
import ExportData from "@/pages/ExportData";
import AIReport from "@/pages/AIReport";
import Users from "@/pages/Users";
import Settings from "@/pages/Settings";
import VoteSuccess from "@/pages/VoteSuccess";
import { FICForm } from "@/components/FICForm";
import { DimensionManager } from "@/components/FICForm/DimensionManager";
import { QuestionnaireResponses } from "@/components/QuestionnaireResponses";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/formulario" element={<QuestionnaireForm />} />
      <Route path="/respostas" element={
        <ProtectedRoute>
          <div className="space-y-8">
            <h1 className="text-2xl font-bold">Respostas dos Questionários</h1>
            <QuestionnaireResponses />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/novo-questionario" element={
        <div className="space-y-8">
          <h1 className="text-2xl font-bold">Novo Questionário FIC</h1>
          <DimensionManager />
          <FICForm />
        </div>
      } />
      <Route path="/voting" element={<QuestionnaireVoting />} />
      <Route path="/vote-success" element={<VoteSuccess />} />
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
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}