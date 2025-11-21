import { base44 } from "@/api/base44Client";
import { optimizeGameContext } from "./contextOptimizer";
import * as ContextManager from "./ContextManager";

/**
 * GameManager - Centralized game logic and state management
 * 
 * This module handles all game state changes, AI narrator interactions,
 * and business logic, keeping UI components clean and focused.
 */

/**
 * Extract JSON from text, handling markdown blocks and mixed content
 */
function extractJSON(content) {
  if (!content) return content;
  
  // 1. Try extracting from markdown code blocks first
  const jsonBlockRegex = /```(?:json)?\s*\n?([\s\S]*?)\n?```/;
  const match = content.match(jsonBlockRegex);
  
  if (match && match[1]) {
    console.log("📦 Extracted JSON from markdown code block");
    return match[1].trim();
  }

  // 2. Try finding the first outer-most JSON object if mixed with text
  const firstOpen = content.indexOf('{');
  const lastClose = content.lastIndexOf('}');
  
  if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
    console.log("📦 Extracted JSON from mixed text");
    return content.substring(firstOpen, lastClose + 1);
  }
  
  return content.trim();
}

/**
 * Process the narrator's AI response and extract game state changes
 */
export async function processNarratorResponse(response, gameContext) {
  const { character, chronicle, world, npcs, currentNPCId, language } = gameContext;
  
  console.log("🔍 [processNarratorResponse] Starting to process response");
  
  const result = {
    statUpdates: null,
    worldStateChanges: null,
    worldEvent: null,
    npcUpdates: [],
    newNPCs: [],
    activeNPCs: null,
    diceRollChallenge: null,
    outcomes: [],
    chronicleUpdates: {},
    timePassageEffects: null,
    itemUpdates: [],
    npcStatusChanges: [] // Ensure this is initialized
  };

  try {
    // Extract JSON from markdown code blocks if present
    const cleanContent = extractJSON(response.content);
    const parsed = JSON.parse(cleanContent);
    
    console.log("🎮 [processNarratorResponse] Parsed JSON keys:", Object.keys(parsed));

    // Extract time passage first (affects other stats)
    if (parsed.timePassage && typeof parsed.timePassage === 'object') {
      console.log("⏰ [processNarratorResponse] Found timePassage:", parsed.timePassage);
      result.timePassageEffects = await processTimePassage(
        parsed.timePassage,
        character,
        chronicle
      );
      console.log("⏰ [processNarratorResponse] Time passage effects:", result.timePassageEffects);
    }

    // Extract stat updates
    if (parsed.statUpdates && typeof parsed.statUpdates === 'object') {
      console.log("💉 [processNarratorResponse] Found statUpdates in JSON:", parsed.statUpdates);
      result.statUpdates = await validateAndApplyStatUpdates(
        parsed.statUpdates, 
        character
      );
      console.log("💾 [processNarratorResponse] Applied statUpdates result:", result.statUpdates);
    } else {
      console.log("⚠️ [processNarratorResponse] No statUpdates in JSON");
    }

    // Extract world state changes
    if (parsed.worldStateChanges && typeof parsed.worldStateChanges === 'object') {
      console.log("🌍 [processNarratorResponse] Found worldStateChanges:", parsed.worldStateChanges);
      result.worldStateChanges = await applyWorldStateChanges(
        parsed.worldStateChanges,
        chronicle
      );
      console.log("🌍 [processNarratorResponse] Applied worldStateChanges result:", result.worldStateChanges);
    }

    // Extract world event
    if (parsed.worldEvent) {
      console.log("⚡ [processNarratorResponse] Found worldEvent:", parsed.worldEvent.title);
      result.worldEvent = await createWorldEvent(
        parsed.worldEvent,
        chronicle,
        world
      );
    }

    // Extract NPC update
    if (parsed.npcUpdate && currentNPCId) {
      console.log("👤 [processNarratorResponse] Found npcUpdate for:", currentNPCId);
      const updated = await updateNPC(currentNPCId, parsed.npcUpdate, npcs);
      if (updated) result.npcUpdates.push(updated);
    }

    // Extract new NPCs and generate portrait if needed
    if (parsed.newNPCs && Array.isArray(parsed.newNPCs)) {
      console.log("👥 [processNarratorResponse] Found new NPCs:", parsed.newNPCs.length);
      
      // Generate portrait for NPC if requested
      let portraitUrl = null;
      if (parsed.generateImageForNPC && typeof parsed.generateImageForNPC === 'string') {
        console.log("🎨 [processNarratorResponse] Generating NPC portrait:", parsed.generateImageForNPC);
        portraitUrl = await generateNPCPortrait(parsed.generateImageForNPC);
        console.log("🎨 [processNarratorResponse] Generated portrait URL:", portraitUrl);
      }
      
      for (const npcData of parsed.newNPCs) {
        const newNPC = await createNPC(npcData, world, chronicle, portraitUrl);
        if (newNPC) result.newNPCs.push(newNPC);
      }
    }

    // FALLBACK: Create NPC if image generation is requested but newNPCs is missing
    if ((!parsed.newNPCs || parsed.newNPCs.length === 0) && parsed.generateImageForNPC) {
      let missingNpcName = parsed.activeNPC;
      if (!missingNpcName && parsed.npcStatusChanges && parsed.npcStatusChanges.length > 0) {
        missingNpcName = parsed.npcStatusChanges[0].npcName;
      }

      // Check if exists in current list
      const exists = npcs.find(n => n.name === missingNpcName);
      
      if (missingNpcName && !exists) {
        console.log("🚑 [processNarratorResponse] Recovery: Creating missing NPC from implicit data:", missingNpcName);
        
        // Try to infer clan from image prompt
        let inferredClan = "Unknown";
        const imgPrompt = parsed.generateImageForNPC.toLowerCase();
        const clans = ["brujah", "gangrel", "malkavian", "nosferatu", "toreador", "tremere", "ventrue", "lasombra", "tzimisce", "banu haqim", "ministry", "ravnos", "hecata", "salubri", "caitiff", "thin-blood", "human", "ghoul"];
        
        for (const c of clans) {
          if (imgPrompt.includes(c)) {
            inferredClan = c.charAt(0).toUpperCase() + c.slice(1);
            break;
          }
        }
        
        const implicitNPCData = {
          name: missingNpcName,
          clan: inferredClan,
          role: "Encountered",
          personality: "Inferido da narração",
          appearance: parsed.generateImageForNPC,
          motivations: "Unknown",
          knowledge: "Unknown",
          relationship_to_player: "neutral",
          trust_level: 0
        };

        // Generate portrait
        console.log("🎨 [processNarratorResponse] Generating fallback portrait");
        const portraitUrl = await generateNPCPortrait(parsed.generateImageForNPC);
        
        const newNPC = await createNPC(implicitNPCData, world, chronicle, portraitUrl);
        if (newNPC) {
          result.newNPCs.push(newNPC);
          // Add to active NPCs of chronicle automatically
          const currentActive = chronicle.active_npcs || [];
          if (!currentActive.includes(newNPC.id)) {
             result.chronicleUpdates.active_npcs = [...currentActive, newNPC.id];
          }
        }
      }
    }

    // Extract active NPCs
    if (parsed.activeNPCs && Array.isArray(parsed.activeNPCs)) {
      result.activeNPCs = parsed.activeNPCs;
      result.chronicleUpdates.active_npcs = parsed.activeNPCs;
    }

    // Extract dice roll challenge
    if (parsed.diceRollChallenge) {
      result.diceRollChallenge = parsed.diceRollChallenge;
    }

    // Extract item updates
    if (parsed.itemUpdates && Array.isArray(parsed.itemUpdates)) {
      console.log("📦 [processNarratorResponse] Found itemUpdates:", parsed.itemUpdates.length);
      result.itemUpdates = await processItemUpdates(
        parsed.itemUpdates,
        character,
        chronicle
      );
      console.log("📦 [processNarratorResponse] Processed itemUpdates result:", result.itemUpdates);
      }

    // Extract NPC status changes
    if (parsed.npcStatusChanges && Array.isArray(parsed.npcStatusChanges)) {
      console.log("👤 [processNarratorResponse] Found npcStatusChanges:", parsed.npcStatusChanges.length);
      
      // Include newly created NPCs in the search list
      const allAvailableNPCs = [...npcs, ...result.newNPCs];
      
      result.npcStatusChanges = await processNPCStatusChanges(
        parsed.npcStatusChanges,
        allAvailableNPCs
      );
      console.log("👤 [processNarratorResponse] Processed npcStatusChanges result:", result.npcStatusChanges);
    }



      // Extract outcomes
      if (parsed.outcomes && Array.isArray(parsed.outcomes) && parsed.outcomes.length > 0) {
      result.outcomes = parsed.outcomes;
      console.log("✅ Extracted outcomes:", result.outcomes);
      } else {
      // Fallback generic outcomes
      console.log("⚠️ No outcomes in JSON, using fallback");
      result.outcomes = language === 'en' 
        ? ["Continue", "Explore around", "Hunt for blood"] 
        : ["Continuar", "Explorar ao redor", "Procurar por sangue"];
      }

  } catch (e) {
    console.error("❌ [processNarratorResponse] Parse error:", e);
    console.log("📄 [processNarratorResponse] Raw response:", response.content?.substring(0, 200));
    // Not JSON or parsing failed - provide generic outcomes
    result.outcomes = language === 'en'
      ? ["Continue exploring", "Find shelter", "Hunt for blood"]
      : ["Continuar explorando", "Procurar abrigo", "Buscar por sangue"];
  }

  console.log("✅ [processNarratorResponse] Final result:", { 
    hasStatUpdates: !!result.statUpdates,
    statUpdates: result.statUpdates,
    hasWorldStateChanges: !!result.worldStateChanges,
    hasWorldEvent: !!result.worldEvent,
    hasNewNPCs: result.newNPCs.length > 0,
    hasTimePassageEffects: !!result.timePassageEffects,
    hasItemUpdates: result.itemUpdates.length > 0,
    outcomesCount: result.outcomes.length
  });

  return result;
}

