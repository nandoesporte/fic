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
              totalVoters={0} // Será calculado pelo componente
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

      {/* Seção de Relatórios IA Tradicionais */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-purple-600" />
          <h2 className="text-xl font-semibold">Análise IA Tradicional</h2>
        </div>
        
        <div className="space-y-4">
          <DimensionFilter
            selectedDimension={selectedDimension}
            onDimensionChange={setSelectedDimension}
            dimensions={dimensions}
          />

          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || selectedDimension === ""}
            className="w-full"
            variant="outline"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analisando...
              </>
            ) : (
              'Gerar Análise de IA'
            )}
          </Button>

          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Gerando relatório...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </div>

        {reports && reports.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Relatórios Gerados</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('excel')}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('pdf')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dimensão</TableHead>
                    <TableHead>Total de Votos</TableHead>
                    <TableHead>Pontos Fortes</TableHead>
                    <TableHead>Desafios</TableHead>
                    <TableHead>Oportunidades</TableHead>
                    <TableHead>Data Início</TableHead>
                    <TableHead>Data Fim</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => {
                    const metrics = report.metrics;
                    if (!isReportMetrics(metrics)) {
                      console.error('Invalid metrics format:', metrics);
                      return null;
                    }
                    
                    return (
                      <TableRow key={report.id}>
                        <TableCell>{report.dimension}</TableCell>
                        <TableCell>{metrics.total_votos}</TableCell>
                        <TableCell>{metrics.pontos_fortes}</TableCell>
                        <TableCell>{metrics.desafios}</TableCell>
                        <TableCell>{metrics.oportunidades}</TableCell>
                        <TableCell>
                          {new Date(report.start_date).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          {new Date(report.end_date).toLocaleDateString('pt-BR')}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {analysis && (
          <div className="mt-6 prose max-w-none">
            <div className="whitespace-pre-wrap">{analysis}</div>
          </div>
        )}
      </Card>
    </div>
  );
}
