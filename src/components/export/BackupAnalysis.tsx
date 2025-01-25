import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BackupAnalysisProps {
  setIsAnalyzing: (value: boolean) => void;
}

export const analyzeBackup = async (backup: any, setIsAnalyzing: (value: boolean) => void) => {
  setIsAnalyzing(true);
  try {
    const { data: dimensions } = await supabase
      .from('fic_dimensions')
      .select('*');

    if (!dimensions) {
      throw new Error('No dimensions found');
    }

    const votingData = backup.data;
    
    // Group votes by dimension
    const votesByDimension = dimensions.reduce((acc: any, dim: any) => {
      acc[dim.identifier] = votingData.filter((vote: any) => 
        vote.dimension === dim.identifier
      );
      return acc;
    }, {});

    // Analyze each dimension
    for (const [dimension, votes] of Object.entries(votesByDimension)) {
      const response = await supabase.functions.invoke('analyze-votes', {
        body: { votingData: votes, dimension }
      });

      if (response.error) {
        throw new Error(`Error analyzing dimension ${dimension}: ${response.error}`);
      }

      toast.success(`Análise da dimensão ${dimension} concluída!`);
      
      // Format dates as YYYY-MM-DD for PostgreSQL
      const currentDate = new Date().toISOString().split('T')[0];
      
      // Save the analysis report
      const { error: reportError } = await supabase
        .from('fic_reports')
        .insert([{
          title: `Análise de Votos - ${dimension}`,
          description: response.data.analysis,
          dimension: dimension,
          start_date: currentDate,
          end_date: currentDate,
          metrics: { totalVotes: (votes as any[]).length }
        }]);

      if (reportError) {
        throw new Error(`Error saving report for dimension ${dimension}: ${reportError.message}`);
      }
    }

    toast.success('Análise completa! Os relatórios foram salvos.');
  } catch (error) {
    console.error('Error analyzing backup:', error);
    toast.error('Erro ao analisar o backup');
  } finally {
    setIsAnalyzing(false);
  }
};