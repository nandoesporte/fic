import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Brain, Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DimensionFilter } from "@/components/analytics/DimensionFilter";
import { ConsolidatedReportView } from "@/components/analytics/ConsolidatedReportView";

interface VoteGroup {
  groupName: string;
  originalTexts: string[];
  votes: number;
  percentage: number;
}

interface ConsolidatedReport {
  dimension: string;
  totalVotes: number;
  uniqueVoters: number;
  strengths: VoteGroup[];
  challenges: VoteGroup[];
  opportunities: VoteGroup[];
  summary: string;
  insights: string[];
  keywords: string[];
  topDimensions?: { dimension: string; count: number }[];
}

export default function AIReport() {
  const [selectedDimension, setSelectedDimension] = useState<string>("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState<ConsolidatedReport | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

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

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setProgress(0);
    setReport(null);
    
    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const response = await supabase.functions.invoke('generate-ai-consolidated-report', {
        body: { 
          dimension: selectedDimension,
          startDate: startDate || null,
          endDate: endDate || null
        },
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (response.error) {
        console.error('Erro na função:', response.error);
        throw response.error;
      }

      if (response.data.error) {
        throw new Error(response.data.details || response.data.error);
      }

      setReport(response.data);
      toast.success("Relatório consolidado gerado com sucesso!");
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(`Erro ao gerar relatório: ${error.message}`);
      setProgress(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = () => {
    if (!report) return;

    try {
      const doc = new jsPDF();
      let yPosition = 20;
      
      // Título
      doc.setFontSize(20);
      doc.text('Relatório Consolidado de Votos', 14, yPosition);
      yPosition += 15;
      
      // Informações gerais
      doc.setFontSize(12);
      doc.text(`Dimensão: ${report.dimension}`, 14, yPosition);
      yPosition += 8;
      doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, yPosition);
      yPosition += 8;
      doc.text(`Total de Votos: ${report.totalVotes}`, 14, yPosition);
      yPosition += 8;
      doc.text(`Votantes Únicos: ${report.uniqueVoters}`, 14, yPosition);
      yPosition += 15;
      
      // Resumo
      doc.setFontSize(14);
      doc.text('Resumo Executivo', 14, yPosition);
      yPosition += 8;
      doc.setFontSize(10);
      const summaryLines = doc.splitTextToSize(report.summary, 180);
      doc.text(summaryLines, 14, yPosition);
      yPosition += summaryLines.length * 5 + 10;

      // Nova página se necessário
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      // Insights
      doc.setFontSize(14);
      doc.text('Insights Estratégicos', 14, yPosition);
      yPosition += 8;
      doc.setFontSize(10);
      report.insights.forEach((insight, idx) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        const insightText = `${idx + 1}. ${insight}`;
        const lines = doc.splitTextToSize(insightText, 180);
        doc.text(lines, 14, yPosition);
        yPosition += lines.length * 5 + 3;
      });

      // Adicionar tabelas de dados
      const addCategoryTable = (title: string, items: VoteGroup[]) => {
        if (items.length === 0) return;
        
        doc.addPage();
        doc.setFontSize(14);
        doc.text(title, 14, 20);
        
        autoTable(doc, {
          head: [['#', 'Grupo', 'Votos', '%']],
          body: items.map((item, idx) => [
            (idx + 1).toString(),
            item.groupName,
            item.votes.toString(),
            item.percentage.toFixed(1) + '%'
          ]),
          startY: 30,
          styles: { fontSize: 9 },
          headStyles: { fillColor: [66, 139, 202] }
        });
      };

      addCategoryTable('Pontos Fortes Consolidados', report.strengths);
      addCategoryTable('Desafios Consolidados', report.challenges);
      addCategoryTable('Oportunidades Consolidadas', report.opportunities);
      
      doc.save(`relatorio_consolidado_${new Date().getTime()}.pdf`);
      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF');
    }
  };

  const handleExportExcel = () => {
    if (!report) return;

    try {
      const wb = XLSX.utils.book_new();

      // Aba 1: Resumo
      const summaryData = [
        ['Relatório Consolidado de Votos'],
        [''],
        ['Dimensão', report.dimension],
        ['Total de Votos', report.totalVotes],
        ['Votantes Únicos', report.uniqueVoters],
        ['Data de Geração', new Date().toLocaleDateString('pt-BR')],
        [''],
        ['Resumo Executivo'],
        [report.summary],
        [''],
        ['Insights Estratégicos'],
        ...report.insights.map((insight, idx) => [`${idx + 1}. ${insight}`]),
        [''],
        ['Palavras-Chave'],
        [report.keywords.join(', ')]
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, ws1, 'Resumo');

      // Aba 2: Pontos Fortes
      const strengthsData = [
        ['#', 'Grupo', 'Votos', 'Percentual', 'Variações'],
        ...report.strengths.map((item, idx) => [
          idx + 1,
          item.groupName,
          item.votes,
          `${item.percentage.toFixed(1)}%`,
          item.originalTexts.join('; ')
        ])
      ];
      const ws2 = XLSX.utils.aoa_to_sheet(strengthsData);
      XLSX.utils.book_append_sheet(wb, ws2, 'Pontos Fortes');

      // Aba 3: Desafios
      const challengesData = [
        ['#', 'Grupo', 'Votos', 'Percentual', 'Variações'],
        ...report.challenges.map((item, idx) => [
          idx + 1,
          item.groupName,
          item.votes,
          `${item.percentage.toFixed(1)}%`,
          item.originalTexts.join('; ')
        ])
      ];
      const ws3 = XLSX.utils.aoa_to_sheet(challengesData);
      XLSX.utils.book_append_sheet(wb, ws3, 'Desafios');

      // Aba 4: Oportunidades
      const opportunitiesData = [
        ['#', 'Grupo', 'Votos', 'Percentual', 'Variações'],
        ...report.opportunities.map((item, idx) => [
          idx + 1,
          item.groupName,
          item.votes,
          `${item.percentage.toFixed(1)}%`,
          item.originalTexts.join('; ')
        ])
      ];
      const ws4 = XLSX.utils.aoa_to_sheet(opportunitiesData);
      XLSX.utils.book_append_sheet(wb, ws4, 'Oportunidades');

      XLSX.writeFile(wb, `relatorio_consolidado_${new Date().getTime()}.xlsx`);
      toast.success('Excel exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      toast.error('Erro ao exportar Excel');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Relatório Consolidado com IA</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Análise inteligente de todos os arquivos exportados, com agrupamento semântico e insights estratégicos
        </p>
      </div>

      {/* Card de Geração */}
      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="h-7 w-7 text-primary" />
          <h2 className="text-2xl font-semibold">Gerar Relatório Consolidado</h2>
        </div>
        
        <div className="space-y-6">
          <DimensionFilter
            selectedDimension={selectedDimension}
            onDimensionChange={setSelectedDimension}
            dimensions={dimensions}
          />

          <div className="space-y-3">
            <label className="text-sm font-semibold">Filtro por Período (opcional):</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-2">Data Inicial:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-2">Data Final:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Deixe vazio para analisar todos os backups disponíveis
            </p>
          </div>

          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Analisando votos com IA...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          <Button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processando backups Excel com IA...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-5 w-5" />
                Gerar Relatório Consolidado
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Resultados do Relatório */}
      {report && (
        <div className="space-y-6">
          {/* Botões de Exportação */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Exportar Relatório</h3>
              <div className="flex gap-3">
                <Button onClick={handleExportPDF} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Baixar PDF
                </Button>
                <Button onClick={handleExportExcel} variant="outline" className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Baixar Excel
                </Button>
              </div>
            </div>
          </Card>

          {/* Visualização do Relatório */}
          <ConsolidatedReportView {...report} />
        </div>
      )}
    </div>
  );
}