/**
 * Send player action to narrator and process response
 */
export async function sendPlayerAction(action, gameContext, conversationRef) {
  const { character, chronicle, world, npcs, currentNPCId, conversationMode, language } = gameContext;

  if (!conversationRef.current) {
    throw new Error("Conversa não carregada");
  }

  // Check for admin commands
  if (action.trim().startsWith('/admin')) {
    return await handleAdminCommand(action, gameContext);
  }

  // Check for debug commands
  if (action.trim().startsWith('/narrador')) {
    return await handleNarradorCommand(action, conversationRef, gameContext);
  }

  if (action.trim().startsWith('/debug')) {
    return await handleDebugCommand(conversationRef);
  }

  // ⚡ OTIMIZAÇÃO: Reduzir contexto antes de enviar ao LLM
  console.log("🔧 [sendPlayerAction] Optimizing context before sending to LLM");
  const optimizedContext = optimizeGameContext(gameContext);
  
  // Log para debug (opcional - remover em produção)
  console.log("📊 Context size reduction:", {
    originalNPCs: npcs.length,
    optimizedNPCs: optimizedContext.npcs.length
  });

  // Build character snapshot (usando contexto otimizado)
  const characterSnapshot = {
    ...optimizedContext.character,
    max_humanity: 10,
    max_hunger: 5
  };
  
  // 📦 Buscar inventário do jogador
  const playerItems = await base44.entities.Item.filter({ character_id: character.id });
  optimizedContext.playerInventory = playerItems.map(item => ({
    name: item.name,
    description: item.description,
    quantity: item.quantity,
    type: item.type
  }));

  // 📚 RAG: Recuperar contexto hierárquico relevante
  console.log("🧠 [sendPlayerAction] Buscando Lore relevante...");
  const relevantLore = await ContextManager.retrieveRelevantContext(
    action, 
    world.id, 
    { currentLocationName: "Local Atual" } // Pode ser melhorado se tivermos o nome do local no state
  );
  
  if (relevantLore) {
    console.log("🧠 [sendPlayerAction] Lore injetada no prompt!");
    optimizedContext.relevantLore = relevantLore;
  }

  // Build NPC data if talking to NPC (usando contexto otimizado)
  let npcData = null;
  if (conversationMode === "npc" && currentNPCId) {
    const npc = optimizedContext.npcs.find(n => n.id === currentNPCId);
    if (npc) {
      npcData = npc;
    }
  }

  console.log("📤 [sendPlayerAction] Sending action:", action);

  // Send message to narrator (usando dados otimizados)
  await base44.agents.addMessage(conversationRef.current, {
    role: "user",
    content: JSON.stringify({
      playerAction: action,
      characterStats: JSON.stringify(characterSnapshot),
      worldDescription: optimizedContext.world.generated_details,
      worldState: optimizedContext.chronicle.world_state,
      playerInventory: JSON.stringify(optimizedContext.playerInventory),
      relevantLore: optimizedContext.relevantLore || (language === 'en' ? "No specific historical context relevant for this action." : "Nenhum contexto histórico específico relevante para esta ação."),
      currentDay: optimizedContext.chronicle.current_day || 1,
      daysSinceLastRest: (optimizedContext.chronicle.current_day || 1) - (optimizedContext.chronicle.last_rest_day || 0),
      conversationMode: conversationMode,
      currentNPC: npcData,
      playerLanguage: language || 'pt',
      narrativeStyle: optimizedContext.chronicle.narrative_style || "concise"
    })
  });

  // Wait for response with polling
  const response = await waitForNarratorResponse(chronicle.conversation_id);

  if (!response) {
    console.log("⚠️ [sendPlayerAction] No valid response received");
    return {
      outcomes: language === 'en' 
        ? ["Try again", "Explore", "Continue"] 
        : ["Tentar novamente", "Explorar", "Continuar"],
      chronicleUpdates: {}
    };
  }

  console.log("📨 [sendPlayerAction] Received narrator response");

  // Process the response (usando contexto original para updates)
  const result = await processNarratorResponse(response, gameContext);

  // Update chronicle if needed
  if (Object.keys(result.chronicleUpdates).length > 0) {
    await base44.entities.Chronicle.update(chronicle.id, result.chronicleUpdates);
  }

  console.log("✅ [sendPlayerAction] Returning result to UI");
  return result;
}

