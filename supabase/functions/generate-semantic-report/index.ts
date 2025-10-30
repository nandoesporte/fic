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
    const { votingData, dimension } = await req.json() as { votingData: VotingData; dimension?: string };

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Calculate total votes across all categories
    const totalVotes = 
      votingData.strengths.reduce((sum, item) => sum + item.total, 0) +
      votingData.challenges.reduce((sum, item) => sum + item.total, 0) +
      votingData.opportunities.reduce((sum, item) => sum + item.total, 0);

    const dimensionLabel = dimension === 'all' ? 'Todas as Dimensões' : dimension || 'Todas as Dimensões';

    const prompt = `Analise os seguintes itens votados em três categorias e gere um **Relatório Semântico** completo e estruturado.

**PONTOS FORTES** (${votingData.strengths.reduce((s, i) => s + i.total, 0)} votos):
${votingData.strengths.map(item => `- "${item.text}" (${item.total} votos)`).join('\n')}

**DESAFIOS** (${votingData.challenges.reduce((s, i) => s + i.total, 0)} votos):
${votingData.challenges.map(item => `- "${item.text}" (${item.total} votos)`).join('\n')}

**OPORTUNIDADES** (${votingData.opportunities.reduce((s, i) => s + i.total, 0)} votos):
${votingData.opportunities.map(item => `- "${item.text}" (${item.total} votos)`).join('\n')}

Total geral de votos: ${totalVotes}
Total de participantes: ${votingData.totalParticipants}
Dimensão analisada: ${dimensionLabel}

**Sua tarefa:**
1. Para CADA categoria (Pontos Fortes, Desafios, Oportunidades), agrupe os itens em **temas principais** por semelhança semântica
2. Para cada tema, calcule:
   - Total de votos do tema (soma dos itens)
   - Porcentagem sobre o total de votos DA CATEGORIA
3. Ordene os temas por número de votos (decrescente)
4. Para cada tema, liste os itens principais (top 3-5)

**Formato de saída esperado:**

# 🗂 Relatório Semântico – ${dimensionLabel} (${totalVotes} votos totais)

---

## 💪 PONTOS FORTES

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

## 🚧 DESAFIOS

### **1️⃣ [Nome do Tema Principal]** — [X] votos ([Y]%)

*[Resumo executivo do tema em uma frase]*

**Itens destacados:**
• [Item 1] — [votos]
• [Item 2] — [votos]

---

## 🌟 OPORTUNIDADES

### **1️⃣ [Nome do Tema Principal]** — [X] votos ([Y]%)

*[Resumo executivo do tema em uma frase]*

**Itens destacados:**
• [Item 1] — [votos]
• [Item 2] — [votos]

---

### **📊 Resumo Geral**

* **Total de votos considerados:** ${totalVotes}
* **Total de participantes:** ${votingData.totalParticipants}
* **Dimensão:** ${dimensionLabel}
* **Distribuição por categoria:**
  - Pontos Fortes: [X]%
  - Desafios: [Y]%
  - Oportunidades: [Z]%

---

**Instruções:**
- Use linguagem executiva e sintética
- Agrupe semanticamente itens similares dentro de cada categoria
- Calcule porcentagens com precisão
- Mantenha formatação markdown clara
- Ordene por relevância (mais votos primeiro) em cada categoria`;

    console.log('Calling OpenAI API for full semantic report...');

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
            content: 'Você é um analista de dados especializado em criar relatórios executivos semânticos. Agrupe itens por similaridade temática dentro de cada categoria (Pontos Fortes, Desafios, Oportunidades) e apresente insights claros e estruturados para cada uma.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
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
      JSON.stringify({ report, totalVotes, dimension: dimensionLabel }), 
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
