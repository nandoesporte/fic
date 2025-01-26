import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download, FileSpreadsheet, FilePdf } from "lucide-react";
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

export default function AIReport() {
  const [selectedDimension, setSelectedDimension] = useState<string>("");
  const [analysis, setAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

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
    if (!selectedDimension) {
      toast.error("Por favor, selecione uma dimensão");
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    try {
      const response = await supabase.functions.invoke('analyze-vote-backups', {
        body: { dimension: selectedDimension },
      });

      if (response.error) throw response.error;
      setAnalysis(response.data.analysis);
      setProgress(100);
      toast.success("Análise concluída com sucesso!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erro ao gerar análise");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    if (!reports || reports.length === 0) {
      toast.error("Nenhum relatório disponível para exportar");
      return;
    }

    const content = reports.map(report => ({
      dimensao: report.dimension,
      titulo: report.title,
      descricao: report.description,
      metricas: report.metrics,
      data_inicio: new Date(report.start_date).toLocaleDateString('pt-BR'),
      data_fim: new Date(report.end_date).toLocaleDateString('pt-BR'),
    }));

    switch (format) {
      case 'csv':
        const csv = [
          ['Dimensão', 'Título', 'Descrição', 'Total Votos', 'Data Início', 'Data Fim'].join(','),
          ...content.map(r => [
            r.dimensao,
            r.titulo,
            r.descricao,
            r.metricas.total_votos,
            r.data_inicio,
            r.data_fim
          ].join(','))
        ].join('\n');

        const csvBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const csvUrl = URL.createObjectURL(csvBlob);
        const csvLink = document.createElement('a');
        csvLink.href = csvUrl;
        csvLink.setAttribute('download', 'relatorio_ia.csv');
        document.body.appendChild(csvLink);
        csvLink.click();
        document.body.removeChild(csvLink);
        break;

      // Note: For PDF and Excel, in a real implementation you'd want to use libraries
      // like jsPDF and xlsx, but for now we'll just show a toast
      case 'pdf':
      case 'excel':
        toast.info(`Exportação para ${format.toUpperCase()} será implementada em breve`);
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Relatório IA</h1>
        <p className="text-gray-500 mt-2">
          Análise detalhada dos votos por dimensão usando inteligência artificial
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecione a Dimensão
            </label>
            <select
              className="w-full p-2 border rounded-md"
              value={selectedDimension}
              onChange={(e) => setSelectedDimension(e.target.value)}
            >
              <option value="">Selecione uma dimensão...</option>
              {dimensions?.map((dimension) => (
                <option key={dimension.identifier} value={dimension.identifier}>
                  {dimension.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !selectedDimension}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analisando...
              </>
            ) : (
              'Gerar Análise'
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
                  onClick={() => handleExport('csv')}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  CSV
                </Button>
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
                  <FilePdf className="h-4 w-4 mr-2" />
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
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.dimension}</TableCell>
                      <TableCell>{report.metrics.total_votos}</TableCell>
                      <TableCell>{report.metrics.pontos_fortes}</TableCell>
                      <TableCell>{report.metrics.desafios}</TableCell>
                      <TableCell>{report.metrics.oportunidades}</TableCell>
                      <TableCell>
                        {new Date(report.start_date).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {new Date(report.end_date).toLocaleDateString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
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