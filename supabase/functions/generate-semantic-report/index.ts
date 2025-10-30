import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  totalParticipants: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { votingData, category } = await req.json() as { votingData: VotingData; category: 'strengths' | 'challenges' | 'opportunities' };

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const categoryData = votingData[category];
    const totalVotes = categoryData.reduce((sum, item) => sum + item.total, 0);

    const categoryTitles = {
      strengths: 'Pontos Fortes',
      challenges: 'Desafios',
      opportunities: 'Oportunidades'
    };

    const prompt = `Analise os seguintes itens votados e gere um **Relatório Semântico** completo e estruturado.

Dados recebidos:
${categoryData.map(item => `- "${item.text}" (${item.total} votos)`).join('\n')}

Total de votos: ${totalVotes}
Total de participantes: ${votingData.totalParticipants}

**Sua tarefa:**
1. Agrupe os itens em **temas principais** por semelhança semântica
2. Para cada tema, calcule:
   - Total de votos do tema (soma dos itens)
   - Porcentagem sobre o total de votos
3. Ordene os temas por número de votos (decrescente)
4. Para cada tema, liste os itens principais (top 3-5)

**Formato de saída esperado:**

# 🗂 Relatório Semântico – ${categoryTitles[category]} (${totalVotes} votos)

---

### **1️⃣ [Nome do Tema Principal]** — [X] votos ([Y]%)

*[Resumo executivo do tema em uma frase]*

**Itens destacados:**
• [Item 1] — [votos]
• [Item 2] — [votos]
• [Item 3] — [votos]

---

### **2️⃣ [Próximo Tema]** — [X] votos ([Y]%)

*[Resumo executivo]*

**Itens destacados:**
• [Item 1] — [votos]
• [Item 2] — [votos]

---

(Continue para todos os temas identificados)

---

### **📊 Resumo Geral**

* **Total de votos considerados:** ${totalVotes}
* **Total de participantes:** ${votingData.totalParticipants}
* **Principais temas:**
  1. [Tema 1] — [X]%
  2. [Tema 2] — [Y]%
  3. [Tema 3] — [Z]%
  (... até cobrir pelo menos 80% dos votos)

---

**Instruções:**
- Use linguagem executiva e sintética
- Agrupe semanticamente itens similares
- Calcule porcentagens com precisão
- Mantenha formatação markdown clara
- Ordene por relevância (mais votos primeiro)`;

    console.log('Calling OpenAI API...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'Você é um analista de dados especializado em criar relatórios executivos semânticos. Agrupe itens por similaridade temática e apresente insights claros e estruturados.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const report = data.choices[0].message.content;

    console.log('Report generated successfully');

    return new Response(
      JSON.stringify({ report, totalVotes, category: categoryTitles[category] }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-semantic-report:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
