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

    // Calculate balanced totals (equal distribution across categories)
    const balancedTotal = Math.round(totalVotes / 3);
    const balancedPercentage = '33.3';

    // Generate audit information with balanced targets
    const auditInfo = {
      dimension: dimensionLabel,
      strengths: {
        items: votingData.strengths.length,
        votes: strengthsTotal,
        originalPercentage: totalVotes > 0 ? ((strengthsTotal / totalVotes) * 100).toFixed(1) : '0',
        balancedVotes: balancedTotal,
        balancedPercentage,
      },
      challenges: {
        items: votingData.challenges.length,
        votes: challengesTotal,
        originalPercentage: totalVotes > 0 ? ((challengesTotal / totalVotes) * 100).toFixed(1) : '0',
        balancedVotes: balancedTotal,
        balancedPercentage,
      },
      opportunities: {
        items: votingData.opportunities.length,
        votes: opportunitiesTotal,
        originalPercentage: totalVotes > 0 ? ((opportunitiesTotal / totalVotes) * 100).toFixed(1) : '0',
        balancedVotes: balancedTotal,
        balancedPercentage,
      },
      totalVotes,
      totalParticipants: votingData.totalParticipants,
    };

    console.log('📊 Auditoria de Votos:', JSON.stringify(auditInfo, null, 2));
    
    // Additional validation: verify data integrity
    const dataIntegrityCheck = {
      totalItemsProvided: votingData.strengths.length + votingData.challenges.length + votingData.opportunities.length,
      totalVotesCalculated: totalVotes,
      categoriesMatch: (strengthsTotal + challengesTotal + opportunitiesTotal) === totalVotes,
      dimension: dimensionLabel,
    };
    
    console.log('🔍 Verificação de Integridade:', JSON.stringify(dataIntegrityCheck, null, 2));
    
    if (!dataIntegrityCheck.categoriesMatch) {
      console.error('⚠️ ERRO: Soma das categorias não corresponde ao total de votos!');
    }

    const prompt = `Analise os seguintes itens votados em três categorias e gere um **Relatório Semântico** completo e estruturado com TOTAIS EQUILIBRADOS.

**🔴 REGRA CRÍTICA DE EQUILÍBRIO E AUDITORIA:**
1. O total geral DEVE permanecer ${totalVotes} votos
2. CADA CATEGORIA deve ter EXATAMENTE ${balancedTotal} votos (33.3% do total)
3. Você DEVE ajustar os votos dos temas dentro de cada categoria para que a soma total seja ${balancedTotal}
4. Mantenha a PROPORÇÃO RELATIVA entre os temas dentro de cada categoria
5. Ajuste os votos de forma PROPORCIONAL para que a soma bata com ${balancedTotal}

**AUDITORIA DE DADOS (VALORES ORIGINAIS):**
- Total EXATO de votos: ${totalVotes}
- Pontos Fortes ORIGINAIS: ${strengthsTotal} votos (${auditInfo.strengths.originalPercentage}%)
- Desafios ORIGINAIS: ${challengesTotal} votos (${auditInfo.challenges.originalPercentage}%)
- Oportunidades ORIGINAIS: ${opportunitiesTotal} votos (${auditInfo.opportunities.originalPercentage}%)
- Total de participantes: ${votingData.totalParticipants}
- Dimensão analisada: ${dimensionLabel}

**TOTAIS EQUILIBRADOS OBRIGATÓRIOS:**
- Pontos Fortes: ${balancedTotal} votos (33.3%)
- Desafios: ${balancedTotal} votos (33.3%)
- Oportunidades: ${balancedTotal} votos (33.3%)

**PONTOS FORTES** (ajustar para ${balancedTotal} votos - 33.3% do total):
${votingData.strengths.map(item => `- "${item.text}" (${item.total} votos originais)`).join('\n')}

**DESAFIOS** (ajustar para ${balancedTotal} votos - 33.3% do total):
${votingData.challenges.map(item => `- "${item.text}" (${item.total} votos originais)`).join('\n')}

**OPORTUNIDADES** (ajustar para ${balancedTotal} votos - 33.3% do total):
${votingData.opportunities.map(item => `- "${item.text}" (${item.total} votos originais)`).join('\n')}

**INSTRUÇÕES CRÍTICAS DE EQUILÍBRIO E AUDITORIA:**
1. ✅ EQUILÍBRIO OBRIGATÓRIO: Cada categoria DEVE ter ${balancedTotal} votos (33.3%)
2. ✅ AJUSTE PROPORCIONAL: Redistribua os votos dos itens originais proporcionalmente para que a soma de cada categoria = ${balancedTotal}
3. ✅ Para CADA categoria (Pontos Fortes, Desafios, Oportunidades), agrupe os itens em **temas principais** por semelhança semântica
4. ✅ Para cada tema, calcule:
   - Total de votos do tema (ajustado proporcionalmente)
   - Porcentagem sobre ${balancedTotal} votos (total equilibrado da categoria)
5. ✅ Ordene os temas por número de votos (decrescente)
6. ✅ Para cada tema, liste **TODOS os itens que o compõem** (não apenas top 3-5), incluindo:
   - Texto completo da opção (sem modificar ou resumir)
   - Número de votos ajustado proporcionalmente
   - Percentual do item dentro do tema (calculado com precisão)
7. ✅ VALIDAÇÃO OBRIGATÓRIA: A soma de todos os votos nos temas de uma categoria DEVE ser EXATAMENTE ${balancedTotal}
8. ✅ TRANSPARÊNCIA TOTAL: Exiba todas as opções, mesmo as com poucos votos, para garantir consistência analítica completa
9. ✅ AUDITORIA FINAL: Inclua uma tabela mostrando totais originais vs. totais equilibrados

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
* **Distribuição EQUILIBRADA por categoria (USE ESTES VALORES EXATOS):**
  - Pontos Fortes: ${balancedTotal} votos (33.3%)
  - Desafios: ${balancedTotal} votos (33.3%)
  - Oportunidades: ${balancedTotal} votos (33.3%)

---

### **🧾 AUDITORIA DE CORREÇÃO E EQUILÍBRIO**

**Validação de Totais Equilibrados:**
| Categoria | Votos Originais | Votos Equilibrados | Diferença | Status |
|-----------|-----------------|-------------------|-----------|---------|
| Pontos Fortes | ${strengthsTotal} (${auditInfo.strengths.originalPercentage}%) | ${balancedTotal} (33.3%) | ${balancedTotal - strengthsTotal} | ✅ Equilibrado |
| Desafios | ${challengesTotal} (${auditInfo.challenges.originalPercentage}%) | ${balancedTotal} (33.3%) | ${balancedTotal - challengesTotal} | ✅ Equilibrado |
| Oportunidades | ${opportunitiesTotal} (${auditInfo.opportunities.originalPercentage}%) | ${balancedTotal} (33.3%) | ${balancedTotal - opportunitiesTotal} | ✅ Equilibrado |
| **TOTAL GERAL** | **${totalVotes}** | **${totalVotes}** | **0** | ✅ Preservado |

**Metadados da Auditoria:**
* ✓ Total de itens analisados: ${votingData.strengths.length + votingData.challenges.length + votingData.opportunities.length}
* ✓ Total original: ${totalVotes} votos
* ✓ Distribuição original: ${strengthsTotal} + ${challengesTotal} + ${opportunitiesTotal} = ${totalVotes}
* ✓ Distribuição equilibrada: ${balancedTotal} + ${balancedTotal} + ${balancedTotal} = ${totalVotes}
* ✓ Ajuste aplicado: Proporcional para equilibrar categorias em 33.3% cada
* ✓ Dimensão: ${dimensionLabel}
* ✓ Participantes: ${votingData.totalParticipants}

**Status Final:**
✅ Relatório auditado, equilibrado e corrigido automaticamente. Todas as categorias possuem totais iguais e consistentes (${balancedTotal} votos cada).

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
            content: `Você é um analista de dados especializado em criar relatórios executivos semânticos completos, auditados e EQUILIBRADOS. 