/**
 * Handle \admin command - god mode modifications
 */
async function handleAdminCommand(action, gameContext) {
  const { character, chronicle, world, language } = gameContext;
  const command = action.replace('/admin', '').trim().toLowerCase();
  const langInstruction = language === 'en' ? 'Respond in English.' : 'Responda em Português.';
  
  console.log("👑 [handleAdminCommand] Command:", command);

  let message = "";
  const changes = {
    statUpdates: null,
    newNPCs: []
  };

  try {
    // Parse command
    if (command.startsWith('criar npc') || command.startsWith('create npc')) {
      // Generate random NPC
      const promptText = language === 'en' 
        ? `Create an interesting NPC for Vampire: The Masquerade V5 set in: ${world.generated_details}`
        : `Crie um NPC interessante para Vampire: The Masquerade V5 ambientado em: ${world.generated_details}`;

      const npcData = await base44.integrations.Core.InvokeLLM({
        prompt: `${promptText}
        
${langInstruction}

${language === 'en' ? 'Return ONLY a JSON object with this exact structure:' : 'Retorne apenas um objeto JSON com esta estrutura exata:'}
{
  "name": "Nome do NPC",
  "clan": "Clã vampírico (ou 'Human' ou 'Ghoul')",
  "role": "Papel/título (ex: 'Príncipe', 'Sheriff', 'Informante')",
  "personality": "Traços de personalidade e maneirismos",
  "appearance": "Descrição física",
  "motivations": "Objetivos, medos, ambições",
  "knowledge": "O que sabe sobre a cidade e segredos",
  "relationship_to_player": "unknown",
  "trust_level": 0
}`,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            clan: { type: "string" },
            role: { type: "string" },
            personality: { type: "string" },
            appearance: { type: "string" },
            motivations: { type: "string" },
            knowledge: { type: "string" },
            relationship_to_player: { type: "string" },
            trust_level: { type: "number" }
          },
          required: ["name", "clan", "role", "personality", "appearance", "motivations", "knowledge", "relationship_to_player", "trust_level"]
        }
      });

      const newNPC = await createNPC(npcData, world, chronicle);
      
      // Add to active NPCs
      const currentActiveNPCs = chronicle.active_npcs || [];
      await base44.entities.Chronicle.update(chronicle.id, {
        active_npcs: [...currentActiveNPCs, newNPC.id]
      });

      changes.newNPCs.push(newNPC);
      message = language === 'en'
        ? `👑 ADMIN: NPC created successfully!\n\n📋 ${newNPC.name} (${newNPC.clan})\n${newNPC.role}\n\n${newNPC.appearance}\n\nAdded to current scene.`
        : `👑 ADMIN: NPC criado com sucesso!\n\n📋 ${newNPC.name} (${newNPC.clan})\n${newNPC.role}\n\n${newNPC.appearance}\n\nAdicionado à cena atual.`;
    }
    else if (command.match(/^(fome|hunger)\s+(\d+)$/)) {
      const value = Math.max(0, Math.min(5, parseInt(command.match(/\d+/)[0])));
      await base44.entities.Character.update(character.id, { hunger: value });
      changes.statUpdates = { hunger: value };
      message = language === 'en' ? `👑 ADMIN: Hunger changed to ${value}/5` : `👑 ADMIN: Fome alterada para ${value}/5`;
    }
    else if (command.match(/^(vida|health|vitalidade)\s+(\d+)$/)) {
      const value = Math.max(0, Math.min(character.max_health, parseInt(command.match(/\d+/)[0])));
      await base44.entities.Character.update(character.id, { health: value });
      changes.statUpdates = { health: value };
      message = language === 'en' ? `👑 ADMIN: Health changed to ${value}/${character.max_health}` : `👑 ADMIN: Vitalidade alterada para ${value}/${character.max_health}`;
    }
    else if (command.match(/^(humanidade|humanity)\s+(\d+)$/)) {
      const value = Math.max(0, Math.min(10, parseInt(command.match(/\d+/)[0])));
      await base44.entities.Character.update(character.id, { humanity: value });
      changes.statUpdates = { humanity: value };
      message = language === 'en' ? `👑 ADMIN: Humanity changed to ${value}/10` : `👑 ADMIN: Humanidade alterada para ${value}/10`;
    }
    else if (command.match(/^(vontade|willpower|força de vontade)\s+(\d+)$/)) {
      const value = Math.max(0, Math.min(character.max_willpower, parseInt(command.match(/\d+/)[0])));
      await base44.entities.Character.update(character.id, { willpower: value });
      changes.statUpdates = { willpower: value };
      message = language === 'en' ? `👑 ADMIN: Willpower changed to ${value}/${character.max_willpower}` : `👑 ADMIN: Força de Vontade alterada para ${value}/${character.max_willpower}`;
    }
    else {
      message = language === 'en' ? `👑 ADMIN COMMANDS:

📋 Create NPCs:
  /admin create npc

🩸 Modify Stats:
  /admin hunger 3
  /admin health 8
  /admin humanity 5
  /admin willpower 4

Allowed values:
• Hunger: 0-5
• Health: 0-${character.max_health}
• Humanity: 0-10
• Willpower: 0-${character.max_willpower}` 
      : `👑 ADMIN COMANDOS:

📋 Criar NPCs:
  /admin criar npc

🩸 Modificar Stats:
  /admin fome 3
  /admin vida 8
  /admin humanidade 5
  /admin vontade 4

Valores permitidos:
• Fome: 0-5
• Vida: 0-${character.max_health}
• Humanidade: 0-10
• Vontade: 0-${character.max_willpower}`;
    }

  } catch (error) {
    console.error("❌ [handleAdminCommand] Error:", error);
    message = language === 'en' ? `👑 ADMIN: Error executing command - ${error.message}` : `👑 ADMIN: Erro ao executar comando - ${error.message}`;
  }

  return {
    debugMessage: message,
    outcomes: [],
    isDebugResponse: true,
    adminChanges: changes
  };
}

