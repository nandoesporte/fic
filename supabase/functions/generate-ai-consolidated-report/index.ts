import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  topDimensions: { dimension: string; count: number }[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dimension, startDate, endDate } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Buscando backups...');
    
    // Buscar backups com filtro de data se fornecido
    let query = supabase
      .from('data_backups')
      .select('*')
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      query = query.lte('created_at', endDateTime.toISOString());
    }

    const { data: backups, error } = await query;

    if (error) throw error;

    console.log(`Processando ${backups?.length || 0} backups`);

    // Extrair todos os dados dos backups
    const allVotes: {[key: string]: { text: string; voter: string }[]} = {
      strengths: [],
      challenges: [],
      opportunities: []
    };

    const uniqueVoters = new Set<string>();
    const dimensionCounts: {[key: string]: number} = {};

    for (const backup of backups || []) {
      try {
        const data = backup.data as any;
        
        let questionnaires: any[] = [];
        let votes: any[] = [];

        // Extrair dados considerando diferentes estruturas
        if (data.questionnaires) questionnaires = data.questionnaires;
        if (data.votes) votes = data.votes;
        if (data.exportData?.questionnaires) questionnaires = [...questionnaires, ...data.exportData.questionnaires];
        if (data.exportData?.votes) votes = [...votes, ...data.exportData.votes];
        if (data.tables?.fic_questionnaires) questionnaires = [...questionnaires, ...data.tables.fic_questionnaires];
        if (data.tables?.questionnaire_votes) votes = [...votes, ...data.tables.questionnaire_votes];

        // Filtrar por dimensão se especificada
        if (dimension && dimension !== 'all') {
          questionnaires = questionnaires.filter(q => q.dimension === dimension);
        }

        // Contar dimensões
        questionnaires.forEach(q => {
          if (q.dimension) {
            dimensionCounts[q.dimension] = (dimensionCounts[q.dimension] || 0) + 1;
          }
        });

        // Processar questionários para extrair todas as opções
        for (const questionnaire of questionnaires) {
          const splitOptions = (content: string) => {
            if (!content) return [];
            const normalized = content.replace(/\r\n/g, "\n").trim();
            const hasBlankLines = /\n{2,}/.test(normalized);
            const parts = hasBlankLines ? normalized.split(/\n{2,}/) : normalized.split(/\n/);
            return parts.map(p => p.trim()).filter(p => p.length > 0);
          };

          // Adicionar todas as opções de cada categoria
          if (questionnaire.strengths) {
            const options = splitOptions(questionnaire.strengths);
            options.forEach(opt => {
              allVotes.strengths.push({ text: opt, voter: questionnaire.group || 'unknown' });
            });
          }

          if (questionnaire.challenges) {
            const options = splitOptions(questionnaire.challenges);
            options.forEach(opt => {
              allVotes.challenges.push({ text: opt, voter: questionnaire.group || 'unknown' });
            });
          }

          if (questionnaire.opportunities) {
            const options = splitOptions(questionnaire.opportunities);
            options.forEach(opt => {
              allVotes.opportunities.push({ text: opt, voter: questionnaire.group || 'unknown' });
            });
          }

          if (questionnaire.group) {
            uniqueVoters.add(questionnaire.group);
          }
        }
      } catch (error) {
        console.error('Erro processando backup:', error);
      }
    }

    const totalVotes = allVotes.strengths.length + allVotes.challenges.length + allVotes.opportunities.length;

    console.log(`Total de votos extraídos: ${totalVotes} de ${uniqueVoters.size} votantes únicos`);

    // Função para agrupar textos similares usando IA
    const groupAndAnalyzeTexts = async (texts: { text: string; voter: string }[], category: string): Promise<VoteGroup[]> => {
      if (texts.length === 0) return [];

      const uniqueTexts = [...new Set(texts.map(t => t.text))];
      const categoryTotal = texts.length; // Total de votos da categoria específica
      
      const prompt = `
Você é um especialista em análise de dados qualitativos de cooperativas. Analise as seguintes respostas da categoria "${category}" e:

1. Agrupe respostas que expressem a MESMA IDEIA, OBJETIVO ou PROPOSTA, mesmo escritas de formas diferentes
2. Considere sinônimos, variações linguísticas e erros de digitação
3. Priorize o SENTIDO e a INTENÇÃO das respostas, não apenas palavras idênticas
4. Para cada grupo, sugira um título representativo e claro

Respostas para agrupar:
${uniqueTexts.map((text, i) => `${i + 1}. ${text}`).join('\n')}

Responda APENAS com um JSON válido no formato:
[
  {
    "groupName": "Título representativo do grupo",
    "originalTexts": ["texto1", "texto2", ...]
  }
]

IMPORTANTE:
- Agrupe apenas textos que realmente expressam a mesma ideia/objetivo
- O groupName deve ser descritivo e estratégico
- Seja preciso na análise semântica`;

      try {
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
                content: 'Você é um especialista em análise qualitativa de dados de cooperativas. Agrupe textos por similaridade semântica e intenção, considerando variações linguísticas.' 
              },
              { role: 'user', content: prompt }
            ],
            max_completion_tokens: 3000
          }),
        });

        if (!response.ok) {
          console.error('Erro na API OpenAI:', response.status);
          throw new Error('Erro na API OpenAI');
        }

        const data = await response.json();
        const content = data.choices[0].message.content.trim();
        const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const groups = JSON.parse(jsonContent);

        return groups.map((group: any) => {
          // Conta quantos votos originais estão neste grupo
          const voteCount = group.originalTexts.reduce((sum: number, text: string) => 
            sum + texts.filter(t => t.text === text).length, 0);
          
          return {
            groupName: group.groupName,
            originalTexts: group.originalTexts,
            votes: voteCount,
            percentage: categoryTotal > 0 ? (voteCount / categoryTotal) * 100 : 0
          };
        });

      } catch (error) {
        console.error('Erro no agrupamento IA:', error);
        // Fallback: agrupar por texto exato
        return uniqueTexts.map(text => ({
          groupName: text,
          originalTexts: [text],
          votes: texts.filter(t => t.text === text).length,
          percentage: categoryTotal > 0 ? (texts.filter(t => t.text === text).length / categoryTotal) * 100 : 0
        }));
      }
    };

    console.log('Agrupando respostas com IA...');
    
    // Agrupar por categoria
    const [strengthGroups, challengeGroups, opportunityGroups] = await Promise.all([
      groupAndAnalyzeTexts(allVotes.strengths, 'Pontos Fortes'),
      groupAndAnalyzeTexts(allVotes.challenges, 'Desafios'),
      groupAndAnalyzeTexts(allVotes.opportunities, 'Oportunidades')
    ]);

    console.log('Gerando resumo e insights com IA...');

    // Gerar resumo textual e insights com IA
    const generateSummaryAndInsights = async (): Promise<{ summary: string; insights: string[]; keywords: string[] }> => {
      const summaryPrompt = `
Você é um consultor estratégico de cooperativas. Analise os dados consolidados abaixo e gere:

1. Um RESUMO EXECUTIVO conciso (2-3 parágrafos) destacando os principais temas emergentes
2. INSIGHTS QUALITATIVOS (5-7 itens) com recomendações estratégicas
3. PALAVRAS-CHAVE mais recorrentes (10-15 tags)

DADOS CONSOLIDADOS:

**Pontos Fortes (${strengthGroups.length} grupos):**
${strengthGroups.slice(0, 10).map(g => `- ${g.groupName} (${g.votes} votos, ${g.percentage.toFixed(1)}%)`).join('\n')}

**Desafios (${challengeGroups.length} grupos):**
${challengeGroups.slice(0, 10).map(g => `- ${g.groupName} (${g.votes} votos, ${g.percentage.toFixed(1)}%)`).join('\n')}

**Oportunidades (${opportunityGroups.length} grupos):**
${opportunityGroups.slice(0, 10).map(g => `- ${g.groupName} (${g.votes} votos, ${g.percentage.toFixed(1)}%)`).join('\n')}

Responda APENAS com um JSON válido no formato:
{
  "summary": "Resumo executivo aqui...",
  "insights": ["Insight 1", "Insight 2", ...],
  "keywords": ["palavra1", "palavra2", ...]
}

IMPORTANTE: Os insights devem enfatizar padrões, prioridades e recomendações para decisões estratégicas da cooperativa.`;

      try {
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
                content: 'Você é um consultor estratégico especializado em análise de dados de cooperativas. Gere insights práticos e acionáveis.' 
              },
              { role: 'user', content: summaryPrompt }
            ],
            max_completion_tokens: 2000
          }),
        });

        if (!response.ok) {
          throw new Error('Erro na API OpenAI');
        }

        const data = await response.json();
        const content = data.choices[0].message.content.trim();
        const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const result = JSON.parse(jsonContent);

        return {
          summary: result.summary || 'Resumo não disponível',
          insights: result.insights || [],
          keywords: result.keywords || []
        };

      } catch (error) {
        console.error('Erro ao gerar resumo e insights:', error);
        return {
          summary: 'Resumo não disponível devido a erro no processamento.',
          insights: ['Análise manual recomendada devido a erro no processamento automático.'],
          keywords: []
        };
      }
    };

    const { summary, insights, keywords } = await generateSummaryAndInsights();

    // Preparar dimensões mais mencionadas
    const topDimensions = Object.entries(dimensionCounts)
      .map(([dim, count]) => ({ dimension: dim, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const report: ConsolidatedReport = {
      dimension: dimension && dimension !== 'all' ? dimension : 'Todas as Dimensões',
      totalVotes,
      uniqueVoters: uniqueVoters.size,
      strengths: strengthGroups.sort((a, b) => b.votes - a.votes),
      challenges: challengeGroups.sort((a, b) => b.votes - a.votes),
      opportunities: opportunityGroups.sort((a, b) => b.votes - a.votes),
      summary,
      insights,
      keywords,
      topDimensions
    };

    console.log('Relatório consolidado gerado:', {
      dimension: report.dimension,
      totalVotes: report.totalVotes,
      uniqueVoters: report.uniqueVoters,
      strengthsGroups: report.strengths.length,
      challengesGroups: report.challenges.length,
      opportunitiesGroups: report.opportunities.length,
      insightsCount: report.insights.length,
      keywordsCount: report.keywords.length
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
