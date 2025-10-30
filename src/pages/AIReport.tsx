import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { VotingMetrics } from '@/components/analytics/VotingMetrics';
import { VotingResults } from '@/components/analytics/VotingResults';
import { DimensionFilter } from '@/components/analytics/DimensionFilter';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, Save, History, Eye, Sparkles, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReactMarkdown from 'react-markdown';

interface VoteOption {
  optionNumber: string;
  total: number;
  text: string;
  dimension?: string;
}

interface VotingData {
  strengths: VoteOption[];
  challenges: VoteOption[];
  opportunities: VoteOption[];
}

interface Dimension {
  id: string;
  label: string;
  identifier: string;
  background_color: string;
}

const AIReport = () => {
  const [selectedDimension, setSelectedDimension] = useState("all");
  const [displayDimension, setDisplayDimension] = useState("all");
  const [votingData, setVotingData] = useState<VotingData | null>(null);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [reportTitle, setReportTitle] = useState('');
  const [activeTab, setActiveTab] = useState("upload");
  const [semanticReport, setSemanticReport] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'strengths' | 'challenges' | 'opportunities'>('strengths');
  const [selectedSemanticDimension, setSelectedSemanticDimension] = useState("all");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: dimensions } = useQuery<Dimension[]>({
    queryKey: ['dimensions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fic_dimensions')
        .select('*')
        .order('label');

      if (error) throw error;
      return data || [];
    },
  });

  const { data: reportHistory } = useQuery({
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

  const saveReportMutation = useMutation({
    mutationFn: async () => {
      if (!votingData || !reportTitle.trim()) {
        throw new Error('Dados do relatório ou título ausentes');
      }

      console.log('Salvando relatório:', {
        title: reportTitle,
        dimension: selectedDimension,
        totalParticipants,
        totalVotes: calculateTotalVotes(),
      });

      const { error } = await supabase
        .from('ai_report_history')
        .insert({
          backup_id: crypto.randomUUID(),
          analysis_data: {
            strengths: votingData.strengths,
            challenges: votingData.challenges,
            opportunities: votingData.opportunities,
            totalParticipants,
            totalVotes: calculateTotalVotes(),
          },
          dimension: selectedDimension,
          title: reportTitle.trim(),
        } as any);

      if (error) {
        console.error('Erro ao salvar relatório:', error);
        throw error;
      }

      console.log('Relatório salvo com sucesso');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-report-history'] });
      toast({
        title: "Relatório salvo com sucesso",
        description: "O relatório foi adicionado ao histórico.",
      });
      setReportTitle('');
      setActiveTab('history');
    },
    onError: (error) => {
      console.error('Erro no mutation:', error);
      toast({
        title: "Erro ao salvar relatório",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    console.log('handleFileUpload chamado, files:', files);
    
    if (!files || files.length === 0) {
      console.log('Nenhum arquivo selecionado');
      return;
    }

    try {
      console.log('Iniciando processamento de', files.length, 'arquivo(s)...');
      
      const allVotes: { [key: string]: Map<string, { text: string; count: number; dimensions: Set<string> }> } = {
        strengths: new Map(),
        challenges: new Map(),
        opportunities: new Map(),
      };

      const participantsSet = new Set<string>();

      // Process each file
      for (const file of Array.from(files)) {
        console.log('Processando arquivo:', file.name);
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);

        // Process each sheet
        for (const sheetName of workbook.SheetNames) {
          console.log('Processando planilha:', sheetName);
          const worksheet = workbook.Sheets[sheetName];
          const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
          console.log('Linhas encontradas:', jsonData.length);

          for (const row of jsonData) {
            // Extract email for participant counting
            const email = row['Email do Votante'] || row['Email'] || row['email'];
            if (email) {
              participantsSet.add(String(email).trim());
            }

            // Get dimension from the row
            const dimension = row['Dimensão'] || row['Dimension'] || row['dimension'];

            // Get the section type (Pontos Fortes, Desafios, Oportunidades)
            const sectionType = row['Seção Votada'] || row['Section'] || row['section'];
            const optionText = row['Texto Completo da Opção'] || row['Option Text'] || row['text'];

            if (!sectionType || !optionText || typeof optionText !== 'string' || optionText.trim().length === 0) {
              continue;
            }

            // Map section type to category key
            let categoryKey: 'strengths' | 'challenges' | 'opportunities' | null = null;
            
            const sectionLower = sectionType.toLowerCase().trim();
            if (sectionLower.includes('pontos fortes') || sectionLower.includes('forças') || sectionLower.includes('strengths')) {
              categoryKey = 'strengths';
            } else if (sectionLower.includes('desafios') || sectionLower.includes('challenges')) {
              categoryKey = 'challenges';
            } else if (sectionLower.includes('oportunidades') || sectionLower.includes('opportunities')) {
              categoryKey = 'opportunities';
            }

            if (!categoryKey) {
              continue;
            }

            // Add the vote to the appropriate category
            const cleanText = optionText.trim();
            const existing = allVotes[categoryKey].get(cleanText);
            if (existing) {
              existing.count++;
              if (dimension) {
                existing.dimensions.add(dimension);
              }
            } else {
              const dimensions = new Set<string>();
              if (dimension) {
                dimensions.add(dimension);
              }
              allVotes[categoryKey].set(cleanText, { text: cleanText, count: 1, dimensions });
            }
          }
        }
      }

      console.log('Total de participantes únicos:', participantsSet.size);
      console.log('Votos por categoria:', {
        strengths: allVotes.strengths.size,
        challenges: allVotes.challenges.size,
        opportunities: allVotes.opportunities.size,
      });

      // Convert to VotingData format and sort by votes
      const processedData: VotingData = {
        strengths: Array.from(allVotes.strengths.values())
          .sort((a, b) => b.count - a.count)
          .map((v, i) => ({
            optionNumber: String(i + 1),
            total: v.count,
            text: v.text,
            dimension: Array.from(v.dimensions).join(', ') || undefined,
          })),
        challenges: Array.from(allVotes.challenges.values())
          .sort((a, b) => b.count - a.count)
          .map((v, i) => ({
            optionNumber: String(i + 1),
            total: v.count,
            text: v.text,
            dimension: Array.from(v.dimensions).join(', ') || undefined,
          })),
        opportunities: Array.from(allVotes.opportunities.values())
          .sort((a, b) => b.count - a.count)
          .map((v, i) => ({
            optionNumber: String(i + 1),
            total: v.count,
            text: v.text,
            dimension: Array.from(v.dimensions).join(', ') || undefined,
          })),
      };

      setVotingData(processedData);
      setTotalParticipants(participantsSet.size);
      setDisplayDimension('all');

      toast({
        title: "Arquivos processados com sucesso",
        description: `${files.length} arquivo(s) processado(s). ${participantsSet.size} participante(s) encontrado(s).`,
      });
    } catch (error) {
      console.error('Erro ao processar arquivos:', error);
      toast({
        title: "Erro ao processar arquivos",
        description: error instanceof Error ? error.message : "Verifique se os arquivos estão no formato correto.",
        variant: "destructive",
      });
    }
  };

  const calculateTotalVotes = (): number => {
    if (!votingData) return 0;
    return Object.values(votingData).reduce((acc, categoryVotes) => {
      return acc + categoryVotes.reduce((sum, vote) => sum + (vote.total || 0), 0);
    }, 0);
  };

  const totalVotes = calculateTotalVotes();

  // Filter voting data based on selected dimension for display only
  const getFilteredVotingData = (): VotingData | null => {
    if (!votingData) return null;
    
    if (displayDimension === 'all') return votingData;
    
    return {
      strengths: votingData.strengths.filter(v => 
        !v.dimension || v.dimension.includes(displayDimension)
      ),
      challenges: votingData.challenges.filter(v => 
        !v.dimension || v.dimension.includes(displayDimension)
      ),
      opportunities: votingData.opportunities.filter(v => 
        !v.dimension || v.dimension.includes(displayDimension)
      ),
    };
  };

  const filteredData = getFilteredVotingData();

  const downloadExcelReport = () => {
    if (!votingData) return;

    const workbook = XLSX.utils.book_new();

    // Create sheets for each category
    const strengthsData = votingData.strengths.map(v => ({
      'Número': v.optionNumber,
      'Texto': v.text,
      'Votos': v.total,
      'Dimensão': v.dimension || 'N/A'
    }));
    const strengthsSheet = XLSX.utils.json_to_sheet(strengthsData);
    XLSX.utils.book_append_sheet(workbook, strengthsSheet, 'Pontos Fortes');

    const challengesData = votingData.challenges.map(v => ({
      'Número': v.optionNumber,
      'Texto': v.text,
      'Votos': v.total,
      'Dimensão': v.dimension || 'N/A'
    }));
    const challengesSheet = XLSX.utils.json_to_sheet(challengesData);
    XLSX.utils.book_append_sheet(workbook, challengesSheet, 'Desafios');

    const opportunitiesData = votingData.opportunities.map(v => ({
      'Número': v.optionNumber,
      'Texto': v.text,
      'Votos': v.total,
      'Dimensão': v.dimension || 'N/A'
    }));
    const opportunitiesSheet = XLSX.utils.json_to_sheet(opportunitiesData);
    XLSX.utils.book_append_sheet(workbook, opportunitiesSheet, 'Oportunidades');

    XLSX.writeFile(workbook, `relatorio-votos-${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: "Relatório baixado",
      description: "O arquivo Excel foi gerado com sucesso.",
    });
  };

  const downloadSemanticExcel = () => {
    if (!semanticReport) return;

    const workbook = XLSX.utils.book_new();
    
    // Convert markdown report to plain text for Excel
    const plainTextReport = semanticReport
      .replace(/[#*_~`]/g, '')
      .split('\n')
      .map(line => ({ 'Conteúdo': line }));

    const sheet = XLSX.utils.json_to_sheet(plainTextReport);
    XLSX.utils.book_append_sheet(workbook, sheet, 'Relatório Semântico');

    XLSX.writeFile(workbook, `relatorio-semantico-${selectedCategory}-${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: "Relatório semântico baixado",
      description: "O arquivo Excel foi gerado com sucesso.",
    });
  };

  const generateSemanticReport = async () => {
    if (!votingData) return;

    setIsGeneratingReport(true);
    try {
      // Filter data by selected dimension for semantic report
      const dataToAnalyze = selectedSemanticDimension === 'all' 
        ? votingData 
        : {
            strengths: votingData.strengths.filter(v => 
              !v.dimension || v.dimension.includes(selectedSemanticDimension)
            ),
            challenges: votingData.challenges.filter(v => 
              !v.dimension || v.dimension.includes(selectedSemanticDimension)
            ),
            opportunities: votingData.opportunities.filter(v => 
              !v.dimension || v.dimension.includes(selectedSemanticDimension)
            ),
          };

      const { data, error } = await supabase.functions.invoke('generate-semantic-report', {
        body: {
          votingData: {
            strengths: dataToAnalyze.strengths,
            challenges: dataToAnalyze.challenges,
            opportunities: dataToAnalyze.opportunities,
            totalParticipants,
          },
          category: selectedCategory,
          dimension: selectedSemanticDimension,
        },
      });

      if (error) throw error;

      setSemanticReport(data.report);
      toast({
        title: "Relatório gerado com sucesso",
        description: "O relatório semântico foi criado pela IA.",
      });
    } catch (error) {
      console.error('Error generating semantic report:', error);
      toast({
        title: "Erro ao gerar relatório",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao gerar o relatório.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const categoryLabels = {
    strengths: 'Pontos Fortes',
    challenges: 'Desafios',
    opportunities: 'Oportunidades',
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Relatório de Votos</h1>
          <p className="text-muted-foreground mt-2">
            Análise de votos por upload de arquivos XLS
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="upload">Upload de Arquivos</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">

      <Card className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Upload de Arquivos XLS</label>
            <div className="flex gap-2">
              <input
                type="file"
                accept=".xls,.xlsx"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Selecionar Arquivos
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Os arquivos serão processados e você poderá filtrar por dimensão após o upload
            </p>
          </div>
        </div>
      </Card>

        {votingData && (
          <>
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Salvar Relatório no Histórico</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Título do relatório"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                  />
                  <Button
                    onClick={() => saveReportMutation.mutate()}
                    disabled={!reportTitle.trim() || saveReportMutation.isPending}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {saveReportMutation.isPending ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Filtrar Visualização por Dimensão</label>
                <DimensionFilter
                  selectedDimension={displayDimension}
                  onDimensionChange={setDisplayDimension}
                  dimensions={dimensions}
                />
                <p className="text-xs text-muted-foreground">
                  Este filtro aplica-se apenas à visualização dos dados já processados
                </p>
              </div>
            </Card>

            <VotingMetrics
              totalVoters={totalParticipants}
              totalVotes={totalVotes}
              participationRate={0}
            />

            <VotingResults
              strengths={filteredData?.strengths || []}
              challenges={filteredData?.challenges || []}
              opportunities={filteredData?.opportunities || []}
            />

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Exportar Relatório</h3>
                <Button onClick={downloadExcelReport} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Baixar Excel
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Gerar Relatório Semântico com IA
                </h3>
                <p className="text-sm text-muted-foreground">
                  A IA irá agrupar os votos em temas principais, calcular porcentagens e criar um relatório executivo estruturado.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strengths">{categoryLabels.strengths}</SelectItem>
                      <SelectItem value="challenges">{categoryLabels.challenges}</SelectItem>
                      <SelectItem value="opportunities">{categoryLabels.opportunities}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedSemanticDimension} onValueChange={setSelectedSemanticDimension}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Selecione a dimensão" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Dimensões</SelectItem>
                      {dimensions?.map((dim) => (
                        <SelectItem key={dim.id} value={dim.identifier}>
                          {dim.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={generateSemanticReport}
                    disabled={isGeneratingReport}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {isGeneratingReport ? 'Gerando...' : 'Gerar Relatório'}
                  </Button>
                </div>
              </div>
            </Card>

            {semanticReport && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Relatório Semântico Gerado</h3>
                  <Button onClick={downloadSemanticExcel} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Baixar Excel
                  </Button>
                </div>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{semanticReport}</ReactMarkdown>
                </div>
              </Card>
            )}
          </>
        )}

        {!votingData && (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <FileSpreadsheet className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Selecione um ou mais arquivos XLS para visualizar o relatório de votos</p>
            </div>
          </Card>
        )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {reportHistory && reportHistory.length > 0 ? (
            reportHistory.map((report) => (
              <Card key={report.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{report.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(report.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Dimensão: {report.dimension === 'all' ? 'Todas' : report.dimension}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const data = report.analysis_data as any;
                      setVotingData({
                        strengths: data.strengths || [],
                        challenges: data.challenges || [],
                        opportunities: data.opportunities || [],
                      });
                      setTotalParticipants(data.totalParticipants || 0);
                      setSelectedDimension(report.dimension);
                      setDisplayDimension('all');
                      setActiveTab('upload');
                      toast({
                        title: "Relatório carregado",
                        description: `Visualizando: ${report.title}`,
                      });
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Visualizar
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12">
              <div className="text-center text-muted-foreground">
                <History className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Nenhum relatório salvo no histórico</p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIReport;