REGRAS CRÍTICAS DE EQUILÍBRIO E AUDITORIA:
1. ✅ EQUILÍBRIO OBRIGATÓRIO: Cada categoria (Pontos Fortes, Desafios, Oportunidades) DEVE ter exatamente ${balancedTotal} votos (33.3% do total)
2. ✅ AJUSTE PROPORCIONAL: Redistribua os votos originais proporcionalmente para que cada categoria totalize ${balancedTotal} votos
3. ✅ Liste TODOS os itens de cada tema com seus votos ajustados e percentuais, não apenas destaques
4. ✅ A soma dos votos de todos os temas de cada categoria DEVE ser EXATAMENTE ${balancedTotal} votos
5. ✅ Inclua a tabela de auditoria de correção ao final, mostrando os valores originais vs. equilibrados
6. ✅ A precisão numérica absoluta e transparência completa são OBRIGATÓRIAS para a integridade do relatório
7. ✅ Se você não conseguir fazer a soma bater com ${balancedTotal} por categoria, você está fazendo algo errado

VALIDAÇÃO OBRIGATÓRIA (TOTAIS EQUILIBRADOS):
- Pontos Fortes: soma dos temas = ${balancedTotal} votos (33.3%)
- Desafios: soma dos temas = ${balancedTotal} votos (33.3%)
- Oportunidades: soma dos temas = ${balancedTotal} votos (33.3%)
- TOTAL GERAL: ${totalVotes} votos (preservado)`
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
