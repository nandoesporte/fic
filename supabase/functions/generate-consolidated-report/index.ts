import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConsolidatedVote {
  groupName: string;
  originalTexts: string[];
  totalVotes: number;
  category: 'strengths' | 'challenges' | 'opportunities';
}

interface ConsolidatedReport {
  dimension: string;
  totalVotes: number;
  uniqueVoters: number;
  strengths: ConsolidatedVote[];
  challenges: ConsolidatedVote[];
  opportunities: ConsolidatedVote[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dimension } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar backups
    const { data: backups, error } = await supabase
      .from('data_backups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log(`Processando ${backups?.length} backups`);

    // Extrair todos os votos dos backups
    const allVotes: {[key: string]: any[]} = {
      strengths: [],
      challenges: [],
      opportunities: []
    };

    let totalVotes = 0;
    const uniqueVoters = new Set<string>();

    for (const backup of backups || []) {
      try {
        const data = backup.data as any;
        
        // Verificar diferentes estruturas possíveis
        let questionnaires: any[] = [];
        let votes: any[] = [];

        if (data.questionnaires) {
          questionnaires = data.questionnaires;
        }
        if (data.votes) {
          votes = data.votes;
        }

        // Filtrar por dimensão se especificada
        if (dimension && dimension !== 'all') {
          questionnaires = questionnaires.filter(q => q.dimension === dimension);
          votes = votes.filter(v => {
            const questionnaire = questionnaires.find(q => q.id === v.questionnaire_id);
            return questionnaire?.dimension === dimension;
          });
        }

        // Processar votos para extrair opções
        for (const vote of votes) {
          if (vote.email) {
            uniqueVoters.add(vote.email);
          }

          const questionnaire = questionnaires.find(q => q.id === vote.questionnaire_id);
          if (!questionnaire) continue;

          // Processar pontos fortes
          if (vote.strengths_votes && questionnaire.strengths) {
            const strengthOptions = questionnaire.strengths.split(/\n{2,}|\n/).filter((s: string) => s.trim());
            for (const voteIndex of vote.strengths_votes) {
              const option = strengthOptions[voteIndex - 1];
              if (option) {
                allVotes.strengths.push({ text: option.trim(), voter: vote.email });
                totalVotes++;
              }
            }
          }

          // Processar desafios
          if (vote.challenges_votes && questionnaire.challenges) {
            const challengeOptions = questionnaire.challenges.split(/\n{2,}|\n/).filter((s: string) => s.trim());
            for (const voteIndex of vote.challenges_votes) {
              const option = challengeOptions[voteIndex - 1];
              if (option) {
                allVotes.challenges.push({ text: option.trim(), voter: vote.email });
                totalVotes++;
              }
            }
          }

          // Processar oportunidades
          if (vote.opportunities_votes && questionnaire.opportunities) {
            const opportunityOptions = questionnaire.opportunities.split(/\n{2,}|\n/).filter((s: string) => s.trim());
            for (const voteIndex of vote.opportunities_votes) {
              const option = opportunityOptions[voteIndex - 1];
              if (option) {
                allVotes.opportunities.push({ text: option.trim(), voter: vote.email });
                totalVotes++;
              }
            }
          }
        }

        // NOVO: Processar questionários mesmo sem votos registrados para incluir todas as opções
        for (const questionnaire of questionnaires) {
          // Adicionar todas as opções de pontos fortes
          if (questionnaire.strengths) {
            const strengthOptions = questionnaire.strengths.split(/\n{2,}|\n/).filter((s: string) => s.trim());
            strengthOptions.forEach((option: string) => {
              const trimmedOption = option.trim();
              if (trimmedOption && !allVotes.strengths.some(v => v.text === trimmedOption)) {
                // Se a opção não existe ainda nos votos, adiciona com 1 voto mínimo
                allVotes.strengths.push({ text: trimmedOption, voter: 'sistema' });
                totalVotes++;
              }
            });
          }

          // Adicionar todas as opções de desafios
          if (questionnaire.challenges) {
            const challengeOptions = questionnaire.challenges.split(/\n{2,}|\n/).filter((s: string) => s.trim());
            challengeOptions.forEach((option: string) => {
              const trimmedOption = option.trim();
              if (trimmedOption && !allVotes.challenges.some(v => v.text === trimmedOption)) {
                allVotes.challenges.push({ text: trimmedOption, voter: 'sistema' });
                totalVotes++;
              }
            });
          }

          // Adicionar todas as opções de oportunidades
          if (questionnaire.opportunities) {
            const opportunityOptions = questionnaire.opportunities.split(/\n{2,}|\n/).filter((s: string) => s.trim());
            opportunityOptions.forEach((option: string) => {
              const trimmedOption = option.trim();
              if (trimmedOption && !allVotes.opportunities.some(v => v.text === trimmedOption)) {
                allVotes.opportunities.push({ text: trimmedOption, voter: 'sistema' });
                totalVotes++;
              }
            });
          }
        }
      } catch (error) {
        console.error('Erro processando backup:', error);
      }
    }

    console.log(`Extraídos ${totalVotes} votos de ${uniqueVoters.size} votantes únicos`);

    // Função para agrupar textos similares usando IA
    const groupSimilarTexts = async (texts: string[], category: string): Promise<ConsolidatedVote[]> => {
      if (texts.length === 0) return [];

      const uniqueTexts = [...new Set(texts)];
      
      const prompt = `
Analise as seguintes opções de ${category} e agrupe-as por significado/intenção similar.
Cada grupo deve ter um nome representativo e conter todas as variações de texto que expressam a mesma ideia.

Opções para agrupar:
${uniqueTexts.map((text, i) => `${i + 1}. ${text}`).join('\n')}

Responda APENAS com um JSON válido no formato:
[
  {
    "groupName": "Nome do grupo representativo",
    "originalTexts": ["texto1", "texto2", ...]
  }
]

Seja preciso e agrupe apenas textos que realmente expressam a mesma intenção.`;

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4.1-2025-04-14',
            messages: [
              { role: 'system', content: 'Você é um especialista em análise de dados qualitativos. Agrupe textos por similaridade semântica.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.1,
            max_tokens: 2000
          }),
        });

