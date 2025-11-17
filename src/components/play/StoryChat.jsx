
import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import StoryMessage from "./StoryMessage";
import DiceRollChallenge from "./DiceRollChallenge";
import NPCPanel from "./NPCPanel";
import WorldEventCard from "./WorldEventCard";

const TURNS_PER_NIGHT = 4;
const TURNS_PER_DUSK = 1;

export default function StoryChat({ character, world, chronicle, refreshCharacter }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingDiceRoll, setPendingDiceRoll] = useState(null);
  const [suggestedActions, setSuggestedActions] = useState([]);
  const [npcs, setNPCs] = useState([]);
  const [currentNPCId, setCurrentNPCId] = useState(null);
  const [conversationMode, setConversationMode] = useState("narrator");
  const [isLoadingConversation, setIsLoadingConversation] = useState(true);
  const [activeWorldEvent, setActiveWorldEvent] = useState(null);
  const messagesEndRef = useRef(null);
  const conversationRef = useRef(null);

  useEffect(() => {
    if (chronicle && chronicle.conversation_id) {
      loadConversation();
      loadNPCs();
      loadActiveWorldEvent();
    }
  }, [chronicle]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadNPCs = async () => {
    try {
      const allNPCs = await base44.entities.NPC.list();
      const chronicleNPCs = allNPCs.filter(npc =>
        npc.world_id === world.id || npc.chronicle_id === chronicle.id
      );
      setNPCs(chronicleNPCs);
    } catch (error) {
      console.error("Error loading NPCs:", error);
    }
  };

  const loadActiveWorldEvent = async () => {
    try {
      if (chronicle.active_world_event_id) {
        const events = await base44.entities.WorldEvent.list();
        const event = events.find(e => e.id === chronicle.active_world_event_id);
        if (event && event.status === 'active') {
          setActiveWorldEvent(event);
        }
      }
    } catch (error) {
      console.error("Error loading world event:", error);
    }
  };

  const checkForWorldEvent = async (turnCount) => {
    try {
      if (chronicle.active_world_event_id) return;

      const turnsSinceLastEvent = turnCount - (chronicle.last_event_turn || 0);
      if (turnsSinceLastEvent < 5) return;

      const eventChance = Math.random();
      if (eventChance > 0.2) return;

      const conversation = conversationRef.current;
      if (!conversation) return;

      await base44.agents.addMessage(conversation, {
        role: "user",
        content: JSON.stringify({
          triggerWorldEvent: true,
          worldState: chronicle.world_state,
          turnCount: turnCount,
          characterStats: JSON.stringify({
            health: character.health,
            hunger: character.hunger,
            humanity: character.humanity
          })
        })
      });

    } catch (error) {
      console.error("Error checking for world event:", error);
    }
  };

  const handleWorldEventChoice = async (eventId, choice) => {
    setIsProcessing(true);
    setSuggestedActions([]);

    try {
      const conversation = conversationRef.current;

      await base44.agents.addMessage(conversation, {
        role: "user",
        content: JSON.stringify({
          worldEventResponse: choice,
          eventId: eventId,
          characterStats: JSON.stringify({
            health: character.health,
            willpower: character.willpower,
            humanity: character.humanity,
            hunger: character.hunger,
            attributes: character.attributes,
            skills: character.skills
          }),
          worldState: chronicle.world_state
        })
      });

      await base44.entities.WorldEvent.update(eventId, {
        player_choice: choice,
        status: 'resolved'
      });

      await base44.entities.Chronicle.update(chronicle.id, {
        active_world_event_id: null
      });

      setActiveWorldEvent(null);

      await new Promise(resolve => setTimeout(resolve, 2000));

      const updatedConv = await base44.agents.getConversation(chronicle.conversation_id);

      if (updatedConv && updatedConv.messages) {
        const lastMessage = updatedConv.messages[updatedConv.messages.length - 1];

        if (lastMessage && lastMessage.role === 'assistant') {
          try {
            const parsed = JSON.parse(lastMessage.content);
            if (parsed.statUpdates) {
              await applyStatUpdates(parsed.statUpdates);
            }
            if (parsed.worldStateChanges) {
              await updateWorldState(parsed.worldStateChanges);
            }
            if (parsed.outcomes) {
              setSuggestedActions(parsed.outcomes);
            }
          } catch (e) {
            setSuggestedActions([]);
          }
        }
      }

    } catch (error) {
      console.error("Error handling world event choice:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateWorldState = async (changes) => {
    try {
      const currentState = chronicle.world_state || {
        inquisition_activity: 3,
        masquerade_threat: 2,
        political_tension: 5,
        supernatural_activity: 4
      };

      const newState = { ...currentState };

      if (changes.inquisition_activity !== undefined) {
        newState.inquisition_activity = Math.max(0, Math.min(10, currentState.inquisition_activity + changes.inquisition_activity));
      }
      if (changes.masquerade_threat !== undefined) {
        newState.masquerade_threat = Math.max(0, Math.min(10, currentState.masquerade_threat + changes.masquerade_threat));
      }
      if (changes.political_tension !== undefined) {
        newState.political_tension = Math.max(0, Math.min(10, currentState.political_tension + changes.political_tension));
      }
      if (changes.supernatural_activity !== undefined) {
        newState.supernatural_activity = Math.max(0, Math.min(10, currentState.supernatural_activity + changes.supernatural_activity));
      }

      await base44.entities.Chronicle.update(chronicle.id, {
        world_state: newState
      });

    } catch (error) {
      console.error("Error updating world state:", error);
    }
  };

  const loadConversation = async () => {
    try {
      setIsLoadingConversation(true);

      const conversation = await base44.agents.getConversation(chronicle.conversation_id);
      conversationRef.current = conversation;

      if (conversation && conversation.messages && Array.isArray(conversation.messages) && conversation.messages.length > 0) {
        setMessages(conversation.messages);

        const lastAiMessage = [...conversation.messages].reverse().find(m => m.role === 'assistant');
        if (lastAiMessage?.content) {
          console.log("🔍 Last AI message:", lastAiMessage.content.substring(0, 200));
          try {
            const parsed = JSON.parse(lastAiMessage.content);
            console.log("✅ Parsed successfully:", parsed);
            if (parsed.diceRollChallenge) {
              setPendingDiceRoll(parsed.diceRollChallenge);
            }
            if (parsed.outcomes && Array.isArray(parsed.outcomes) && parsed.outcomes.length > 0) {
              console.log("✅ Setting outcomes from loadConversation:", parsed.outcomes);
              setSuggestedActions(parsed.outcomes);
            } else {
              // Se não tem outcomes no JSON, fornece opções genéricas
              setSuggestedActions(["Continuar", "Explorar", "Procurar por sangue"]);
            }
          } catch (e) {
            console.error("❌ Failed to parse last message:", e);
            // Narrador enviou texto puro - fornece opções genéricas
            setSuggestedActions(["Continuar", "Explorar ao redor", "Procurar abrigo"]);
          }
        }
      } else {
        setMessages([]);
        setSuggestedActions(["Observar ao redor", "Começar a noite", "Explorar"]);
      }

      setConversationMode(chronicle.conversation_mode || "narrator");
      setCurrentNPCId(chronicle.active_npc_id || null);

      const unsubscribe = base44.agents.subscribeToConversation(chronicle.conversation_id, (data) => {
        if (data && data.messages && Array.isArray(data.messages)) {
          setMessages(data.messages);

          const lastMsg = data.messages[data.messages.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
            console.log("🔔 New message from subscription:", lastMsg.content.substring(0, 200));
            try {
              const parsed = JSON.parse(lastMsg.content);
              console.log("✅ Subscription parsed:", parsed);
              if (parsed.outcomes && Array.isArray(parsed.outcomes) && parsed.outcomes.length > 0) {
                console.log("✅ Setting outcomes from subscription:", parsed.outcomes);
                setSuggestedActions(parsed.outcomes);
              } else {
                setSuggestedActions(["Continuar", "Explorar", "Procurar por sangue"]);
              }
              if (parsed.diceRollChallenge) {
                setPendingDiceRoll(parsed.diceRollChallenge);
              }
            } catch (e) {
              console.error("❌ Subscription parse error:", e);
              // Fornece opções genéricas se não conseguir parsear
              setSuggestedActions(["Continuar", "Explorar ao redor", "Procurar abrigo"]);
            }
          }
        }
      });

      setIsLoadingConversation(false);
      return () => {
        if (unsubscribe) unsubscribe();
      };
    } catch (error) {
      console.error("Error loading conversation:", error);
      setIsLoadingConversation(false);
      setMessages([]);
      setSuggestedActions(["Começar a história", "Observar ao redor"]);
    }
  };

  const handleTalkToNPC = async (npcId) => {
    try {
      if (npcId === null) {
        setCurrentNPCId(null);
        setConversationMode("narrator");
        await base44.entities.Chronicle.update(chronicle.id, {
          conversation_mode: "narrator",
          active_npc_id: null
        });
      } else {
        setCurrentNPCId(npcId);
        setConversationMode("npc");
        await base44.entities.Chronicle.update(chronicle.id, {
          conversation_mode: "npc",
          active_npc_id: npcId
        });
      }
      setSuggestedActions([]);
    } catch (error) {
      console.error("Error changing conversation mode:", error);
    }
  };

  const advanceTimeOfDay = async (currentTurn) => {
    try {
      let newTimeOfDay = chronicle.time_of_day;

      if (chronicle.time_of_day === 'night' && currentTurn % (TURNS_PER_NIGHT + TURNS_PER_DUSK) === TURNS_PER_NIGHT) {
        newTimeOfDay = 'dusk';
      } else if (chronicle.time_of_day === 'dusk') {
        newTimeOfDay = 'day';
      } else if (chronicle.time_of_day === 'day' && currentTurn % 2 === 0) {
        newTimeOfDay = 'night';
      }

      if (newTimeOfDay !== chronicle.time_of_day) {
        await base44.entities.Chronicle.update(chronicle.id, {
          time_of_day: newTimeOfDay
        });

        if (newTimeOfDay === 'day') {
          await applySunDamage();
        }
      }
    } catch (error) {
      console.error("Error advancing time:", error);
    }
  };

  const applySunDamage = async () => {
    try {
      const newHealth = Math.max(0, character.health - 3);
      await base44.entities.Character.update(character.id, {
        health: newHealth
      });
      await refreshCharacter();
    } catch (error) {
      console.error("Error applying sun damage:", error);
    }
  };

  const applyHungerIncrease = async () => {
    try {
      if (chronicle.turn_count % 3 === 0 && character.hunger < 5) {
        const newHunger = Math.min(5, character.hunger + 1);
        await base44.entities.Character.update(character.id, {
          hunger: newHunger
        });
        await refreshCharacter();
      }
    } catch (error) {
      console.error("Error applying hunger:", error);
    }
  };

  const sendAction = async (action) => {
    if (!action || !action.trim() || isProcessing || activeWorldEvent) return;

    setIsProcessing(true);
    setInputValue("");
    setSuggestedActions([]);
    setPendingDiceRoll(null);

    try {
      const conversation = conversationRef.current;

      if (!conversation) {
        throw new Error("Conversa não carregada");
      }

      const characterSnapshot = {
        health: character.health,
        max_health: character.max_health,
        willpower: character.willpower,
        max_willpower: character.max_willpower,
        humanity: character.humanity,
        hunger: character.hunger,
        attributes: character.attributes,
        skills: character.skills
      };

      let npcData = null;
      if (conversationMode === "npc" && currentNPCId) {
        const npc = npcs.find(n => n.id === currentNPCId);
        if (npc) {
          npcData = {
            id: npc.id,
            name: npc.name,
            personality: npc.personality,
            motivations: npc.motivations,
            knowledge: npc.knowledge,
            relationship: npc.relationship_to_player,
            trust_level: npc.trust_level,
            current_mood: npc.current_mood,
            secrets: npc.secrets
          };
        }
      }

      console.log("📤 Sending action:", action);

      await base44.agents.addMessage(conversation, {
        role: "user",
        content: JSON.stringify({
          playerAction: action,
          characterStats: JSON.stringify(characterSnapshot),
          worldDescription: world.generated_details,
          worldState: chronicle.world_state,
          timeOfDay: chronicle.time_of_day,
          turnCount: chronicle.turn_count,
          conversationMode: conversationMode,
          currentNPC: npcData,
          narrativeStyle: chronicle.narrative_style || "balanced"
        })
      });

      let attempts = 0;
      let lastMessage = null;

      while (attempts < 15) {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const updatedConv = await base44.agents.getConversation(chronicle.conversation_id);

        if (updatedConv && updatedConv.messages && Array.isArray(updatedConv.messages)) {
          const potentialLastMessage = updatedConv.messages[updatedConv.messages.length - 1];

          if (potentialLastMessage &&
              potentialLastMessage.role === 'assistant' &&
              potentialLastMessage !== lastMessage) {
            lastMessage = potentialLastMessage;
            break;
          }
        }

        attempts++;
      }

      if (lastMessage && lastMessage.role === 'assistant') {
        console.log("📥 Received response:", lastMessage.content.substring(0, 300));
        
        try {
          const parsed = JSON.parse(lastMessage.content);
          console.log("✅ Successfully parsed JSON:", parsed);

          if (parsed.statUpdates) {
            console.log("📊 Applying stat updates:", parsed.statUpdates);
            await applyStatUpdates(parsed.statUpdates);
          } else {
            console.log("⚠️ No statUpdates in response");
          }

          if (parsed.worldStateChanges) {
            await updateWorldState(parsed.worldStateChanges);
          }

          if (parsed.worldEvent) {
            const user = await base44.auth.me();
            const newEvent = await base44.entities.WorldEvent.create({
              ...parsed.worldEvent,
              world_id: world.id,
              chronicle_id: chronicle.id,
              trigger_turn: chronicle.turn_count,
              user_id: user.email,
              status: 'active'
            });

            await base44.entities.Chronicle.update(chronicle.id, {
              active_world_event_id: newEvent.id,
              last_event_turn: chronicle.turn_count
            });

            setActiveWorldEvent(newEvent);
          }

          if (parsed.npcUpdate && currentNPCId) {
            await updateNPC(currentNPCId, parsed.npcUpdate);
          }

          if (parsed.newNPCs && Array.isArray(parsed.newNPCs)) {
            for (const npcData of parsed.newNPCs) {
              await createNPC(npcData);
            }
          }

          if (parsed.activeNPCs && Array.isArray(parsed.activeNPCs)) {
            await base44.entities.Chronicle.update(chronicle.id, {
              active_npcs: parsed.activeNPCs
            });
          }

          if (parsed.diceRollChallenge) {
            setPendingDiceRoll(parsed.diceRollChallenge);
          }

          if (parsed.outcomes && Array.isArray(parsed.outcomes) && parsed.outcomes.length > 0) {
            console.log("✅ Setting outcomes from sendAction:", parsed.outcomes);
            setSuggestedActions(parsed.outcomes);
          } else {
            console.log("⚠️ No outcomes in response - using generic options");
            setSuggestedActions(["Continuar", "Explorar ao redor", "Procurar por sangue"]);
          }
        } catch (e) {
          console.error("❌ Error parsing response:", e);
          console.log("📄 Raw content:", lastMessage.content);
          // Narrador enviou texto puro - fornece opções genéricas mas o texto aparece
          setSuggestedActions(["Continuar explorando", "Procurar abrigo", "Buscar por sangue"]);
        }
      } else {
        console.log("⚠️ No valid response received after 15 attempts");
        setSuggestedActions(["Tentar novamente", "Explorar", "Continuar"]);
      }

      const newTurn = chronicle.turn_count + 1;
      await base44.entities.Chronicle.update(chronicle.id, {
        turn_count: newTurn
      });

      await advanceTimeOfDay(newTurn);
      await applyHungerIncrease();
      await checkForWorldEvent(newTurn);
      await loadNPCs();

    } catch (error) {
      console.error("Error sending action:", error);
      setSuggestedActions(["Tentar novamente"]);
    } finally {
      setIsProcessing(false);
    }
  };

  const createNPC = async (npcData) => {
    try {
      await base44.entities.NPC.create({
        ...npcData,
        world_id: world.id,
        chronicle_id: chronicle.id
      });
    } catch (error) {
      console.error("Error creating NPC:", error);
    }
  };

  const updateNPC = async (npcId, updates) => {
    try {
      const npc = npcs.find(n => n.id === npcId);
      if (!npc) return;

      const updateData = {};
      if (updates.trust_level !== undefined) {
        updateData.trust_level = Math.max(-10, Math.min(10, (npc.trust_level || 0) + updates.trust_level));
      }
      if (updates.relationship !== undefined) {
        updateData.relationship_to_player = updates.relationship;
      }
      if (updates.current_mood !== undefined) {
        updateData.current_mood = updates.current_mood;
      }

      if (Object.keys(updateData).length > 0) {
        await base44.entities.NPC.update(npcId, updateData);
      }
    } catch (error) {
      console.error("Error updating NPC:", error);
    }
  };

  const applyStatUpdates = async (updates) => {
    try {
      const newStats = {};
      let hasChanges = false;

      const maxHealth = character.max_health || 10;
      const maxWillpower = character.max_willpower || 10;

      if (updates.health !== undefined) {
        newStats.health = Math.max(0, Math.min(maxHealth, updates.health));
        hasChanges = true;
      }

      if (updates.willpower !== undefined) {
        newStats.willpower = Math.max(0, Math.min(maxWillpower, updates.willpower));
        hasChanges = true;
      }

      if (updates.humanity !== undefined) {
        newStats.humanity = Math.max(0, Math.min(10, updates.humanity));
        hasChanges = true;
      }

      if (updates.hunger !== undefined) {
        newStats.hunger = Math.max(0, Math.min(5, updates.hunger));
        hasChanges = true;
      }

      if (hasChanges) {
        console.log("💾 Updating character stats:", newStats);
        await base44.entities.Character.update(character.id, newStats);
        await refreshCharacter();
      }
    } catch (error) {
      console.error("Error applying stat updates:", error);
    }
  };

  const handleDiceRollComplete = async (successes) => {
    setPendingDiceRoll(null);
    setIsProcessing(true);

    try {
      const conversation = conversationRef.current;

      await base44.agents.addMessage(conversation, {
        role: "user",
        content: JSON.stringify({
          diceRollResult: successes,
          characterStats: JSON.stringify({
            health: character.health,
            willpower: character.willpower,
            humanity: character.humanity,
            hunger: character.hunger,
            attributes: character.attributes,
            skills: character.skills
          }),
          worldDescription: world.generated_details,
          worldState: chronicle.world_state,
          timeOfDay: chronicle.time_of_day,
          turnCount: chronicle.turn_count,
          conversationMode: conversationMode,
          narrativeStyle: chronicle.narrative_style || "balanced"
        })
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      const updatedConv = await base44.agents.getConversation(chronicle.conversation_id);

      if (updatedConv && updatedConv.messages && Array.isArray(updatedConv.messages)) {
        const lastMessage = updatedConv.messages[updatedConv.messages.length - 1];

        if (lastMessage && lastMessage.role === 'assistant') {
          try {
            const parsed = JSON.parse(lastMessage.content);
            if (parsed.statUpdates) {
              await applyStatUpdates(parsed.statUpdates);
            }
            if (parsed.worldStateChanges) {
              await updateWorldState(parsed.worldStateChanges);
            }
            if (parsed.outcomes && Array.isArray(parsed.outcomes)) {
              setSuggestedActions(parsed.outcomes);
            }
          } catch (e) {
            setSuggestedActions([]);
          }
        }
      }

    } catch (error) {
      console.error("Error sending dice result:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getCurrentNPC = () => {
    if (!currentNPCId) return null;
    return npcs.find(n => n.id === currentNPCId);
  };

  const currentNPC = getCurrentNPC();

  if (isLoadingConversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-gray-400">Carregando conversa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 space-y-4">
        {conversationMode === "npc" && currentNPC && (
          <Alert className="bg-purple-950 border-purple-700">
            <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-purple-300">
                Conversando com <strong>{currentNPC.name}</strong>
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleTalkToNPC(null)}
                className="border-purple-700 text-purple-300 hover:bg-purple-900"
              >
                <ArrowLeft className="w-3 h-3 mr-1" />
                Voltar ao Narrador
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {messages.length === 0 && !isProcessing && (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">A crônica está prestes a começar...</p>
            <p className="text-sm text-gray-500">Escolha uma ação abaixo para começar</p>
          </div>
        )}

        {messages.map((message, index) => (
          <StoryMessage
            key={index}
            message={message}
            npcName={conversationMode === "npc" ? currentNPC?.name : null}
            character={character}
            chronicle={chronicle}
          />
        ))}

        {activeWorldEvent && (
          <WorldEventCard
            event={activeWorldEvent}
            onChoice={handleWorldEventChoice}
            isProcessing={isProcessing}
          />
        )}

        {pendingDiceRoll && !activeWorldEvent && (
          <DiceRollChallenge
            challenge={pendingDiceRoll}
            character={character}
            onComplete={handleDiceRollComplete}
          />
        )}

        {isProcessing && (
          <div className="flex items-center gap-2 text-red-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm italic">
              {conversationMode === "npc" && currentNPC
                ? `${currentNPC.name} está pensando...`
                : "O Narrador está pensando..."
              }
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {chronicle.active_npcs && chronicle.active_npcs.length > 0 && (
        <div className="border-t border-border px-4 py-3 bg-card overflow-x-hidden">
          <NPCPanel
            npcs={npcs}
            activeNPCIds={chronicle.active_npcs}
            onTalkToNPC={handleTalkToNPC}
            currentNPCId={currentNPCId}
          />
        </div>
      )}

      {suggestedActions.length > 0 && !pendingDiceRoll && !isProcessing && !activeWorldEvent && (
        <div className="border-t border-border bg-card p-4 overflow-x-hidden">
          <p className="text-xs text-gray-500 mb-3 font-semibold uppercase">Escolha sua ação:</p>
          <div className="grid grid-cols-1 gap-2">
            {suggestedActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => sendAction(action)}
                disabled={isProcessing}
                className="w-full justify-start text-left h-auto py-3 px-4 border-border hover:bg-primary/20 hover:border-primary hover:text-primary transition-all whitespace-normal break-words"
              >
                <span className="text-sm break-words">{action}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-border bg-card p-4">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendAction(inputValue)}
            placeholder={
              activeWorldEvent ? "Resolva o evento mundial primeiro..." :
              pendingDiceRoll ? "Resolva a rolagem de dados primeiro..." :
              conversationMode === "npc" && currentNPC ? `Falar com ${currentNPC.name}...` :
              "Digite sua ação..."
            }
            disabled={isProcessing || !!pendingDiceRoll || !!activeWorldEvent}
            className="flex-1 bg-secondary border-border text-foreground"
          />
          <Button
            onClick={() => sendAction(inputValue)}
            disabled={isProcessing || !inputValue.trim() || !!pendingDiceRoll || !!activeWorldEvent}
            size="icon"
            className="bg-primary hover:bg-primary/90 shadow-[0_0_10px_rgba(220,38,38,0.4)] flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
