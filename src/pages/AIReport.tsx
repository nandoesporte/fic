import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { VotingMetrics } from '@/components/analytics/VotingMetrics';
import { VotingResults } from '@/components/analytics/VotingResults';
import { DimensionFilter } from '@/components/analytics/DimensionFilter';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, Save, History, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

interface VoteOption {
  optionNumber: string;
  total: number;
  text: string;
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
  const [votingData, setVotingData] = useState<VotingData | null>(null);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [reportTitle, setReportTitle] = useState('');
  const [activeTab, setActiveTab] = useState("upload");
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
      
      const allVotes: { [key: string]: Map<string, { text: string; count: number }> } = {
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
            
            // Only skip if we're filtering AND it doesn't match
            if (selectedDimension !== 'all' && dimension && dimension !== selectedDimension) {
              continue;
            }

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
            } else {
              allVotes[categoryKey].set(cleanText, { text: cleanText, count: 1 });
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
          })),
        challenges: Array.from(allVotes.challenges.values())
          .sort((a, b) => b.count - a.count)
          .map((v, i) => ({
            optionNumber: String(i + 1),
            total: v.count,
            text: v.text,
          })),
        opportunities: Array.from(allVotes.opportunities.values())
          .sort((a, b) => b.count - a.count)
          .map((v, i) => ({
            optionNumber: String(i + 1),
            total: v.count,
            text: v.text,
          })),
      };

      setVotingData(processedData);
      setTotalParticipants(participantsSet.size);

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
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Dimensão</label>
              <DimensionFilter
                selectedDimension={selectedDimension}
                onDimensionChange={setSelectedDimension}
                dimensions={dimensions}
              />
            </div>
            
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
            </div>
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
                    Salvar
                  </Button>
                </div>
              </div>
            </Card>

            <VotingMetrics
              totalVoters={totalParticipants}
              totalVotes={totalVotes}
              participationRate={0}
            />

            <VotingResults
              strengths={votingData.strengths || []}
              challenges={votingData.challenges || []}
              opportunities={votingData.opportunities || []}
            />
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