/**
 * Handle \narrador command - talk to narrator out of character
 */
async function handleNarradorCommand(action, conversationRef, gameContext) {
  const question = action.replace('/narrador', '').trim();
  const { language } = gameContext || {};
  const langInstruction = language === 'en' ? 'Answer in English.' : 'Responda em Português.';

  console.log("🗣️ [handleNarradorCommand] Question:", question);

  // Use InvokeLLM for out-of-character conversation (without adding to agent conversation)
  const response = await base44.integrations.Core.InvokeLLM({
    prompt: `Você é o narrador de um jogo de Vampire: The Masquerade V5. O jogador saiu do jogo por um momento e quer conversar com você sobre regras, história ou tirar dúvidas. Seja prestativo e claro. Não avance a história, apenas converse.
    
    ${langInstruction}
    
    Pergunta do jogador: ${question}`,
    response_json_schema: null
  });

  return {
    debugMessage: `🗣️ NARRADOR:\n\n${response}`,
    outcomes: [],
    isDebugResponse: true,
    keepPreviousActions: true
  };
}

/**
 * Handle \debug command - show conversation log
 */
async function handleDebugCommand(conversationRef) {
  console.log("🐛 [handleDebugCommand] Generating debug log");

  const messages = conversationRef.current?.messages || [];
  console.log("🐛 Total messages:", messages.length);
  console.log("🐛 First message timestamp:", messages[0]?.created_date);
  console.log("🐛 Last message timestamp:", messages[messages.length - 1]?.created_date);
  
  const totalMessages = messages.length;
  const lastMessages = messages.slice(-10); // Last 10 messages
  const startIndex = Math.max(0, totalMessages - 10);

  const debugLog = lastMessages.map((msg, idx) => {
    const timestamp = msg.created_date || 'N/A';
    const role = msg.role === 'user' ? '👤 USER' : '🤖 ASSISTANT';
    let content = msg.content;
    
    // Try to parse and pretty-print JSON
    try {
      const parsed = JSON.parse(content);
      content = JSON.stringify(parsed, null, 2);
    } catch (e) {
      // Not JSON, keep as is
    }

    return `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n[${startIndex + idx + 1}/${totalMessages}] ${role} - ${timestamp}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${content}`;
  }).join('\n\n');

  return {
    debugMessage: `🐛 DEBUG LOG - Últimas ${lastMessages.length} de ${totalMessages} mensagens:\n${debugLog}`,
    outcomes: [],
    isDebugResponse: true
  };
}

