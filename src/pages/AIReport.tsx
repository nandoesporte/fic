import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileSpreadsheet, FileText, Brain, RefreshCw, Database, History, Download } from "lucide-react";
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
import { useBackupOperations } from "@/components/backup/BackupOperations";

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
  const [dateFilter, setDateFilter] = useState<string>("");
  
  const { backups, fetchBackups } = useBackupOperations();

  // Query para histórico de relatórios
  const { data: reportHistory, isLoading: isLoadingHistory, refetch: refetchHistory } = useQuery({
    queryKey: ['ai-report-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_report_history')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

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

  // Carregar backups quando o componente monta
  useEffect(() => {
    fetchBackups();
  }, []);

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

  const handleAnalyzeBackup = async () => {
    setIsLoadingAnalysis(true);
    try {
      // Filtrar backups por data se especificado
      let filteredBackups = backups;
      if (dateFilter) {
        const filterDate = new Date(dateFilter);
        filteredBackups = backups.filter(backup => {
          const backupDate = new Date(backup.created_at);
          return backupDate >= filterDate;
        });
      }

      if (filteredBackups.length === 0) {
        toast.error("Nenhum backup encontrado para a data especificada");
        return;
      }

      // Buscar dados de todos os backups filtrados
      const allVotes: any[] = [];
      const allQuestionnaires: any[] = [];

      for (const backup of filteredBackups) {
        const { data, error } = await supabase
          .from('data_backups')
          .select('data')
          .eq('id', backup.id)
          .single();

        if (error) {
          console.error(`Erro ao buscar backup ${backup.id}:`, error);
          continue;
        }

        const backupData = data.data as any;
        if (backupData?.questionnaire_votes && backupData?.questionnaires) {
          allVotes.push(...backupData.questionnaire_votes);
          allQuestionnaires.push(...backupData.questionnaires);
        }
      }

      if (allVotes.length === 0 || allQuestionnaires.length === 0) {
        toast.error("Nenhum dado de votos válido encontrado nos backups");
        return;
      }

      // Remover duplicatas dos questionários
      const uniqueQuestionnaires = allQuestionnaires.filter((questionnaire, index, self) =>
        index === self.findIndex(q => q.id === questionnaire.id)
      );

      // Filtrar por dimensão se necessário
      const filteredQuestionnaires = selectedDimension === "all" 
        ? uniqueQuestionnaires 
        : uniqueQuestionnaires.filter((q: any) => q.dimension === selectedDimension);

      const filteredVotes = allVotes.filter((vote: any) => 
        filteredQuestionnaires.some((q: any) => q.id === vote.questionnaire_id)
      );

      // Processar análise
      const analysisData = processVoteAnalysis(filteredVotes, filteredQuestionnaires);
      setVoteAnalysis(analysisData);
      
      // Salvar no histórico com identificação dos backups usados
      await saveReportToHistory(analysisData, filteredBackups.map(b => b.id).join(','));
      
      toast.success(`Análise concluída usando ${filteredBackups.length} backup(s)!`);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erro ao analisar backups");
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const processVoteAnalysis = (votes: any[], questionnaires: any[]): VoteAnalysis => {
    const voteGroups: { [key: string]: VoteGroup[] } = {
      strengths: [],
      challenges: [],
      opportunities: []
    };

    const sectionMap = {
      'strengths': 'strengths',
      'challenges': 'challenges', 
      'opportunities': 'opportunities'
    };

    // Processar votos por seção
    Object.keys(sectionMap).forEach(sectionKey => {
      const sectionVotes = votes.filter(v => v.option_type === sectionKey);
      const textCounts: { [key: string]: { count: number, text: string } } = {};

      sectionVotes.forEach(vote => {
        const questionnaire = questionnaires.find(q => q.id === vote.questionnaire_id);
        if (questionnaire) {
          const sectionText = questionnaire[sectionKey];
          if (sectionText) {
            const options = sectionText.split('\n\n').filter((opt: string) => opt.trim());
            const optionText = options[vote.option_number - 1]?.trim();
            if (optionText) {
              if (!textCounts[optionText]) {
                textCounts[optionText] = { count: 0, text: optionText };
              }
              textCounts[optionText].count++;
            }
          }
        }
      });

      voteGroups[sectionKey as keyof typeof voteGroups] = Object.values(textCounts).map(item => ({
        text: item.text,
        votes: item.count,
        variations: [item.text]
      })).sort((a, b) => b.votes - a.votes);
    });

    const uniqueVoters = new Set(votes.map(v => v.email)).size;
    const totalVotes = votes.length;
    const participationRate = totalVotes > 0 ? (uniqueVoters / totalVotes) * 100 : 0;

    return {
      dimension: selectedDimension === "all" ? "Todas as Dimensões" : selectedDimension,
      totalVotes,
      uniqueVoters,
      participationRate,
      strengths: voteGroups.strengths,
      challenges: voteGroups.challenges,
      opportunities: voteGroups.opportunities
    };
  };

  const saveReportToHistory = async (analysisData: VoteAnalysis, backupId: string) => {
    try {
      const selectedBackupData = backups.find(b => b.id === backupId);
      const title = `Relatório ${analysisData.dimension} - ${new Date().toLocaleDateString('pt-BR')}`;
      
      const { error } = await supabase
        .from('ai_report_history')
        .insert({
          title,
          dimension: analysisData.dimension,
          backup_id: backupId,
          analysis_data: analysisData as any
        });

      if (error) throw error;
      
      // Atualizar lista de histórico
      refetchHistory();
    } catch (error) {
      console.error('Erro ao salvar relatório:', error);
      toast.error('Erro ao salvar relatório no histórico');
    }
  };

  const downloadReportPDF = (report: any) => {
    try {
      const doc = new jsPDF();
      
      // Título do relatório
      doc.setFontSize(18);
      doc.text(report.title, 14, 20);
      
      // Informações do relatório
      doc.setFontSize(12);
      doc.text(`Dimensão: ${report.dimension}`, 14, 35);
      doc.text(`Data: ${new Date(report.created_at).toLocaleDateString('pt-BR')}`, 14, 45);
      
      // Métricas
      const analysisData = report.analysis_data;
      doc.text(`Total de Votos: ${analysisData.totalVotes}`, 14, 60);
      doc.text(`Votantes Únicos: ${analysisData.uniqueVoters}`, 14, 70);
      doc.text(`Taxa de Participação: ${analysisData.participationRate.toFixed(1)}%`, 14, 80);
      
      let yPosition = 100;
      
      // Pontos Fortes
      if (analysisData.strengths && analysisData.strengths.length > 0) {
        doc.setFontSize(14);
        doc.text('Pontos Fortes:', 14, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        analysisData.strengths.forEach((strength: any, index: number) => {
          const text = `${index + 1}. ${strength.text} (${strength.votes} votos)`;
          const splitText = doc.splitTextToSize(text, 180);
          doc.text(splitText, 14, yPosition);
          yPosition += splitText.length * 5 + 5;
        });
        yPosition += 10;
      }
      
      // Desafios
      if (analysisData.challenges && analysisData.challenges.length > 0) {
        doc.setFontSize(14);
        doc.text('Desafios:', 14, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        analysisData.challenges.forEach((challenge: any, index: number) => {
          const text = `${index + 1}. ${challenge.text} (${challenge.votes} votos)`;
          const splitText = doc.splitTextToSize(text, 180);
          doc.text(splitText, 14, yPosition);
          yPosition += splitText.length * 5 + 5;
        });
        yPosition += 10;
      }
      
      // Oportunidades
      if (analysisData.opportunities && analysisData.opportunities.length > 0) {
        doc.setFontSize(14);
        doc.text('Oportunidades:', 14, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        analysisData.opportunities.forEach((opportunity: any, index: number) => {
          const text = `${index + 1}. ${opportunity.text} (${opportunity.votes} votos)`;
          const splitText = doc.splitTextToSize(text, 180);
          doc.text(splitText, 14, yPosition);
          yPosition += splitText.length * 5 + 5;
        });
      }
      
      doc.save(`${report.title}.pdf`);
      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF');
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

      {/* Seção de Análise de Backup */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Análise de Backup Excel</h2>
        </div>
        
        <div className="space-y-4">
          <DimensionFilter
            selectedDimension={selectedDimension}
            onDimensionChange={setSelectedDimension}
            dimensions={dimensions}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Filtro por Data (opcional):</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Selecionar data mínima..."
            />
            <p className="text-xs text-gray-500">
              Deixe vazio para analisar todos os backups disponíveis ({backups.length} encontrados)
            </p>
          </div>

          <Button
            onClick={handleAnalyzeBackup}
            disabled={isLoadingAnalysis || backups.length === 0}
            className="w-full"
          >
            {isLoadingAnalysis ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando backups Excel...
              </>
            ) : (
              <>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Analisar Todos os Backups Excel
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

      {/* Seção de Histórico de Relatórios */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-green-600" />
          <h2 className="text-xl font-semibold">Histórico de Relatórios</h2>
        </div>
        
        {isLoadingHistory ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando histórico...</span>
          </div>
        ) : reportHistory && reportHistory.length > 0 ? (
          <div className="space-y-4">
            {reportHistory.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{report.title}</h3>
                    <p className="text-sm text-gray-500">
                      Dimensão: {report.dimension} | 
                      Criado em: {new Date(report.created_at).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {(report.analysis_data as any)?.totalVotes || 0} votos • {(report.analysis_data as any)?.uniqueVoters || 0} votantes únicos
                    </p>
                  </div>
                  <Button
                    onClick={() => downloadReportPDF(report)}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            Nenhum relatório foi gerado ainda. Analyze um backup para criar seu primeiro relatório.
          </p>
        )}
      </Card>

    </div>
  );
}
