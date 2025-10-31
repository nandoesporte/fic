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

    // Audit: Calculate exact total votes from provided data
    const strengthsTotal = votingData.strengths.reduce((sum, item) => sum + item.total, 0);
    const challengesTotal = votingData.challenges.reduce((sum, item) => sum + item.total, 0);
    const opportunitiesTotal = votingData.opportunities.reduce((sum, item) => sum + item.total, 0);
    const totalVotes = strengthsTotal + challengesTotal + opportunitiesTotal;

    const dimensionLabel = dimension === 'all' ? 'Todas as Dimensões' : dimension || 'Todas as Dimensões';

    // Generate audit information
    const auditInfo = {
      dimension: dimensionLabel,
      strengths: {
        items: votingData.strengths.length,
        votes: strengthsTotal,
        percentage: totalVotes > 0 ? ((strengthsTotal / totalVotes) * 100).toFixed(1) : '0',
      },
      challenges: {
        items: votingData.challenges.length,
        votes: challengesTotal,
        percentage: totalVotes > 0 ? ((challengesTotal / totalVotes) * 100).toFixed(1) : '0',
      },
      opportunities: {
        items: votingData.opportunities.length,
        votes: opportunitiesTotal,
        percentage: totalVotes > 0 ? ((opportunitiesTotal / totalVotes) * 100).toFixed(1) : '0',
      },
      totalVotes,
      totalParticipants: votingData.totalParticipants,
    };

    console.log('📊 Auditoria de Votos:', JSON.stringify(auditInfo, null, 2));

    const prompt = `Analise os seguintes itens votados em três categorias e gere um **Relatório Semântico** completo e estruturado.

**AUDITORIA DE DADOS:**
- Total EXATO de votos: ${totalVotes}
- Pontos Fortes: ${strengthsTotal} votos (${auditInfo.strengths.percentage}%)
- Desafios: ${challengesTotal} votos (${auditInfo.challenges.percentage}%)
- Oportunidades: ${opportunitiesTotal} votos (${auditInfo.opportunities.percentage}%)
- Total de participantes: ${votingData.totalParticipants}
- Dimensão analisada: ${dimensionLabel}

**PONTOS FORTES** (${strengthsTotal} votos - ${auditInfo.strengths.percentage}% do total):
${votingData.strengths.map(item => `- "${item.text}" (${item.total} votos)`).join('\n')}

**DESAFIOS** (${challengesTotal} votos - ${auditInfo.challenges.percentage}% do total):
${votingData.challenges.map(item => `- "${item.text}" (${item.total} votos)`).join('\n')}

**OPORTUNIDADES** (${opportunitiesTotal} votos - ${auditInfo.opportunities.percentage}% do total):
${votingData.opportunities.map(item => `- "${item.text}" (${item.total} votos)`).join('\n')}

**INSTRUÇÕES CRÍTICAS:**
1. Use EXATAMENTE os totais fornecidos na auditoria acima - não recalcule
2. Para CADA categoria (Pontos Fortes, Desafios, Oportunidades), agrupe os itens em **temas principais** por semelhança semântica
3. Para cada tema, calcule:
   - Total de votos do tema (soma dos itens que o compõem)
   - Porcentagem sobre o total de votos DA CATEGORIA (use os totais da auditoria)
4. Ordene os temas por número de votos (decrescente)
5. Para cada tema, liste **TODOS os itens que o compõem** (não apenas top 3-5), incluindo:
   - Texto completo da opção
   - Número exato de votos
   - Percentual do item dentro do tema
6. VALIDE: A soma de todos os votos nos temas de uma categoria deve ser IGUAL ao total da categoria na auditoria
7. TRANSPARÊNCIA TOTAL: Exiba todas as opções, mesmo as com poucos votos, para garantir consistência analítica completa

**Formato de saída esperado:**

# 🗂 Relatório Semântico – ${dimensionLabel} (${totalVotes} votos totais)

---

## 💪 PONTOS FORTES

### **1️⃣ [Nome do Tema Principal]** — [X] votos ([Y]%)

*[Resumo executivo do tema em uma frase]*

**Itens completos:**
• [Item 1] — [votos] ([Z]% do tema)
• [Item 2] — [votos] ([Z]% do tema)
• [Item 3] — [votos] ([Z]% do tema)
• [...todos os demais itens do tema...]

---

### **2️⃣ [Próximo Tema]** — [X] votos ([Y]%)

*[Resumo executivo]*

**Itens completos:**
• [Item 1] — [votos] ([Z]% do tema)
• [Item 2] — [votos] ([Z]% do tema)
• [...todos os demais itens do tema...]

---

## 🚧 DESAFIOS

### **1️⃣ [Nome do Tema Principal]** — [X] votos ([Y]%)

*[Resumo executivo do tema em uma frase]*

**Itens completos:**
• [Item 1] — [votos] ([Z]% do tema)
• [Item 2] — [votos] ([Z]% do tema)
• [...todos os demais itens do tema...]

---

## 🌟 OPORTUNIDADES

### **1️⃣ [Nome do Tema Principal]** — [X] votos ([Y]%)

*[Resumo executivo do tema em uma frase]*

**Itens completos:**
• [Item 1] — [votos] ([Z]% do tema)
• [Item 2] — [votos] ([Z]% do tema)
• [...todos os demais itens do tema...]

---

### **📊 Resumo Geral**

* **Total de votos considerados:** ${totalVotes}
* **Total de participantes:** ${votingData.totalParticipants}
* **Dimensão:** ${dimensionLabel}
* **Distribuição por categoria (USE ESTES VALORES EXATOS):**
  - Pontos Fortes: ${strengthsTotal} votos (${auditInfo.strengths.percentage}%)
  - Desafios: ${challengesTotal} votos (${auditInfo.challenges.percentage}%)
  - Oportunidades: ${opportunitiesTotal} votos (${auditInfo.opportunities.percentage}%)

---

### **✅ Auditoria de Consistência**

Este relatório foi gerado a partir de dados auditados:
* ✓ Total verificado: ${totalVotes} votos
* ✓ Somatório validado: ${strengthsTotal} + ${challengesTotal} + ${opportunitiesTotal} = ${totalVotes}
* ✓ Todos os valores foram recalculados da fonte original

---

**Instruções:**
- Use linguagem executiva e sintética
- Agrupe semanticamente itens similares dentro de cada categoria
- Calcule porcentagens com precisão para cada item dentro do tema
- Liste **TODOS os itens** de cada tema, não apenas destaques
- Mantenha formatação markdown clara
- Ordene por relevância (mais votos primeiro) em cada categoria e dentro de cada tema`;

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
            content: 'Você é um analista de dados especializado em criar relatórios executivos semânticos completos e transparentes. Agrupe itens por similaridade temática dentro de cada categoria (Pontos Fortes, Desafios, Oportunidades) e apresente insights claros e estruturados. CRÍTICO: 1) Use EXATAMENTE os totais de votos fornecidos na auditoria de dados - não recalcule ou arredonde. 2) Liste TODOS os itens de cada tema com seus votos individuais e percentuais, não apenas os destaques. 3) A precisão numérica e transparência completa são essenciais para a integridade do relatório.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 8000,
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
      JSON.stringify({ 
        report, 
        totalVotes, 
        dimension: dimensionLabel,
        audit: auditInfo 
      }), 
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
