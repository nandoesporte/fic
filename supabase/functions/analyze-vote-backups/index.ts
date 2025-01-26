import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { dimension } = await req.json();

    // Fetch backups for analysis
    const { data: backups, error: backupsError } = await supabase
      .from('data_backups')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (backupsError) throw backupsError;

    // Extract votes data from backups
    const votesData = backups.map(backup => backup.data).flat();
    
    // Filter votes for the specific dimension
    const dimensionVotes = votesData.filter((vote: any) => vote.dimension === dimension);

    // Prepare data for analysis
    const analysisData = {
      strengths: dimensionVotes.map((v: any) => v.strengths?.split('\n\n')).flat().filter(Boolean),
      challenges: dimensionVotes.map((v: any) => v.challenges?.split('\n\n')).flat().filter(Boolean),
      opportunities: dimensionVotes.map((v: any) => v.opportunities?.split('\n\n')).flat().filter(Boolean),
    };

    // Generate AI analysis using OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é um analista especializado em desenvolvimento organizacional e planejamento estratégico. Analise os padrões de votação e forneça insights em português do Brasil.'
          },
          {
            role: 'user',
            content: `Analise os seguintes dados de votação para a dimensão "${dimension}":
              
              Pontos Fortes:
              ${analysisData.strengths.join('\n')}
              
              Desafios:
              ${analysisData.challenges.join('\n')}
              
              Oportunidades:
              ${analysisData.opportunities.join('\n')}
              
              Por favor, forneça:
              1. Padrões de similaridade entre os votos
              2. Resumo quantitativo
              3. Principais insights para cada categoria
              4. Recomendações baseadas nos padrões identificados`
          }
        ],
      }),
    });

    const aiResponse = await response.json();
    
    // Store the analysis report
    const { error: reportError } = await supabase
      .from('fic_reports')
      .insert({
        title: `Relatório de Análise IA - ${dimension}`,
        description: aiResponse.choices[0].message.content,
        dimension: dimension,
        start_date: backups[backups.length - 1]?.created_at,
        end_date: backups[0]?.created_at,
        metrics: {
          total_votos: dimensionVotes.length,
          pontos_fortes: analysisData.strengths.length,
          desafios: analysisData.challenges.length,
          oportunidades: analysisData.opportunities.length,
        }
      });

    if (reportError) throw reportError;

    return new Response(
      JSON.stringify({
        analysis: aiResponse.choices[0].message.content,
        metrics: {
          total_votos: dimensionVotes.length,
          pontos_fortes: analysisData.strengths.length,
          desafios: analysisData.challenges.length,
          oportunidades: analysisData.opportunities.length,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});