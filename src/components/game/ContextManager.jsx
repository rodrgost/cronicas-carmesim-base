import { base44 } from "@/api/base44Client";

/**
 * ContextManager - Sistema de Memória Hierárquica (RAG Simulado)
 * 
 * Gerencia a recuperação de contexto relevante para a narrativa.
 * Utiliza uma abordagem de dois estágios:
 * 1. Indexação Leve: Busca metadados de todos os fragmentos disponíveis.
 * 2. Seleção Semântica: Usa um LLM rápido para decidir quais fragmentos são relevantes para a ação.
 * 3. Injeção de Contexto: Carrega apenas o conteúdo completo dos fragmentos selecionados.
 */

/**
 * Recupera o contexto mais relevante para a ação atual do jogador
 * @param {string} action - A ação ou fala do jogador
 * @param {string} worldId - ID do mundo atual
 * @param {object} gameState - Estado atual (opcional, para contexto extra)
 */
export async function retrieveRelevantContext(action, worldId, gameState = {}) {
  console.log("📚 [ContextManager] Iniciando recuperação de contexto para:", action);

  try {
    // 1. Buscar Metadados (Indexação Leve)
    // Buscamos apenas campos leves para não sobrecarregar a memória
    // Nota: Em um sistema real com vetor DB, isso seria uma busca por similaridade.
    // Aqui, trazemos os títulos/tags e deixamos o LLM filtrar.
    const allFragments = await base44.entities.LoreFragment.list();
    const worldFragments = allFragments.filter(f => 
      f.world_id === worldId && 
      f.is_active !== false
    );

    if (worldFragments.length === 0) {
      console.log("📚 [ContextManager] Nenhum fragmento de lore encontrado.");
      return null;
    }

    // Preparar índice para o LLM Seletor
    const fragmentIndex = worldFragments.map(f => ({
      id: f.id,
      title: f.title,
      category: f.category,
      tags: f.tags || []
    }));

    // 2. Seleção Semântica (O "Cérebro" da Busca)
    // Pede ao LLM para identificar quais tópicos são relevantes para a ação
    const selectionPrompt = `
Você é um sistema de recuperação de memória para um RPG.
AÇÃO DO JOGADOR: "${action}"
LOCAL ATUAL: "${gameState.currentLocationName || 'Desconhecido'}"

ABAIXO ESTÁ O ÍNDICE DE CONHECIMENTO DISPONÍVEL:
${JSON.stringify(fragmentIndex, null, 2)}

TAREFA:
Retorne um JSON contendo um array "relevantIds" com os IDs dos fragmentos que são CRITICAMENTE RELEVANTES para processar a ação do jogador ou enriquecer a narrativa atual.
Se nada for relevante, retorne array vazio. Selecione no máximo 3-5 itens mais importantes.

RESPOSTA (JSON PURO):
`;

    const selectionResponse = await base44.integrations.Core.InvokeLLM({
      prompt: selectionPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          relevantIds: { type: "array", items: { type: "string" } }
        }
      }
    });

    const relevantIds = selectionResponse.relevantIds || [];
    console.log("📚 [ContextManager] Fragmentos selecionados:", relevantIds);

    if (relevantIds.length === 0) {
      return null;
    }

    // 3. Carregamento de Conteúdo (Retrieval)
    const selectedFragments = worldFragments.filter(f => relevantIds.includes(f.id));
    
    // Formata o contexto para injeção no prompt principal
    const contextString = selectedFragments.map(f => `
--- CONTEXTO: ${f.category.toUpperCase()} - ${f.title} ---
${f.content}
-------------------------------------------
`).join("\n");

    return contextString;

  } catch (error) {
    console.error("❌ [ContextManager] Erro ao recuperar contexto:", error);
    return null; // Falha graciosa, segue sem contexto extra
  }
}

/**
 * Cria um novo fragmento de memória automaticamente
 * Útil para quando o narrador inventa algo novo importante
 */
export async function memorizeNewFact(title, content, category, worldId, tags = []) {
  try {
    await base44.entities.LoreFragment.create({
      title,
      content,
      category,
      world_id: worldId,
      tags,
      is_active: true
    });
    console.log("💾 [ContextManager] Novo fato memorizado:", title);
  } catch (error) {
    console.error("❌ [ContextManager] Erro ao memorizar fato:", error);
  }
}

/**
 * Otimiza o contexto recuperado se ele for muito grande
 * (Implementação simples de truncamento por enquanto)
 */
export function optimizeRetrievedContext(contextString, maxLength = 2000) {
  if (!contextString) return "";
  if (contextString.length <= maxLength) return contextString;
  return contextString.substring(0, maxLength) + "... [contexto truncado]";
}