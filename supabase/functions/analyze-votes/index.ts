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

    // Fetch votes for the specified dimension
    const { data: votes, error: votesError } = await supabase
      .from('questionnaire_votes')
      .select(`
        *,
        fic_questionnaires (
          dimension,
          strengths,
          challenges,
          opportunities
        )
      `)
      .eq('fic_questionnaires.dimension', dimension);

    if (votesError) throw votesError;

    // Prepare data for analysis
    const votesSummary = votes.reduce((acc: any, vote) => {
      const type = vote.option_type;
      const number = vote.option_number;
      const key = `${type}_${number}`;
      
      if (!acc[key]) {
        acc[key] = {
          type,
          number,
          votes: 0,
          text: vote.fic_questionnaires[type]?.split('\n\n')[number - 1] || ''
        };
      }
      
      acc[key].votes++;
      return acc;
    }, {});

    // Prepare prompt for GPT
    const prompt = `Analyze the following voting data for the dimension "${dimension}":

${Object.values(votesSummary).map((item: any) => 
  `${item.type.toUpperCase()}: "${item.text}" - ${item.votes} votes`
).join('\n')}

Please provide a detailed analysis including:
1. Most voted items in each category (strengths, challenges, opportunities)
2. Key patterns or trends
3. Actionable recommendations based on the voting patterns
4. Overall sentiment analysis

Format the response in clear sections with headers.`;

    // Get AI analysis
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert analyst specializing in organizational development and strategic planning.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    const aiResponse = await response.json();
    
    return new Response(JSON.stringify({
      analysis: aiResponse.choices[0].message.content,
      votingSummary: Object.values(votesSummary)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});