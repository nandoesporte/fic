import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileSpreadsheet, FileText, Brain, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Json } from "@/integrations/supabase/types";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AIVotingMetrics } from "@/components/analytics/AIVotingMetrics";
import { AIVotingResults } from "@/components/analytics/AIVotingResults";
import { DimensionFilter } from "@/components/analytics/DimensionFilter";

interface ReportMetrics {
  total_votos: number;
  pontos_fortes: number;
  desafios: number;
  oportunidades: number;
}

interface VoteGroup {
  text: string;
  votes: number;
  variations: string[];
}

interface VoteAnalysis {
  dimension: string;
  totalVotes: number;
  strengths: VoteGroup[];
  challenges: VoteGroup[];
  opportunities: VoteGroup[];
  participationRate: number;
  uniqueVoters: number;
}

function isReportMetrics(metrics: Json): metrics is { [key: string]: Json } & ReportMetrics {
  if (typeof metrics !== 'object' || metrics === null || Array.isArray(metrics)) {
    return false;
  }
  
  return (
    'total_votos' in metrics &&
    'pontos_fortes' in metrics &&
    'desafios' in metrics &&
    'oportunidades' in metrics
  );
}

export default function AIReport() {
  const [selectedDimension, setSelectedDimension] = useState<string>("all");
  const [analysis, setAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [voteAnalysis, setVoteAnalysis] = useState<VoteAnalysis | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  const { data: dimensions, isLoading } = useQuery({
    queryKey: ['dimensions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fic_dimensions')
        .select('identifier, label');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: reports, isLoading: isLoadingReports } = useQuery({
    queryKey: ['ai-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fic_reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    try {
      const response = await supabase.functions.invoke('analyze-vote-backups', {
        body: { dimension: selectedDimension },
      });

      if (response.error) throw response.error;
      setAnalysis(response.data.analysis);
      setProgress(100);
      toast.success("Análise de IA concluída com sucesso!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erro ao gerar análise de IA");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleIntelligentAnalysis = async () => {
    setIsLoadingAnalysis(true);
    try {
      const response = await supabase.functions.invoke('intelligent-vote-analysis', {
        body: { dimension: selectedDimension },
      });

      if (response.error) throw response.error;
      setVoteAnalysis(response.data);
      toast.success("Análise inteligente concluída!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erro ao gerar análise inteligente");
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    if (!reports || reports.length === 0) {
      toast.error("Nenhum relatório disponível para exportar");
      return;
    }

    const content = reports.map(report => {
      const metrics = report.metrics;
      if (!isReportMetrics(metrics)) {
        console.error('Invalid metrics format:', metrics);
        return null;
      }

      return {
        dimensao: report.dimension,
        titulo: report.title,
        descricao: report.description,
        total_votos: metrics.total_votos,
        pontos_fortes: metrics.pontos_fortes,
        desafios: metrics.desafios,
        oportunidades: metrics.oportunidades,
        data_inicio: new Date(report.start_date).toLocaleDateString('pt-BR'),
        data_fim: new Date(report.end_date).toLocaleDateString('pt-BR'),
      };
    }).filter(Boolean);

    if (format === 'excel') {
      const ws = XLSX.utils.json_to_sheet(content);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Relatório");
      XLSX.writeFile(wb, "relatorio_ia.xlsx");
      toast.success('Relatório Excel exportado com sucesso!');
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text("Relatório de Análise IA", 14, 15);
      
      // Add date
      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 25);
      
      // Create table
      autoTable(doc, {
        head: [['Dimensão', 'Total Votos', 'Pontos Fortes', 'Desafios', 'Oportunidades', 'Data Início', 'Data Fim']],
        body: content.map(item => [
          item.dimensao,
          item.total_votos.toString(),
          item.pontos_fortes.toString(),
          item.desafios.toString(),
          item.oportunidades.toString(),
          item.data_inicio,
          item.data_fim
        ]),
        startY: 30,
      });
      
      doc.save('relatorio_ia.pdf');
      toast.success('Relatório PDF exportado com sucesso!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Relatório IA</h1>
        <p className="text-gray-500 mt-2">
          Análise detalhada dos votos por dimensão usando inteligência artificial
        </p>
      </div>

      {/* Seção de Análise Inteligente de Votos */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Análise Inteligente de Votos</h2>
        </div>
        
        <div className="space-y-4">
          <DimensionFilter
            selectedDimension={selectedDimension}
            onDimensionChange={setSelectedDimension}
            dimensions={dimensions}
          />

          <Button
            onClick={handleIntelligentAnalysis}
            disabled={isLoadingAnalysis}
            className="w-full"
          >
            {isLoadingAnalysis ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando arquivos de backup...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Analisar Votos dos Arquivos de Backup
              </>
            )}
          </Button>
        </div>

        {voteAnalysis && (
          <div className="mt-8 space-y-6">
            <AIVotingMetrics
              totalVoters={4} // Total de eleitores registrados (baseado nos dados de network)
              totalVotes={voteAnalysis.totalVotes}
              uniqueVoters={voteAnalysis.uniqueVoters}
              participationRate={voteAnalysis.participationRate}
            />

            <AIVotingResults
              strengths={voteAnalysis.strengths}
              challenges={voteAnalysis.challenges}
              opportunities={voteAnalysis.opportunities}
            />
          </div>
        )}
      </Card>

    </div>
  );
}
