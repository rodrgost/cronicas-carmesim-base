/**
 * Context Optimizer
 * 
 * Este módulo otimiza o contexto do jogo antes de enviá-lo ao LLM,
 * removendo dados desnecessários para reduzir tokens e custos.
 * 
 * Para desabilitar a otimização, simplesmente não chame optimizeGameContext
 * e passe o contexto original diretamente ao LLM.
 */

/**
 * Configuração de quais campos manter/remover de cada entidade
 */
const OPTIMIZATION_CONFIG = {
  character: {
    // Campos sempre necessários para o LLM
    keep: [
      'name', 'concept', 'clan',
      'attributes', 'skills',
      'health', 'max_health',
      'willpower', 'max_willpower',
      'humanity', 'hunger', 'blood_potency',
      'disciplines'
    ],
    // Campos que podem ser removidos (metadados internos)
    remove: ['id', 'created_date', 'updated_date', 'created_by', 'user_id', 'world_id']
  },
  
  chronicle: {
    keep: [
      'current_day', 'last_rest_day',
      'active_npcs', 'conversation_mode',
      'world_state', 'narrative_style'
    ],
    remove: ['id', 'conversation_id', 'created_date', 'updated_date', 'user_id', 'character_id', 'world_id', 'shared_id', 'is_public', 'story_log']
  },
  
  world: {
    keep: ['name', 'generated_details'],
    remove: ['id', 'player_description', 'user_id', 'created_date', 'updated_date']
  },
  
  npc: {
    keep: [
      'name', 'clan', 'role',
      'personality', 'appearance', 'motivations',
      'relationship_to_player', 'trust_level',
      'current_mood'
    ],
    remove: ['id', 'created_date', 'updated_date', 'created_by', 'world_id', 'chronicle_id', 'is_active', 'conversation_history', 'secrets', 'knowledge']
  }
};

/**
 * Remove campos desnecessários de um objeto baseado na configuração
 */
function filterFields(obj, config) {
  if (!obj) return null;
  
  const filtered = {};
  
  // Se tem lista 'keep', pega só esses campos
  if (config.keep && config.keep.length > 0) {
    config.keep.forEach(field => {
      if (obj.hasOwnProperty(field)) {
        filtered[field] = obj[field];
      }
    });
  } else {
    // Se não tem 'keep', copia tudo e remove os campos da lista 'remove'
    Object.keys(obj).forEach(key => {
      if (!config.remove || !config.remove.includes(key)) {
        filtered[key] = obj[key];
      }
    });
  }
  
  return filtered;
}

/**
 * Otimiza a lista de NPCs, mantendo apenas NPCs ativos na cena
 */
function optimizeNPCs(npcs, chronicle, currentNPCId) {
  if (!npcs || npcs.length === 0) return [];
  
  // Se estiver falando com um NPC específico, inclui apenas ele
  if (currentNPCId) {
    const currentNPC = npcs.find(n => n.id === currentNPCId);
    return currentNPC ? [filterFields(currentNPC, OPTIMIZATION_CONFIG.npc)] : [];
  }
  
  // Se não, inclui apenas NPCs ativos na cena atual
  const activeNPCIds = chronicle?.active_npcs || [];
  
  // Limita a 10 NPCs mais relevantes para evitar sobrecarga
  const relevantNPCs = npcs
    .filter(n => activeNPCIds.includes(n.id))
    .slice(0, 10)
    .map(npc => filterFields(npc, OPTIMIZATION_CONFIG.npc));
  
  return relevantNPCs;
}

/**
 * Função principal: otimiza o contexto do jogo completo
 */
export function optimizeGameContext(gameContext) {
  const { character, chronicle, world, npcs, currentNPCId, conversationMode } = gameContext;
  
  const optimized = {
    character: filterFields(character, OPTIMIZATION_CONFIG.character),
    chronicle: filterFields(chronicle, OPTIMIZATION_CONFIG.chronicle),
    world: filterFields(world, OPTIMIZATION_CONFIG.world),
    npcs: optimizeNPCs(npcs, chronicle, currentNPCId),
    conversationMode: conversationMode,
    currentNPCId: currentNPCId
  };
  
  return optimized;
}

/**
 * Função para desabilitar otimização (útil para debug)
 * Retorna o contexto original sem modificações
 */
export function passthroughContext(gameContext) {
  return gameContext;
}

/**
 * Estatísticas de otimização (útil para monitoramento)
 */
export function getOptimizationStats(originalContext, optimizedContext) {
  const originalSize = JSON.stringify(originalContext).length;
  const optimizedSize = JSON.stringify(optimizedContext).length;
  const reduction = ((1 - optimizedSize / originalSize) * 100).toFixed(2);
  
  return {
    originalSize,
    optimizedSize,
    reduction: `${reduction}%`,
    npcsReduced: originalContext.npcs?.length - optimizedContext.npcs?.length
  };
}