import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useTranslation } from "@/components/i18n/LanguageContext";
import StoryMessage from "./StoryMessage";
import DiceRollChallenge from "./DiceRollChallenge";
import DiceRollResult from "./DiceRollResult";
import NPCCollapsible from "./NPCCollapsible";
import ChatMessageBlock from "./ChatMessageBlock";
import WorldEventCard from "./WorldEventCard";

import * as GameManager from "@/components/game/gameManager";
import { processMessages, shouldDisplayMessage, extractChanges } from "./MessageProcessor";

const StoryChat = React.forwardRef(({ character, world, chronicle, refreshCharacter }, ref) => {
  const { t, language } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingDiceRoll, setPendingDiceRoll] = useState(null);
  const [diceRollResults, setDiceRollResults] = useState(new Map());
  const [suggestedActions, setSuggestedActions] = useState([]);
  const [npcs, setNPCs] = useState([]);
  const [currentNPCId, setCurrentNPCId] = useState(null);
  const [conversationMode, setConversationMode] = useState("narrator");
  const [isLoadingConversation, setIsLoadingConversation] = useState(true);
  const [activeWorldEvent, setActiveWorldEvent] = useState(null);
  const [debugMessage, setDebugMessage] = useState(null);
  const [narratorActions, setNarratorActions] = useState([]);
  const [activeNPCIds, setActiveNPCIds] = useState([]);
  const [generatedImages, setGeneratedImages] = useState(new Map());
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const conversationRef = useRef(null);
  const lastSummaryCountRef = useRef(0);
  const hasInitializedRef = useRef(false);
  const isWaitingForInitialResponse = useRef(false);

  // Helper para remover ações duplicadas
  const deduplicateActions = (actions) => {
    if (!Array.isArray(actions)) return [];
    return [...new Set(actions)];
  };

  useEffect(() => {
    if (chronicle && chronicle.conversation_id && !hasInitializedRef.current) {
      hasInitializedRef.current = true;

      // Load completed dice rolls from Chronicle entity and localStorage
      const loadedDiceResults = new Map();

      // Load from localStorage first
      try {
        const storedResults = localStorage.getItem(`diceRollResults_${chronicle.id}`);
        if (storedResults) {
          const parsed = JSON.parse(storedResults);
          Object.entries(parsed).forEach(([msgId, data]) => {
            loadedDiceResults.set(msgId, data);
          });
        }
      } catch (e) {
        console.error("Error loading dice roll results from localStorage:", e);
      }

      // Ensure all chronicle completed rolls are marked
      const completedRolls = chronicle.completed_dice_rolls || [];
      completedRolls.forEach(msgId => {
        if (!loadedDiceResults.has(msgId)) {
          loadedDiceResults.set(msgId, { completed: true });
        }
      });

      setDiceRollResults(loadedDiceResults);

      loadConversation();
      loadGameData();
    }
  }, [chronicle]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, debugMessage, diceRollResults]);

  // Scroll input into view when it becomes active (player's turn)
  useEffect(() => {
    if (!isProcessing && !pendingDiceRoll && !activeWorldEvent) {
      setTimeout(() => {
        inputRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 300);
    }
  }, [isProcessing, pendingDiceRoll, activeWorldEvent]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadGameData = async () => {
    try {
      const [loadedNPCs, loadedEvent] = await Promise.all([
        GameManager.loadNPCs(world, chronicle),
        GameManager.loadActiveWorldEvent(chronicle)
      ]);

      setNPCs(loadedNPCs);
      setActiveWorldEvent(loadedEvent);
      setActiveNPCIds(chronicle.active_npcs || []);
    } catch (error) {
      console.error("Error loading game data:", error);
    }
  };

  const loadConversation = async () => {
    try {
      setIsLoadingConversation(true);

      const conversation = await base44.agents.getConversation(chronicle.conversation_id);
      conversationRef.current = conversation;

      const hasMessages = conversation && conversation.messages && Array.isArray(conversation.messages) && conversation.messages.length > 0;

      // Setup subscription FIRST
      const unsubscribe = base44.agents.subscribeToConversation(chronicle.conversation_id, (data) => {
        console.log("📨 Subscription update");
        if (data && data.messages && Array.isArray(data.messages)) {
          const newProcessedMessages = processMessages(data.messages);
          setMessages(newProcessedMessages);

          const lastMsg = newProcessedMessages[newProcessedMessages.length - 1];
          if (lastMsg && lastMsg.role === 'assistant' && lastMsg.parsedContent) {
            console.log("✅ Assistant response received");
            const parsed = lastMsg.parsedContent;

            if (parsed.outcomes && Array.isArray(parsed.outcomes) && parsed.outcomes.length > 0) {
              console.log("🎯 Setting outcomes:", parsed.outcomes);
              const uniqueOutcomes = deduplicateActions(parsed.outcomes);
              setSuggestedActions(uniqueOutcomes);
              setNarratorActions(uniqueOutcomes);
              base44.entities.Chronicle.update(chronicle.id, {
                last_outcomes: uniqueOutcomes
              });
            } else {
              const fallback = language === 'en' ? ["Continue", "Explore"] : ["Continuar", "Explorar"];
                  setSuggestedActions(fallback);
                  setNarratorActions(fallback);
                }

                if (parsed.diceRollChallenge) {
              const msgId = lastMsg.id || `msg-${Date.now()}`;
              // Only set pending if we don't already have a result for this message
              if (!diceRollResults.has(msgId)) {
                setPendingDiceRoll({ challenge: parsed.diceRollChallenge, messageId: msgId });
              }
            }

            if (isWaitingForInitialResponse.current) {
              console.log("✅ Initial response complete");
              isWaitingForInitialResponse.current = false;
              setIsProcessing(false);
              setIsLoadingConversation(false);
            }
          }
        }
      });

      if (!hasMessages) {
        console.log("📝 Empty conversation - sending initial message");
        setIsProcessing(true);
        isWaitingForInitialResponse.current = true;
        
        await base44.agents.addMessage(conversation, {
          role: "user",
          content: JSON.stringify({
            playerAction: language === 'en' ? "Start the story" : "Comece a história",
            playerLanguage: language,
            characterStats: JSON.stringify({
              name: character.name,
              concept: character.concept,
              clan: character.clan,
              health: character.health,
              max_health: character.max_health,
              willpower: character.willpower,
              max_willpower: character.max_willpower,
              humanity: character.humanity,
              max_humanity: 10,
              hunger: character.hunger,
              max_hunger: 5,
              attributes: character.attributes,
              skills: character.skills,
              disciplines: character.disciplines
            }),
            worldDescription: world.generated_details,
            worldState: chronicle.world_state,
            currentDay: chronicle.current_day || 1,
            daysSinceLastRest: 0,
            conversationMode: "narrator",
            narrativeStyle: chronicle.narrative_style || "concise"
          })
        });
        console.log("⏳ Waiting for initial response via subscription...");
      } else {
        console.log("✅ Existing conversation loaded");
        const processedMessages = processMessages(conversation.messages);
        setMessages(processedMessages);

        if (chronicle.last_outcomes && chronicle.last_outcomes.length > 0) {
          const uniqueOutcomes = deduplicateActions(chronicle.last_outcomes);
          setSuggestedActions(uniqueOutcomes);
          setNarratorActions(uniqueOutcomes);
        } else {
          const lastAiMessage = [...processedMessages].reverse().find(m => m.role === 'assistant' && m.parsedContent);
          if (lastAiMessage?.parsedContent?.outcomes && Array.isArray(lastAiMessage.parsedContent.outcomes) && lastAiMessage.parsedContent.outcomes.length > 0) {
            const uniqueOutcomes = deduplicateActions(lastAiMessage.parsedContent.outcomes);
            setSuggestedActions(uniqueOutcomes);
            setNarratorActions(uniqueOutcomes);
          } else {
            const fallback = language === 'en' ? ["Explore around", "Observe area"] : ["Explorar ao redor", "Observar a área"];
            setSuggestedActions(fallback);
            setNarratorActions(fallback);
            }

            if (lastAiMessage?.parsedContent?.diceRollChallenge) {
            const msgId = lastAiMessage.id || `msg-${Date.now()}`;
            // Only set pending if we don't already have a result for this message
            if (!diceRollResults.has(msgId)) {
              setPendingDiceRoll({ challenge: lastAiMessage.parsedContent.diceRollChallenge, messageId: msgId });
            }
          }
        }
        
        setIsLoadingConversation(false);
        setIsProcessing(false);
      }

      setConversationMode(chronicle.conversation_mode || "narrator");
      setCurrentNPCId(chronicle.active_npc_id || null);

      return () => {
        if (unsubscribe) unsubscribe();
      };
    } catch (error) {
      console.error("Error loading conversation:", error);
      setIsLoadingConversation(false);
      setIsProcessing(false);
      const fallback = language === 'en' ? ["Explore around", "Observe area"] : ["Explorar ao redor", "Observar a área"];
      setSuggestedActions(fallback);
      setNarratorActions(fallback);
    }
  };

  const autoSummarizeIfNeeded = async () => {
    if (!chronicle?.conversation_id || !conversationRef.current) return;

    const userAndAssistantMessages = messages.filter(m => m.role === 'user' || m.role === 'assistant');
    const messageCount = userAndAssistantMessages.length;

    if (messageCount > 40 && messageCount > lastSummaryCountRef.current + 40) {
      console.log("🤖 Auto-resumindo história em background...");
      lastSummaryCountRef.current = messageCount;

      try {
        const currentLang = language;
      const summaryPrompt = `Você é um narrador de Vampiro: A Máscara. Resuma de forma concisa e envolvente toda a história até agora (EM ${currentLang === 'en' ? 'INGLÊS' : 'PORTUGUÊS'}), mantendo:
1. Eventos principais e suas consequências
2. NPCs importantes encontrados e relacionamentos
3. Mudanças significativas no personagem (stats, humanidade, fome)
4. Estado atual do mundo
5. Conflitos e mistérios não resolvidos

Formato: JSON com campos "summary" (texto do resumo) e "keyPoints" (array de pontos-chave).`;

        const result = await base44.integrations.Core.InvokeLLM({
          prompt: summaryPrompt,
          response_json_schema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              keyPoints: { type: "array", items: { type: "string" } }
            }
          },
          conversation_id: chronicle.conversation_id
        });

        const recentMessages = userAndAssistantMessages.slice(-40);

        const summaryMessage = {
          role: "system",
          content: `📜 RESUMO DA HISTÓRIA ANTERIOR:\n\n${result.summary}\n\n🔑 PONTOS-CHAVE:\n${result.keyPoints.map(p => `• ${p}`).join('\n')}`
        };

        await base44.agents.updateConversation(chronicle.conversation_id, {
          messages: [summaryMessage, ...recentMessages]
        });

        console.log("✅ História resumida automaticamente!");
      } catch (error) {
        console.error("❌ Erro ao resumir automaticamente:", error);
      }
    }
  };

  const handleTalkToNPC = async (npcId) => {
    try {
      const result = await GameManager.changeConversationMode(npcId, chronicle);
      setCurrentNPCId(result.npcId);
      setConversationMode(result.mode);

      if (npcId === null) {
        const defaultActions = language === 'en' ? ["Continue", "Explore around", "Hunt for blood"] : ["Continuar", "Explorar ao redor", "Procurar por sangue"];
        const actions = narratorActions.length > 0 ? narratorActions : defaultActions;
        setSuggestedActions(deduplicateActions(actions));
      } else {
        setSuggestedActions([]);
      }
    } catch (error) {
      console.error("Error changing conversation mode:", error);
    }
  };

  const sendAction = async (action) => {
    if (!action || !action.trim() || isProcessing || activeWorldEvent) {
      console.log("❌ Action blocked:", { action: !!action, isProcessing, activeWorldEvent });
      return;
    }

    console.log("🎬 Sending action:", action);
    setIsProcessing(true);
    setInputValue("");
    setSuggestedActions([]);

    const currentActions = [...suggestedActions];

    setPendingDiceRoll(null);
    setDebugMessage(null);

    try {
      const gameContext = {
        character,
        chronicle,
        world,
        npcs,
        currentNPCId,
        conversationMode,
        language: language
      };

      const result = await GameManager.sendPlayerAction(action, gameContext, conversationRef);

      if (result.isDebugResponse) {
        setDebugMessage(result.debugMessage);
        
        if (result.adminChanges) {
          if (result.adminChanges.newNPCs && result.adminChanges.newNPCs.length > 0) {
            result.adminChanges.newNPCs.forEach(npc => {
              toast.success(`NPC criado: ${npc.name} (${npc.clan})`);
            });

            const updatedChronicleList = await base44.entities.Chronicle.list();
            const currentChronicleFromList = updatedChronicleList.find(c => c.id === chronicle.id);
            if (currentChronicleFromList) {
              setActiveNPCIds(currentChronicleFromList.active_npcs || []);
            }

            await loadGameData();
          }
          if (result.adminChanges.statUpdates) {
            await refreshCharacter();
          }
        }

        setIsProcessing(false);
        setSuggestedActions(currentActions);
        return;
      }

      if (result.keepPreviousActions) {
        setSuggestedActions(currentActions);
        setIsProcessing(false);
        return;
      }

      // Store generated image if present
      if (result.generateImage) {
        const lastAiMsg = messages.filter(m => m.role === 'assistant').pop();
        const msgId = lastAiMsg?.id || `msg-${Date.now()}`;
        setGeneratedImages(prev => {
          const newMap = new Map(prev);
          newMap.set(msgId, result.generateImage);
          
          // Persist to localStorage
          try {
            const obj = Object.fromEntries(newMap);
            localStorage.setItem(`generatedImages_${chronicle.id}`, JSON.stringify(obj));
          } catch (e) {
            console.error("Error saving generated images:", e);
          }
          
          return newMap;
        });
      }

      console.log("📦 Result received, waiting for subscription update...");

      // Reload character and game data (including NPCs)
      await Promise.all([
        refreshCharacter(),
        loadGameData()
      ]);

      // Show toast notifications for NPC status changes
      if (result.npcStatusChanges && result.npcStatusChanges.length > 0) {
        result.npcStatusChanges.forEach(change => {
          if (change.changeType === 'death') {
            toast.error(`💀 ${change.npcName} morreu!`);
          } else if (change.changeType === 'relationship') {
            toast.info(`${change.npcName}: relacionamento mudou para ${change.newValue}`);
          }
        });
      }

      setTimeout(() => autoSummarizeIfNeeded(), 1000);
      
      setIsProcessing(false);

    } catch (error) {
      console.error("Error sending action:", error);
      setSuggestedActions([language === 'en' ? "Try again" : "Tentar novamente"]);
      setIsProcessing(false);
    }
  };

  const handleWorldEventChoice = async (eventId, choice) => {
    setIsProcessing(true);
    setSuggestedActions([]);

    try {
      const gameContext = {
        character,
        chronicle,
        world,
        npcs,
        currentNPCId,
        conversationMode,
        language: language
      };

      const result = await GameManager.handleWorldEventChoice(eventId, choice, gameContext, conversationRef);

      setActiveWorldEvent(null);

      if (result.outcomes) {
        const uniqueOutcomes = deduplicateActions(result.outcomes);
        setSuggestedActions(uniqueOutcomes);
        setNarratorActions(uniqueOutcomes);

        await base44.entities.Chronicle.update(chronicle.id, {
          last_outcomes: uniqueOutcomes
        });
      }

      if (result.diceRollChallenge) {
        // Will be set by subscription update
      }

      if (result.worldEvent) {
        setActiveWorldEvent(result.worldEvent);
      }

      await Promise.all([
        refreshCharacter(),
        loadGameData()
      ]);

      setTimeout(() => autoSummarizeIfNeeded(), 1000);

      } catch (error) {
      console.error("Error handling world event choice:", error);
      }

      setIsProcessing(false);
  };

  const handleDiceRollComplete = async (successes, result, messageId) => {
    // Find the challenge from the message itself if pendingDiceRoll is null
    const message = messages.find(m => (m.id || `msg-${messages.indexOf(m)}`) === messageId);
    const challenge = pendingDiceRoll?.challenge || message?.parsedContent?.diceRollChallenge;
    
    if (!challenge) {
      console.error("❌ No dice roll challenge found");
      return;
    }

    // Save result for this specific message - this persists across re-renders
    const diceData = {
      challenge: challenge,
      result: result
    };
    
    setDiceRollResults(prev => {
      const newMap = new Map(prev);
      newMap.set(messageId, diceData);
      
      // Persist to localStorage
      try {
        const obj = Object.fromEntries(newMap);
        localStorage.setItem(`diceRollResults_${chronicle.id}`, JSON.stringify(obj));
      } catch (e) {
        console.error("Error saving dice roll results:", e);
      }
      
      return newMap;
    });

    // Persist to Chronicle entity
    const completedRolls = chronicle.completed_dice_rolls || [];
    if (!completedRolls.includes(messageId)) {
      await base44.entities.Chronicle.update(chronicle.id, {
        completed_dice_rolls: [...completedRolls, messageId]
      });
    }

    // Clear pending dice roll so the challenge card is replaced by result card
    setPendingDiceRoll(null);
    setIsProcessing(true);

    try {
      const gameContext = {
        character,
        chronicle,
        world,
        npcs,
        currentNPCId,
        conversationMode,
        language: language
      };

      const gameResult = await GameManager.handleDiceRollResult(successes, gameContext, conversationRef);

      if (gameResult.outcomes) {
        const uniqueOutcomes = deduplicateActions(gameResult.outcomes);
        setSuggestedActions(uniqueOutcomes);
        setNarratorActions(uniqueOutcomes);

        await base44.entities.Chronicle.update(chronicle.id, {
          last_outcomes: uniqueOutcomes
        });
      }

      if (gameResult.diceRollChallenge) {
        // Will be set by subscription update
      }

      if (gameResult.worldEvent) {
        setActiveWorldEvent(gameResult.worldEvent);
      }

      await refreshCharacter();

      setTimeout(() => autoSummarizeIfNeeded(), 1000);

      } catch (error) {
      console.error("Error sending dice result:", error);
      }

      setIsProcessing(false);
  };

  const handleDisciplineUsage = async (disciplineData) => {
    setIsProcessing(true);
    setSuggestedActions([]);

    try {
      const gameContext = {
        character,
        chronicle,
        world,
        npcs,
        currentNPCId,
        conversationMode,
        language: language
      };

      const result = await GameManager.handleDisciplineUsage(disciplineData, gameContext, conversationRef);

      if (result.outcomes) {
        const uniqueOutcomes = deduplicateActions(result.outcomes);
        setSuggestedActions(uniqueOutcomes);
        setNarratorActions(uniqueOutcomes);

        await base44.entities.Chronicle.update(chronicle.id, {
          last_outcomes: uniqueOutcomes
        });
      }

      await refreshCharacter();

      toast.success(`${disciplineData.powerName} ativado!${disciplineData.hungerIncrease > 0 ? ` Fome +${disciplineData.hungerIncrease}` : ''}`);

      setTimeout(() => autoSummarizeIfNeeded(), 1000);

    } catch (error) {
      console.error("Error using discipline:", error);
      toast.error("Erro ao usar disciplina");
    }

    setIsProcessing(false);
  };

  const getCurrentNPC = () => {
    if (!currentNPCId) return null;
    return npcs.find(n => n.id === currentNPCId);
  };

  const currentNPC = getCurrentNPC();

  // Expose handleDisciplineUsage via ref
  React.useImperativeHandle(ref, () => ({
    handleDisciplineUsage
  }));

  if (isLoadingConversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 space-y-4 scroll-smooth">
        {conversationMode === "npc" && currentNPC && (
          <Alert className="bg-purple-950 border-purple-700">
            <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-purple-300">
                {t('chat.talkingWith')} <strong>{currentNPC.name}</strong>
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleTalkToNPC(null)}
                className="border-purple-700 text-purple-300 hover:bg-purple-900"
              >
                <ArrowLeft className="w-3 h-3 mr-1" />
                {t('chat.backToNarrator')}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {messages.length === 0 && isProcessing && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-400 mb-2">O narrador está preparando sua história...</p>
            <p className="text-sm text-gray-500">Isso pode levar alguns segundos</p>
          </div>
        )}

        {messages.filter(shouldDisplayMessage).map((message, index) => {
          const changes = extractChanges(message);
          const messageId = message.id || `msg-${index}`;
          const hasDiceChallenge = message.parsedContent?.diceRollChallenge;
          const diceResult = diceRollResults.get(messageId);
          const imageUrl = generatedImages.get(messageId);
          const lastMessages = messages.filter(shouldDisplayMessage);
          const isLastMessage = index === lastMessages.length - 1;
          const showDiceChallenge = hasDiceChallenge && !diceResult && (isLastMessage || (!activeWorldEvent && !isProcessing));

          return (
            <ChatMessageBlock
              key={messageId}
              message={message}
              index={index}
              conversationMode={conversationMode}
              currentNPC={currentNPC}
              character={character}
              chronicle={chronicle}
              changes={changes}
              diceResult={diceResult}
              imageUrl={imageUrl}
              showDiceChallenge={showDiceChallenge}
              handleDiceRollComplete={handleDiceRollComplete}
            />
          );
        })}

        {debugMessage && (
          <Alert className="bg-yellow-950 border-yellow-700">
            <AlertDescription className="text-yellow-200 font-mono text-xs whitespace-pre-wrap">
              {debugMessage}
            </AlertDescription>
          </Alert>
        )}

        {activeWorldEvent && (
          <WorldEventCard
            event={activeWorldEvent}
            onChoice={handleWorldEventChoice}
            isProcessing={isProcessing}
          />
        )}

        {isProcessing && messages.length > 0 && (
          <div className="flex items-center gap-2 text-red-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm italic">
              {conversationMode === "npc" && currentNPC
                ? `${currentNPC.name} está pensando...`
                : "Hummmm..."
              }
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>



      <div className="flex-none z-20 bg-card border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
        {suggestedActions.length > 0 && !pendingDiceRoll && !isProcessing && !activeWorldEvent && (
          <div className="px-2 py-2 overflow-x-hidden max-h-32 overflow-y-auto border-b border-border/50">
            <p className="text-[10px] text-gray-500 mb-1.5 font-semibold uppercase px-1">{t('chat.chooseYourAction')}</p>
            <div className="flex flex-wrap gap-2">
              {suggestedActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => sendAction(action)}
                  disabled={isProcessing}
                  className="flex-shrink-0 min-h-[2rem] h-auto py-2 px-3 border-border hover:bg-primary/20 hover:border-primary hover:text-primary transition-all text-xs font-normal leading-tight justify-start text-left max-w-full touch-manipulation active:bg-primary/30"
                >
                  <span className="whitespace-normal text-left break-words w-full pointer-events-none">{action}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        <div ref={inputRef} className="p-2 bg-card">
          <div className="flex gap-2 items-end">
            <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendAction(inputValue);
              }
            }}
            placeholder={
              activeWorldEvent ? t('chat.resolveEvent') :
              pendingDiceRoll ? t('chat.resolveDiceRoll') :
              conversationMode === "npc" && currentNPC ? t('chat.talkToNpc', { npcName: currentNPC.name }) :
              t('chat.typeYourAction')
            }
            disabled={isProcessing || !!pendingDiceRoll || !!activeWorldEvent}
            className="flex-1 bg-secondary border-border text-foreground min-h-[40px] max-h-[120px] resize-none py-2 text-base"
          />
          <Button
            onClick={() => sendAction(inputValue)}
            disabled={isProcessing || !inputValue.trim() || !!pendingDiceRoll || !!activeWorldEvent}
            size="icon"
            className="bg-primary hover:bg-primary/90 shadow-[0_0_10px_rgba(220,38,38,0.4)] flex-shrink-0 h-10 w-10 mb-[1px]"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
});

export default StoryChat;