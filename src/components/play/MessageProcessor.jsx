/**
 * MessageProcessor - Centraliza processamento de mensagens do chat
 * 
 * Garante que todas as mensagens sejam processadas de forma consistente,
 * com parsedContent anexado e na ordem correta.
 */

/**
 * Processa uma mensagem individual
 */
export function processMessage(message) {
  // Mensagens já processadas (com parsedContent) - retornar como está
  if (message.parsedContent) {
    return message;
  }

  const role = message.role;

  // USER MESSAGE
  if (role === "user") {
    // Tentar extrair playerAction do JSON
    try {
      const parsed = JSON.parse(message.content);
      
      // Se for JSON sem playerAction, é mensagem de sistema
      if (!parsed.playerAction) {
        return { ...message, parsedContent: null, isSystemMessage: true };
      }
      
      return { ...message, parsedContent: { playerAction: parsed.playerAction } };
    } catch (e) {
      // Não é JSON - mensagem de texto normal
      return { ...message, parsedContent: { playerAction: message.content } };
    }
  }
  
  // ASSISTANT MESSAGE
  if (role === "assistant") {
    let parsed = null;
    
    try {
      // 1. Tenta parse direto
      parsed = JSON.parse(message.content);
    } catch (e) {
      // 2. Tenta extrair JSON de blocos de código ou misturado no texto
      try {
        const content = message.content || "";
        
        // Regex para encontrar JSON object { ... }
        // Procura pelo primeiro { e vai até o último }
        const firstOpen = content.indexOf('{');
        const lastClose = content.lastIndexOf('}');
        
        if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
          const potentialJson = content.substring(firstOpen, lastClose + 1);
          parsed = JSON.parse(potentialJson);
        }
      } catch (innerE) {
        console.warn("Failed to extract JSON from assistant message:", innerE);
      }
    }

    if (parsed) {
      // Garantir que há conteúdo narrativo
      if (!parsed.storyEvent && !parsed.npcDialogue) {
        // Se não há narrativa mas há outras coisas, adicionar narrativa genérica
        if (parsed.outcomes || parsed.statUpdates || parsed.newNPCs || parsed.worldEvent || parsed.timePassage) {
          parsed.storyEvent = "Os eventos se desenrolam...";
        } else {
          // Mensagem sem conteúdo relevante - marcar como sistema
          return { ...message, parsedContent: null, isSystemMessage: true };
        }
      }
      
      return { ...message, parsedContent: parsed };
    }
    
    // Fallback - se não conseguiu extrair JSON válido, usa o conteúdo raw
    // Mas verifica se parece ser um erro de formatação do LLM
    return { 
      ...message, 
      parsedContent: { storyEvent: message.content || "O narrador pondera..." } 
    };
  }

  // SYSTEM ou outra role
  return { ...message, parsedContent: null, isSystemMessage: true };
}

/**
 * Processa array de mensagens
 */
export function processMessages(messages) {
  if (!Array.isArray(messages)) return [];
  
  return messages.map(msg => processMessage(msg));
}

/**
 * Extrai mudanças de estado de uma mensagem processada
 */
export function extractChanges(message) {
  if (!message?.parsedContent) return null;
  
  const parsed = message.parsedContent;
  
  console.log("🔍 [extractChanges] Checking message for changes:", {
    hasStatUpdates: !!(parsed.statUpdates && Object.keys(parsed.statUpdates).length > 0),
    hasItemUpdates: !!(parsed.itemUpdates && parsed.itemUpdates.length > 0),
    itemUpdates: parsed.itemUpdates
  });
  
  // Verificar se há qualquer mudança
  const hasChanges = !!(
    (parsed.statUpdates && Object.keys(parsed.statUpdates).length > 0) || 
    (parsed.worldStateChanges && Object.keys(parsed.worldStateChanges).length > 0) || 
    parsed.worldEvent || 
    (parsed.newNPCs && parsed.newNPCs.length > 0) || 
    parsed.timePassageEffects ||
    (parsed.itemUpdates && parsed.itemUpdates.length > 0) ||
    (parsed.npcStatusChanges && parsed.npcStatusChanges.length > 0)
  );
  
  if (!hasChanges) return null;
  
  return {
    statUpdates: parsed.statUpdates,
    worldStateChanges: parsed.worldStateChanges,
    worldEvent: parsed.worldEvent,
    npcUpdates: parsed.npcUpdates,
    newNPCs: parsed.newNPCs,
    timePassageEffects: parsed.timePassageEffects,
    itemUpdates: parsed.itemUpdates,
    npcStatusChanges: parsed.npcStatusChanges
  };
}

/**
 * Verifica se mensagem deve ser exibida
 */
export function shouldDisplayMessage(message) {
  if (message.isSystemMessage) return false;
  if (!message.content || message.content.trim() === "") return false;
  if (!message.parsedContent) return false;
  
  return true;
}