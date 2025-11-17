
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, Menu, ArrowLeft } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import CharacterSheet from "../components/play/CharacterSheet";
import StoryChat from "../components/play/StoryChat";
import { ThemeToggle } from "../components/ThemeToggle";

export default function Play() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [character, setCharacter] = useState(null);
  const [world, setWorld] = useState(null);
  const [chronicle, setChronicle] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const charId = params.get('characterId');
    if (charId) {
      loadGameData(charId);
    } else {
      setError("ID de personagem não encontrado");
      setIsLoading(false);
    }
  }, [location]);

  const loadGameData = async (charId) => {
    try {
      setError(null);
      console.log("Loading game data for character:", charId);
      
      const user = await base44.auth.me();
      console.log("User loaded:", user.email);
      
      // Load character
      const characters = await base44.entities.Character.list();
      console.log("Characters loaded:", characters.length);
      
      const char = characters.find(c => c.id === charId);
      
      if (!char) {
        setError("Personagem não encontrado");
        setIsLoading(false);
        return;
      }
      
      console.log("Character found:", char.name);
      setCharacter(char);

      // Load world
      const worlds = await base44.entities.World.list();
      console.log("Worlds loaded:", worlds.length);
      
      const w = worlds.find(w => w.id === char.world_id);
      
      if (!w) {
        setError("Mundo não encontrado");
        setIsLoading(false);
        return;
      }
      
      console.log("World found:", w.name);
      setWorld(w);

      // Check for existing chronicle
      const chronicles = await base44.entities.Chronicle.list();
      console.log("Chronicles loaded:", chronicles.length);
      
      let chron = chronicles.find(c => c.character_id === charId);

      if (!chron) {
        console.log("Creating new chronicle...");
        
        try {
          // Create conversation
          console.log("Creating conversation with agent...");
          const conversation = await base44.agents.createConversation({
            agent_name: "story_narrator",
            metadata: {
              name: `Crônica de ${char.name}`,
              description: `Crônica em ${w.name}`
            }
          });
          
          console.log("Conversation created:", conversation.id);

          // Create chronicle record
          console.log("Creating chronicle record...");
          chron = await base44.entities.Chronicle.create({
            character_id: charId,
            world_id: char.world_id,
            conversation_id: conversation.id,
            turn_count: 1,
            time_of_day: "night",
            active_npcs: [],
            conversation_mode: "narrator",
            story_log: [],
            user_id: user.email
          });
          
          console.log("Chronicle created:", chron.id);
          
          // Send initial context message with amnesia
          console.log("Sending initial message with amnesia...");
          try {
            await base44.agents.addMessage(conversation, {
              role: "user",
              content: `NEW CHRONICLE START - AMNESIA

Character: ${char.name} (${char.clan})
World: ${w.name}
Concept: ${char.concept}

CRITICAL: The character has TOTAL MEMORY LOSS and is waking up somewhere random in ${w.name}.

World context: ${w.generated_details}

CHARACTER STATS:
- Humanity: ${char.humanity}
- Hunger: ${char.hunger}

INSTRUCTIONS:
1. Choose a RANDOM atmospheric location in ${w.name} (alley, abandoned building, park, subway, rooftop, cemetery, etc.)
2. Character wakes up with NO memories - doesn't know their full name, how they became a vampire, or their past
3. They know INSTINCTIVELY: they are a vampire, need blood, avoid sunlight, have sharp senses
4. Start with a SHORT, atmospheric introduction (2-3 paragraphs maximum)
5. Describe: location, immediate sensations (Hunger, confusion, vampiric senses), brief environmental details
6. Present 3-4 initial action choices

Keep it CONCISE and ATMOSPHERIC. Let the mystery unfold naturally.

Send your response in JSON format with storyEvent and outcomes.`
            });
            console.log("Initial message sent");
          } catch (msgError) {
            console.error("Error sending initial message:", msgError);
            // Don't fail if message fails, user can start typing
          }

        } catch (err) {
          console.error("Error in chronicle creation:", err);
          throw new Error(`Falha ao criar crônica: ${err.message || 'Erro desconhecido'}`);
        }
      } else {
        console.log("Existing chronicle found:", chron.id);
      }

      setChronicle(chron);
      setIsLoading(false);
      console.log("Game data loaded successfully");
      
    } catch (error) {
      console.error("Error loading game data:", error);
      setError(error.message || "Erro desconhecido ao carregar jogo");
      setIsLoading(false);
    }
  };

  const refreshCharacter = async () => {
    if (character) {
      try {
        const characters = await base44.entities.Character.list();
        const updated = characters.find(c => c.id === character.id);
        if (updated) {
          setCharacter(updated);
        }
      } catch (error) {
        console.error("Error refreshing character:", error);
      }
    }
  };

  const handleExitGame = () => {
    if (window.confirm("Deseja sair do jogo? Seu progresso está salvo.")) {
      navigate("/");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-gray-400">Iniciando crônica...</p>
        <p className="text-gray-600 text-sm mt-2">Isso pode levar alguns segundos</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Alert variant="destructive" className="max-w-md bg-card border-red-900">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold mb-2 text-red-400">Erro ao carregar a crônica</p>
            <p className="text-sm text-gray-400 mb-4">{error}</p>
            <div className="flex gap-2">
              <Button 
                className="flex-1" 
                variant="outline"
                onClick={() => {
                  setError(null);
                  setIsLoading(true);
                  const params = new URLSearchParams(location.search);
                  const charId = params.get('characterId');
                  if (charId) loadGameData(charId);
                }}
              >
                Tentar Novamente
              </Button>
              <Button 
                className="flex-1 bg-primary" 
                onClick={() => window.location.href = "/"}
              >
                Voltar ao Início
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!character || !world || !chronicle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Fixed Header with Exit and Theme Toggle (Mobile) */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-2 flex items-center justify-between md:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExitGame}
          className="text-gray-400 hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Sair
        </Button>
        <ThemeToggle />
      </div>

      {/* Mobile Sheet for Character */}
      <div className="md:hidden fixed top-14 left-4 z-40">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-card border-border shadow-[0_0_15px_rgba(220,38,38,0.3)]">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto bg-card border-border">
            <CharacterSheet character={character} chronicle={chronicle} refreshCharacter={refreshCharacter} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden mt-14 md:mt-0">
        <StoryChat 
          character={character}
          world={world}
          chronicle={chronicle}
          refreshCharacter={refreshCharacter}
        />
      </div>

      {/* Desktop Character Sheet */}
      <div className="hidden md:flex md:flex-col w-80 lg:w-96 border-l border-border overflow-hidden bg-card shadow-[inset_5px_0_15px_rgba(0,0,0,0.3)]">
        {/* Desktop Header with Exit and Theme */}
        <div className="border-b border-border px-4 py-3 flex items-center justify-between bg-card">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExitGame}
            className="text-gray-400 hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Sair
          </Button>
          <ThemeToggle />
        </div>
        
        {/* Character Sheet Content */}
        <div className="flex-1 overflow-y-auto">
          <CharacterSheet character={character} chronicle={chronicle} refreshCharacter={refreshCharacter} />
        </div>
      </div>
    </div>
  );
}