/**
 * Handle world event choice
 */
export async function handleWorldEventChoice(eventId, choice, gameContext, conversationRef) {
  const { character, chronicle, language } = gameContext;

  // Send world event response to narrator
  await base44.agents.addMessage(conversationRef.current, {
    role: "user",
    content: JSON.stringify({
      worldEventResponse: choice,
      eventId: eventId,
      playerLanguage: language || 'pt',
      characterStats: JSON.stringify({
        health: character.health,
        willpower: character.willpower,
        humanity: character.humanity,
        hunger: character.hunger,
        attributes: character.attributes,
        skills: character.skills,
        disciplines: character.disciplines
        }),
      worldState: chronicle.world_state
    })
  });

  // Update world event status
  await base44.entities.WorldEvent.update(eventId, {
    player_choice: choice,
    status: 'resolved'
  });

  // Clear active world event
  await base44.entities.Chronicle.update(chronicle.id, {
    active_world_event_id: null
  });

  // Wait for narrator response
  await new Promise(resolve => setTimeout(resolve, 2000));

  const response = await waitForNarratorResponse(chronicle.conversation_id);

  if (!response) {
    return { outcomes: [] };
  }

  return await processNarratorResponse(response, gameContext);
}

/**
 * Handle discipline usage
 */
export async function handleDisciplineUsage(disciplineData, gameContext, conversationRef) {
  const { character, chronicle, language } = gameContext;

  // Apply hunger increase from rouse check
  if (disciplineData.hungerIncrease > 0) {
    const newHunger = Math.min(5, character.hunger + disciplineData.hungerIncrease);
    await base44.entities.Character.update(character.id, { hunger: newHunger });
  }

  // Send discipline usage to narrator
  await base44.agents.addMessage(conversationRef.current, {
    role: "user",
    content: JSON.stringify({
      disciplineUsage: {
        disciplineName: disciplineData.disciplineName,
        powerName: disciplineData.powerName,
        powerLevel: disciplineData.powerLevel,
        hungerIncrease: disciplineData.hungerIncrease
      },
      playerLanguage: language || 'pt',
      characterStats: JSON.stringify({
        health: character.health,
        willpower: character.willpower,
        humanity: character.humanity,
        hunger: Math.min(5, character.hunger + disciplineData.hungerIncrease),
        attributes: character.attributes,
        skills: character.skills
      }),
      narrativeStyle: chronicle.narrative_style || "concise"
    })
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  const response = await waitForNarratorResponse(chronicle.conversation_id);

  if (!response) {
    return { outcomes: [] };
  }

  return await processNarratorResponse(response, gameContext);
}

/**
 * Handle dice roll result
 */
export async function handleDiceRollResult(successes, gameContext, conversationRef) {
  const { character, chronicle, world, conversationMode, language } = gameContext;

  await base44.agents.addMessage(conversationRef.current, {
    role: "user",
    content: JSON.stringify({
      diceRollResult: successes,
      playerLanguage: language || 'pt',
      characterStats: JSON.stringify({
        health: character.health,
        willpower: character.willpower,
        humanity: character.humanity,
        hunger: character.hunger,
        attributes: character.attributes,
        skills: character.skills,
        disciplines: character.disciplines
        }),
      worldDescription: world.generated_details,
      worldState: chronicle.world_state,
      conversationMode: conversationMode,
      narrativeStyle: chronicle.narrative_style || "concise"
    })
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  const response = await waitForNarratorResponse(chronicle.conversation_id);

  if (!response) {
    return { outcomes: [] };
  }

  return await processNarratorResponse(response, gameContext);
}

/**
 * Change conversation mode (narrator <-> NPC)
 */
export async function changeConversationMode(npcId, chronicle) {
  if (npcId === null) {
    await base44.entities.Chronicle.update(chronicle.id, {
      conversation_mode: "narrator",
      active_npc_id: null
    });
    return { mode: "narrator", npcId: null };
  } else {
    await base44.entities.Chronicle.update(chronicle.id, {
      conversation_mode: "npc",
      active_npc_id: npcId
    });
    return { mode: "npc", npcId: npcId };
  }
}

// ============================================================================
// INTERNAL HELPER FUNCTIONS
// ============================================================================

async function waitForNarratorResponse(conversationId, maxAttempts = 15) {
  let attempts = 0;
  let lastMessage = null;

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const updatedConv = await base44.agents.getConversation(conversationId);

    if (updatedConv && updatedConv.messages && Array.isArray(updatedConv.messages)) {
      const potentialLastMessage = updatedConv.messages[updatedConv.messages.length - 1];

      if (potentialLastMessage &&
          potentialLastMessage.role === 'assistant' &&
          potentialLastMessage !== lastMessage) {
        return potentialLastMessage;
      }
    }

    attempts++;
  }

  return null;
}

async function processTimePassage(timePassage, character, chronicle) {
  console.log("⏰ [processTimePassage] Processing:", timePassage);
  
  const type = timePassage.type; // "rest", "hours", "day", "days", "week"
  const effects = {
    healthChange: 0,
    willpowerChange: 0,
    hungerChange: 0,
    daysPassed: 0,
    description: timePassage.description || ""
  };

  const currentDay = chronicle.current_day || 1;
  const lastRestDay = chronicle.last_rest_day || 0;

  if (type === "rest") {
    // Descansou durante o dia - recuperação completa
    const maxHealth = character.max_health || 10;
    const maxWillpower = character.max_willpower || 10;
    
    effects.healthChange = Math.min(maxHealth - character.health, 3);
    effects.willpowerChange = maxWillpower - character.willpower;
    effects.hungerChange = Math.min(1, 5 - character.hunger); // Aumenta fome ao acordar
    effects.daysPassed = 1;

    await base44.entities.Character.update(character.id, {
      health: Math.min(maxHealth, character.health + effects.healthChange),
      willpower: maxWillpower,
      hunger: Math.min(5, character.hunger + effects.hungerChange)
    });

    await base44.entities.Chronicle.update(chronicle.id, {
      current_day: currentDay + 1,
      last_rest_day: currentDay + 1
    });

    console.log("💤 [processTimePassage] Rest applied:", effects);
  } 
  else if (type === "hours") {
    // Passaram algumas horas - leve aumento de fome
    effects.hungerChange = Math.random() > 0.5 ? 1 : 0;
    
    if (effects.hungerChange > 0) {
      await base44.entities.Character.update(character.id, {
        hunger: Math.min(5, character.hunger + effects.hungerChange)
      });
    }

    console.log("⏳ [processTimePassage] Hours passed:", effects);
  }
  else if (type === "day" || type === "days") {
    // Passou um ou mais dias sem descanso - aumenta fome, reduz vitalidade
    const daysCount = timePassage.days || 1;
    effects.daysPassed = daysCount;
    effects.hungerChange = Math.min(daysCount, 5 - character.hunger);
    
    // Penalidade por não descansar
    const daysSinceRest = (currentDay + daysCount) - lastRestDay;
    if (daysSinceRest > 2) {
      effects.healthChange = -Math.min(2, Math.floor(daysSinceRest / 2));
    }

    await base44.entities.Character.update(character.id, {
      health: Math.max(0, character.health + effects.healthChange),
      hunger: Math.min(5, character.hunger + effects.hungerChange)
    });

    await base44.entities.Chronicle.update(chronicle.id, {
      current_day: currentDay + daysCount
    });

    console.log("📅 [processTimePassage] Days passed:", effects);
  }
  else if (type === "week") {
    // Passou uma semana - efeitos severos
    effects.daysPassed = 7;
    effects.hungerChange = Math.min(3, 5 - character.hunger);
    effects.healthChange = -3;

    await base44.entities.Character.update(character.id, {
      health: Math.max(0, character.health + effects.healthChange),
      hunger: Math.min(5, character.hunger + effects.hungerChange)
    });

    await base44.entities.Chronicle.update(chronicle.id, {
      current_day: currentDay + 7
    });

    console.log("📆 [processTimePassage] Week passed:", effects);
  }

  return effects;
}

async function validateAndApplyStatUpdates(updates, character) {
  console.log("🔧 [validateAndApplyStatUpdates] Input updates:", updates);
  console.log("🔧 [validateAndApplyStatUpdates] Current character stats:", {
    health: character.health,
    willpower: character.willpower,
    humanity: character.humanity,
    hunger: character.hunger
  });
  
  const newStats = {};
  let hasChanges = false;

  const maxHealth = character.max_health || 10;
  const maxWillpower = character.max_willpower || 10;

  // Helper to apply change only if needed
  const applyIfChanged = (statName, newValue, min, max) => {
    const clamped = Math.max(min, Math.min(max, newValue));
    if (clamped !== character[statName]) {
      newStats[statName] = clamped;
      hasChanges = true;
      console.log(`📊 [validateAndApplyStatUpdates] ${statName} changed: ${character[statName]} -> ${clamped}`);
    } else {
      console.log(`⚠️ [validateAndApplyStatUpdates] ${statName} unchanged (clamped value ${clamped} equals current)`);
    }
  };

  // Health
  if (updates.set_health !== undefined) {
    applyIfChanged('health', updates.set_health, 0, maxHealth);
  } else if (updates.health !== undefined) {
    applyIfChanged('health', character.health + updates.health, 0, maxHealth);
  }

  // Willpower
  if (updates.set_willpower !== undefined) {
    applyIfChanged('willpower', updates.set_willpower, 0, maxWillpower);
  } else if (updates.willpower !== undefined) {
    applyIfChanged('willpower', character.willpower + updates.willpower, 0, maxWillpower);
  }

  // Humanity
  if (updates.set_humanity !== undefined) {
    applyIfChanged('humanity', updates.set_humanity, 0, 10);
  } else if (updates.humanity !== undefined) {
    applyIfChanged('humanity', character.humanity + updates.humanity, 0, 10);
  }

  // Hunger
  if (updates.set_hunger !== undefined) {
    applyIfChanged('hunger', updates.set_hunger, 0, 5);
  } else if (updates.hunger !== undefined) {
    applyIfChanged('hunger', character.hunger + updates.hunger, 0, 5);
  }

  if (hasChanges) {
    console.log("💾 [validateAndApplyStatUpdates] Updating character in database:", newStats);
    await base44.entities.Character.update(character.id, newStats);
    console.log("✅ [validateAndApplyStatUpdates] Character updated successfully");
    return newStats;
  }

  console.log("⚠️ [validateAndApplyStatUpdates] No changes detected");
  return null;
}

async function applyWorldStateChanges(changes, chronicle) {
  const currentState = chronicle.world_state || {
    inquisition_activity: 3,
    masquerade_threat: 2,
    political_tension: 5,
    supernatural_activity: 4
  };

  const newState = { ...currentState };
  let hasChanges = false;

  if (changes.inquisition_activity !== undefined) {
    newState.inquisition_activity = Math.max(0, Math.min(10, 
      currentState.inquisition_activity + changes.inquisition_activity));
    hasChanges = true;
  }
  if (changes.masquerade_threat !== undefined) {
    newState.masquerade_threat = Math.max(0, Math.min(10, 
      currentState.masquerade_threat + changes.masquerade_threat));
    hasChanges = true;
  }
  if (changes.political_tension !== undefined) {
    newState.political_tension = Math.max(0, Math.min(10, 
      currentState.political_tension + changes.political_tension));
    hasChanges = true;
  }
  if (changes.supernatural_activity !== undefined) {
    newState.supernatural_activity = Math.max(0, Math.min(10, 
      currentState.supernatural_activity + changes.supernatural_activity));
    hasChanges = true;
  }

  if (hasChanges) {
    await base44.entities.Chronicle.update(chronicle.id, {
      world_state: newState
    });
    return newState;
  }

  return null;
}

async function createWorldEvent(eventData, chronicle, world) {
  try {
    const user = await base44.auth.me();
    const newEvent = await base44.entities.WorldEvent.create({
      ...eventData,
      world_id: world.id,
      chronicle_id: chronicle.id,
      user_id: user.email,
      status: 'active'
    });

    await base44.entities.Chronicle.update(chronicle.id, {
      active_world_event_id: newEvent.id
    });

    return newEvent;
  } catch (error) {
    console.error("Error creating world event:", error);
    return null;
  }
}

async function createNPC(npcData, world, chronicle, portraitUrl = null) {
  try {
    const newNPC = await base44.entities.NPC.create({
      ...npcData,
      world_id: world.id,
      chronicle_id: chronicle.id,
      portrait_url: portraitUrl
    });
    return newNPC;
  } catch (error) {
    console.error("Error creating NPC:", error);
    return null;
  }
}

async function updateNPC(npcId, updates, npcs) {
  try {
    const npc = npcs.find(n => n.id === npcId);
    if (!npc) return null;

    const updateData = {};
    if (updates.trust_level !== undefined) {
      updateData.trust_level = Math.max(-10, Math.min(10, 
        (npc.trust_level || 0) + updates.trust_level));
    }
    if (updates.relationship !== undefined) {
      updateData.relationship_to_player = updates.relationship;
    }
    if (updates.current_mood !== undefined) {
      updateData.current_mood = updates.current_mood;
    }

    if (Object.keys(updateData).length > 0) {
      await base44.entities.NPC.update(npcId, updateData);
      return { id: npcId, ...updateData };
    }
  } catch (error) {
    console.error("Error updating NPC:", error);
  }
  return null;
}

/**
 * Load NPCs for a chronicle
 */
export async function loadNPCs(world, chronicle) {
  try {
    const allNPCs = await base44.entities.NPC.list();
    return allNPCs.filter(npc =>
      npc.world_id === world.id || npc.chronicle_id === chronicle.id
    );
  } catch (error) {
    console.error("Error loading NPCs:", error);
    return [];
  }
}

/**
 * Load active world event
 */
export async function loadActiveWorldEvent(chronicle) {
  try {
    if (chronicle.active_world_event_id) {
      const events = await base44.entities.WorldEvent.list();
      const event = events.find(e => e.id === chronicle.active_world_event_id);
      if (event && event.status === 'active') {
        return event;
      }
    }
  } catch (error) {
    console.error("Error loading world event:", error);
  }
  return null;
}

/**
 * Generate NPC portrait using AI
 */
async function generateNPCPortrait(prompt) {
  try {
    console.log("🎨 [generateNPCPortrait] Generating portrait with prompt:", prompt);
    
    // Enhance prompt with additional artistic direction
    const enhancedPrompt = `${prompt}, highly detailed portrait, sharp focus, professional photography, dramatic lighting, cinematic composition, 8k resolution, realistic details`;
    
    const result = await base44.integrations.Core.GenerateImage({
      prompt: enhancedPrompt
    });
    
    if (result && result.url) {
      console.log("✅ [generateNPCPortrait] Portrait generated successfully:", result.url);
      return result.url;
    }
    
    console.log("⚠️ [generateNPCPortrait] No URL in result:", result);
    return null;
  } catch (error) {
    console.error("❌ [generateNPCPortrait] Error generating portrait:", error);
    return null;
  }
}

// ============================================================================
// INVENTORY MANAGEMENT (MODULAR - CAN BE REMOVED EASILY)
// ============================================================================

/**
 * Process item updates from narrator
 * This is the main entry point for inventory management
 */
async function processItemUpdates(updates, character, chronicle) {
  console.log("📦 [processItemUpdates] Processing updates:", updates);
  
  const results = [];
  
  for (const update of updates) {
    try {
      let result = null;
      
      if (update.action === 'add') {
        result = await addItemToInventory(update, character, chronicle);
      } else if (update.action === 'update') {
        result = await updateItemQuantity(update, character, chronicle);
      } else if (update.action === 'remove') {
        result = await removeItemFromInventory(update, character, chronicle);
      }
      
      if (result) {
        results.push(result);
      }
    } catch (error) {
      console.error(`❌ [processItemUpdates] Error processing ${update.action}:`, error);
    }
  }
  
  console.log("✅ [processItemUpdates] Results:", results);
  return results;
}

/**
 * Add new item to character's inventory
 */
async function addItemToInventory(itemData, character, chronicle) {
  console.log("➕ [addItemToInventory] Adding:", itemData.name);
  
  const newItem = await base44.entities.Item.create({
    name: itemData.name,
    type: itemData.type || 'misc',
    quantity: itemData.quantity || 1,
    description: itemData.description || '',
    weight: itemData.weight || 1,
    character_id: character.id,
    chronicle_id: chronicle.id,
    is_equipped: false
  });
  
  return {
    action: 'added',
    item: newItem
  };
}

/**
 * Update existing item quantity
 */
async function updateItemQuantity(updateData, character, chronicle) {
  console.log("🔄 [updateItemQuantity] Updating:", updateData.name);
  
  // Find the item
  const allItems = await base44.entities.Item.list();
  const item = allItems.find(i => 
    i.character_id === character.id && 
    i.name === updateData.name
  );
  
  if (!item) {
    console.log("⚠️ [updateItemQuantity] Item not found:", updateData.name);
    return null;
  }
  
  const newQuantity = item.quantity + updateData.quantityChange;
  
  // If quantity reaches 0 or below, remove item
  if (newQuantity <= 0) {
    await base44.entities.Item.delete(item.id);
    return {
      action: 'removed',
      itemName: item.name,
      reason: 'quantity_zero'
    };
  }
  
  // Otherwise update quantity
  await base44.entities.Item.update(item.id, {
    quantity: newQuantity
  });
  
  return {
    action: 'updated',
    itemName: item.name,
    oldQuantity: item.quantity,
    newQuantity: newQuantity
  };
}

/**
 * Remove item from inventory
 */
async function removeItemFromInventory(removeData, character, chronicle) {
  console.log("➖ [removeItemFromInventory] Removing:", removeData.name);

  // Find the item
  const allItems = await base44.entities.Item.list();
  const item = allItems.find(i => 
    i.character_id === character.id && 
    i.name === removeData.name
  );

  if (!item) {
    console.log("⚠️ [removeItemFromInventory] Item not found:", removeData.name);
    return null;
  }

  await base44.entities.Item.delete(item.id);

  return {
    action: 'removed',
    itemName: item.name
  };
}

/**
 * Process NPC status changes
 */
async function processNPCStatusChanges(changes, npcs) {
  console.log("👤 [processNPCStatusChanges] Processing changes:", JSON.stringify(changes, null, 2));
  console.log("👤 [processNPCStatusChanges] Available NPCs:", npcs.map(n => ({ id: n.id, name: n.name })));

  const results = [];

  for (const change of changes) {
    try {
      console.log("👤 [processNPCStatusChanges] Processing change:", JSON.stringify(change, null, 2));
      
      const npc = npcs.find(n => n.id === change.npcId);

      if (!npc) {
        console.log("⚠️ [processNPCStatusChanges] NPC not found by ID:", change.npcId);
        console.log("⚠️ [processNPCStatusChanges] Trying to find by name:", change.npcName);
        
        // Try to find by name as fallback
        const npcByName = npcs.find(n => n.name === change.npcName);
        if (npcByName) {
          console.log("✅ [processNPCStatusChanges] Found NPC by name:", npcByName.id);
          change.npcId = npcByName.id;
        } else {
          console.log("❌ [processNPCStatusChanges] NPC not found by name either");
          continue;
        }
      }

      const updateData = {};

      if (change.changeType === 'death') {
        updateData.is_active = false;
        updateData.current_mood = 'deceased';
        console.log("💀 [processNPCStatusChanges] Marking NPC as dead:", change.npcId);
      } else if (change.changeType === 'relationship') {
        updateData.relationship_to_player = change.newValue;
      } else if (change.changeType === 'mood') {
        updateData.current_mood = change.newValue;
      } else if (change.changeType === 'trust') {
        updateData.trust_level = parseInt(change.newValue);
      }

      if (Object.keys(updateData).length > 0) {
        console.log("💾 [processNPCStatusChanges] Updating NPC in database:", change.npcId, updateData);
        await base44.entities.NPC.update(change.npcId, updateData);
        console.log("✅ [processNPCStatusChanges] NPC updated successfully");
        
        results.push({
          npcId: change.npcId,
          npcName: change.npcName || npc?.name,
          changeType: change.changeType,
          description: change.description,
          oldValue: change.oldValue,
          newValue: change.newValue
        });
      }
    } catch (error) {
      console.error("❌ [processNPCStatusChanges] Error processing change:", error);
    }
  }

  console.log("✅ [processNPCStatusChanges] Results:", results);
  return results;
}