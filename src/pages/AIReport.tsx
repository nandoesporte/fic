import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { VotingMetrics } from '@/components/analytics/VotingMetrics';
import { VotingResults } from '@/components/analytics/VotingResults';
import { DimensionFilter } from '@/components/analytics/DimensionFilter';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

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
  const { toast } = useToast();

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      const allVotes: { [key: string]: Map<string, { text: string; count: number }> } = {
        strengths: new Map(),
        challenges: new Map(),
        opportunities: new Map(),
      };

      const participantsSet = new Set<string>();

      // Process each file
      for (const file of Array.from(files)) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);

        // Process each sheet
        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

          for (const row of jsonData) {
            // Try to identify dimension
            const dimension = row['Dimensão'] || row['Dimension'] || row['dimension'];
            
            // Skip if filtering by dimension and doesn't match
            if (selectedDimension !== 'all' && dimension !== selectedDimension) {
              continue;
            }

            // Extract email for participant counting
            const email = row['Email'] || row['email'] || row['E-mail'];
            if (email) participantsSet.add(email);

            // Process strengths, challenges, opportunities
            ['strengths', 'challenges', 'opportunities'].forEach(category => {
              const categoryKey = category === 'strengths' ? 'Pontos Fortes' : 
                                 category === 'challenges' ? 'Desafios' : 'Oportunidades';
              
              const content = row[categoryKey] || row[category] || row[category.toUpperCase()];
              
              if (content && typeof content === 'string') {
                // Split content by line breaks
                const options = content.split(/\n|;/).map(opt => opt.trim()).filter(opt => opt.length > 0);
                
                options.forEach(option => {
                  const existing = allVotes[category].get(option);
                  if (existing) {
                    existing.count++;
                  } else {
                    allVotes[category].set(option, { text: option, count: 1 });
                  }
                });
              }
            });
          }
        }
      }

      // Convert to VotingData format
      const processedData: VotingData = {
        strengths: Array.from(allVotes.strengths.values()).map((v, i) => ({
          optionNumber: String(i + 1),
          total: v.count,
          text: v.text,
        })),
        challenges: Array.from(allVotes.challenges.values()).map((v, i) => ({
          optionNumber: String(i + 1),
          total: v.count,
          text: v.text,
        })),
        opportunities: Array.from(allVotes.opportunities.values()).map((v, i) => ({
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
        description: "Verifique se os arquivos estão no formato correto.",
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
                <label htmlFor="file-upload" className="flex-1">
                  <Button variant="outline" className="w-full" asChild>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      Selecionar Arquivos
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {votingData && (
        <>
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
    </div>
  );
};

export default AIReport;