        if (!response.ok) {
          console.error('Erro na API OpenAI:', response.status, response.statusText);
          // Fallback: agrupar por texto exato
          return uniqueTexts.map(text => ({
            groupName: text,
            originalTexts: [text],
            totalVotes: texts.filter(t => t === text).length,
            category: category as any
          }));
        }

        const data = await response.json();
        const groups = JSON.parse(data.choices[0].message.content);

        return groups.map((group: any) => ({
          groupName: group.groupName,
          originalTexts: group.originalTexts,
          totalVotes: group.originalTexts.reduce((sum: number, text: string) => 
            sum + texts.filter(t => t === text).length, 0),
          category: category as any
        }));

      } catch (error) {
        console.error('Erro no agrupamento IA:', error);
        // Fallback: agrupar por texto exato
        return uniqueTexts.map(text => ({
          groupName: text,
          originalTexts: [text],
          totalVotes: texts.filter(t => t === text).length,
          category: category as any
        }));
      }
    };

    // Agrupar por categoria
    const [strengthGroups, challengeGroups, opportunityGroups] = await Promise.all([
      groupSimilarTexts(allVotes.strengths.map(v => v.text), 'pontos fortes'),
      groupSimilarTexts(allVotes.challenges.map(v => v.text), 'desafios'),
      groupSimilarTexts(allVotes.opportunities.map(v => v.text), 'oportunidades')
    ]);

    const report: ConsolidatedReport = {
      dimension: dimension || 'all',
      totalVotes,
      uniqueVoters: uniqueVoters.size,
      strengths: strengthGroups.sort((a, b) => b.totalVotes - a.totalVotes),
      challenges: challengeGroups.sort((a, b) => b.totalVotes - a.totalVotes),
      opportunities: opportunityGroups.sort((a, b) => b.totalVotes - a.totalVotes)
    };

    console.log('Relatório consolidado gerado:', {
      dimension: report.dimension,
      totalVotes: report.totalVotes,
      uniqueVoters: report.uniqueVoters,
      strengthsGroups: report.strengths.length,
      challengesGroups: report.challenges.length,
      opportunitiesGroups: report.opportunities.length
    });

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro ao gerar relatório consolidado',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});