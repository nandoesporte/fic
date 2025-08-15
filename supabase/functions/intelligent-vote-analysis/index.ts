import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BackupData {
  id: string;
  data: any;
  created_at: string;
  dimension?: string;
}

interface VoteAnalysis {
  dimension: string;
  totalVotes: number;
  strengths: { text: string; votes: number; variations: string[] }[];
  challenges: { text: string; votes: number; variations: string[] }[];
  opportunities: { text: string; votes: number; variations: string[] }[];
  participationRate: number;
  uniqueVoters: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dimension } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Buscar todos os arquivos de backup
    const { data: backups, error: backupError } = await supabase
      .from('data_backups')
      .select('*')
      .order('created_at', { ascending: false });

    if (backupError) {
      throw new Error(`Error fetching backups: ${backupError.message}`);
    }

    console.log(`Processing ${backups?.length || 0} backup files`);

    // Processar dados dos backups
    let allVotes: any[] = [];
    let allQuestionnaires: any[] = [];

    for (const backup of backups || []) {
      console.log('Processing backup:', backup.id, 'Type:', backup.type);
      
      if (backup.data && typeof backup.data === 'object') {
        const data = backup.data;
        console.log('Backup data keys:', Object.keys(data));
        
        // Verificar diferentes estruturas possíveis dos backups
        
        // Estrutura 1: dados diretos no root
        if (data.questionnaires && Array.isArray(data.questionnaires)) {
          console.log('Found questionnaires in root:', data.questionnaires.length);
          allQuestionnaires.push(...data.questionnaires);
        }
        
        if (data.votes && Array.isArray(data.votes)) {
          console.log('Found votes in root:', data.votes.length);
          allVotes.push(...data.votes);
        }
        
        // Estrutura 2: dados em exportData
        if (data.exportData) {
          if (data.exportData.questionnaires && Array.isArray(data.exportData.questionnaires)) {
            console.log('Found questionnaires in exportData:', data.exportData.questionnaires.length);
            allQuestionnaires.push(...data.exportData.questionnaires);
          }
          if (data.exportData.votes && Array.isArray(data.exportData.votes)) {
            console.log('Found votes in exportData:', data.exportData.votes.length);
            allVotes.push(...data.exportData.votes);
          }
        }
        
        // Estrutura 3: dados em tables
        if (data.tables) {
          if (data.tables.fic_questionnaires && Array.isArray(data.tables.fic_questionnaires)) {
            console.log('Found questionnaires in tables:', data.tables.fic_questionnaires.length);
            allQuestionnaires.push(...data.tables.fic_questionnaires);
          }
          if (data.tables.questionnaire_votes && Array.isArray(data.tables.questionnaire_votes)) {
            console.log('Found votes in tables:', data.tables.questionnaire_votes.length);
            allVotes.push(...data.tables.questionnaire_votes);
          }
          if (data.tables.votes && Array.isArray(data.tables.votes)) {
            console.log('Found votes in tables.votes:', data.tables.votes.length);
            allVotes.push(...data.tables.votes);
          }
        }
        
        // Estrutura 4: o backup é diretamente um array de questionnaires
        if (Array.isArray(data) && data.length > 0 && data[0].strengths !== undefined) {
          console.log('Backup is array of questionnaires:', data.length);
          allQuestionnaires.push(...data);
        }
        
        // Estrutura 5: verificar se há chaves que contêm questionnaires
        Object.keys(data).forEach(key => {
          if (key.includes('questionnaire') && Array.isArray(data[key])) {
            console.log(`Found questionnaires in ${key}:`, data[key].length);
            allQuestionnaires.push(...data[key]);
          }
          if (key.includes('vote') && Array.isArray(data[key])) {
            console.log(`Found votes in ${key}:`, data[key].length);
            allVotes.push(...data[key]);
          }
        });
      }
    }

    // Filtrar por dimensão se especificada
    if (dimension && dimension !== 'all') {
      allQuestionnaires = allQuestionnaires.filter(q => q.dimension === dimension);
      const questionnaireIds = allQuestionnaires.map(q => q.id);
      allVotes = allVotes.filter(v => questionnaireIds.includes(v.questionnaire_id));
    }

    console.log(`Found ${allQuestionnaires.length} questionnaires and ${allVotes.length} votes`);

    // Extrair textos únicos para análise
    const optionTexts = {
      strengths: new Set<string>(),
      challenges: new Set<string>(),
      opportunities: new Set<string>()
    };

    // Coletar todos os textos das opções
    for (const questionnaire of allQuestionnaires) {
      const splitOptions = (content: string) => {
        if (!content) return [];
        const normalized = content.replace(/\r\n/g, "\n").trim();
        const hasBlankLines = /\n{2,}/.test(normalized);
        const parts = hasBlankLines ? normalized.split(/\n{2,}/) : normalized.split(/\n/);
        return parts.map(p => p.trim()).filter(p => p.length > 0);
      };

      const strengthsOptions = splitOptions(questionnaire.strengths || '');
      const challengesOptions = splitOptions(questionnaire.challenges || '');
      const opportunitiesOptions = splitOptions(questionnaire.opportunities || '');

      strengthsOptions.forEach(text => optionTexts.strengths.add(text));
      challengesOptions.forEach(text => optionTexts.challenges.add(text));
      opportunitiesOptions.forEach(text => optionTexts.opportunities.add(text));
    }

    console.log('Unique texts found:', {
      strengths: optionTexts.strengths.size,
      challenges: optionTexts.challenges.size,
      opportunities: optionTexts.opportunities.size
    });

    // Usar IA para agrupar textos similares
    const groupSimilarTexts = async (texts: string[], category: string) => {
      if (texts.length === 0) return [];
      if (texts.length === 1) return [{ mainText: texts[0], variations: [texts[0]] }];

      console.log(`Grouping ${texts.length} texts for category: ${category}`);

      try {
        const prompt = `
Analise os seguintes textos da categoria "${category}" e agrupe aqueles que têm significado similar ou são variações da mesma ideia. 
Retorne APENAS um JSON válido com a estrutura: [{"mainText": "texto principal representativo", "variations": ["variação1", "variação2"]}]

Textos para analisar:
${texts.map((text, i) => `${i + 1}. ${text}`).join('\n')}

IMPORTANTE: 
- Agrupe textos que tenham o mesmo significado, mesmo com palavras diferentes
- O mainText deve ser o mais representativo do grupo
- Retorne APENAS o JSON, sem texto adicional
- Se um texto não tem similares, ele forma um grupo sozinho`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-5-mini-2025-08-07',
            messages: [
              {
                role: 'system',
                content: 'Você é um especialista em análise de texto que agrupa textos similares. Retorne apenas JSON válido.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_completion_tokens: 2000,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const aiResult = await response.json();
        const content = aiResult.choices[0].message.content.trim();
        
        // Limpar possível markdown
        const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const groupedTexts = JSON.parse(jsonContent);
        
        console.log(`Successfully grouped ${texts.length} texts into ${groupedTexts.length} groups`);
        return groupedTexts;
      } catch (error) {
        console.error(`Error grouping texts for ${category}:`, error);
        // Fallback: retornar textos individuais
        return texts.map(text => ({ mainText: text, variations: [text] }));
      }
    };

    // Agrupar textos por categoria
    const [groupedStrengths, groupedChallenges, groupedOpportunities] = await Promise.all([
      groupSimilarTexts(Array.from(optionTexts.strengths), 'Pontos Fortes'),
      groupSimilarTexts(Array.from(optionTexts.challenges), 'Desafios'),
      groupSimilarTexts(Array.from(optionTexts.opportunities), 'Oportunidades')
    ]);

    // Contar votos para cada grupo
    const countVotesForGroup = (group: any, category: string) => {
      let totalVotes = 0;
      
      for (const variation of group.variations) {
        // Contar votos para esta variação específica
        for (const questionnaire of allQuestionnaires) {
          const splitOptions = (content: string) => {
            if (!content) return [];
            const normalized = content.replace(/\r\n/g, "\n").trim();
            const hasBlankLines = /\n{2,}/.test(normalized);
            const parts = hasBlankLines ? normalized.split(/\n{2,}/) : normalized.split(/\n/);
            return parts.map(p => p.trim()).filter(p => p.length > 0);
          };

          let options: string[] = [];
          if (category === 'strengths') options = splitOptions(questionnaire.strengths || '');
          else if (category === 'challenges') options = splitOptions(questionnaire.challenges || '');
          else if (category === 'opportunities') options = splitOptions(questionnaire.opportunities || '');

          const optionIndex = options.findIndex(opt => opt === variation);
          if (optionIndex !== -1) {
            // Contar votos para esta opção
            const votes = allVotes.filter(vote => 
              vote.questionnaire_id === questionnaire.id &&
              vote.option_type === category &&
              vote.option_number === optionIndex + 1
            );
            totalVotes += votes.length;
          }
        }
      }

      return {
        text: group.mainText,
        votes: totalVotes,
        variations: group.variations
      };
    };

    const analysisResults: VoteAnalysis = {
      dimension: dimension || 'Todas',
      totalVotes: allVotes.length,
      strengths: groupedStrengths.map(group => countVotesForGroup(group, 'strengths')),
      challenges: groupedChallenges.map(group => countVotesForGroup(group, 'challenges')),
      opportunities: groupedOpportunities.map(group => countVotesForGroup(group, 'opportunities')),
      participationRate: 0,
      uniqueVoters: new Set(allVotes.map(v => v.email)).size
    };

    // Ordenar por número de votos (decrescente)
    analysisResults.strengths.sort((a, b) => b.votes - a.votes);
    analysisResults.challenges.sort((a, b) => b.votes - a.votes);
    analysisResults.opportunities.sort((a, b) => b.votes - a.votes);

    // Buscar total de eleitores registrados para calcular taxa de participação
    const { data: voters } = await supabase
      .from('registered_voters')
      .select('email');

    if (voters) {
      analysisResults.participationRate = Math.round((analysisResults.uniqueVoters / voters.length) * 100);
    }

    console.log('Analysis completed:', {
      dimension: analysisResults.dimension,
      totalVotes: analysisResults.totalVotes,
      uniqueVoters: analysisResults.uniqueVoters,
      strengthsGroups: analysisResults.strengths.length,
      challengesGroups: analysisResults.challenges.length,
      opportunitiesGroups: analysisResults.opportunities.length
    });

    return new Response(JSON.stringify(analysisResults), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in intelligent-vote-analysis:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro ao processar análise de votos',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});