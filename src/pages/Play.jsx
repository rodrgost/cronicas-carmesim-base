import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Loader2, Menu, X, User, Map, HelpCircle, ArrowLeft, Users } from "lucide-react";
import { createPageUrl } from "@/utils";
import { useTranslation } from "@/components/i18n/LanguageContext";
import StoryChat from "../components/play/StoryChat";
import CharacterSheet from "../components/play/CharacterSheet";
import InventoryPanel from "../components/inventory/InventoryPanel";
import SettingsMenu from "../components/play/SettingsMenu";
import RulesPopup from "../components/play/RulesPopup";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
// InteractiveMap removed
import NPCCard from "@/components/play/NPCCard";

export default function Play() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [character, setCharacter] = useState(null);
  const [world, setWorld] = useState(null);
  const [chronicle, setChronicle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [npcs, setNPCs] = useState([]);
  // Map state removed
  const storyChatRef = React.useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const characterId = params.get('characterId');
    if (characterId) {
      loadGameData(characterId);
    } else {
      setError(t('play.characterNotFound'));
      setIsLoading(false);
    }
  }, [location]);

  const loadGameData = async (characterId) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await base44.auth.me();
      
      const allCharacters = await base44.entities.Character.list();
      const foundCharacter = allCharacters.find(c => c.id === characterId);
      
      if (!foundCharacter) {
        setError(t('play.characterNotFound'));
        setIsLoading(false);
        return;
      }

      const allWorlds = await base44.entities.World.list();
      const foundWorld = allWorlds.find(w => w.id === foundCharacter.world_id);

      if (!foundWorld) {
        setError(t('play.worldNotFound'));
        setIsLoading(false);
        return;
      }

      const allChronicles = await base44.entities.Chronicle.list();
      let foundChronicle = allChronicles.find(c => c.character_id === characterId);

      if (!foundChronicle) {
        console.log("Creating new chronicle...");
        const conversation = await base44.agents.createConversation({
          agent_name: "story_narrator",
          metadata: {
            character_id: characterId,
            world_id: foundCharacter.world_id,
            name: `Crônica de ${foundCharacter.name}`,
            description: `Crônica em ${foundWorld.name}`
          }
        });

        foundChronicle = await base44.entities.Chronicle.create({
          character_id: characterId,
          world_id: foundCharacter.world_id,
          conversation_id: conversation.id,
          current_day: 1,
          last_rest_day: 0,
          active_npcs: [],
          conversation_mode: "narrator",
          story_log: [],
          world_state: {
            inquisition_activity: 3,
            masquerade_threat: 2,
            political_tension: 5,
            supernatural_activity: 4
          },
          narrative_style: "concise",
          user_id: user.email
        });
        console.log("Chronicle created:", foundChronicle.id);
      } else {
        console.log("Existing chronicle found:", foundChronicle.id);
      }

      setCharacter(foundCharacter);
      setWorld(foundWorld);
      setChronicle(foundChronicle);
      
      // Load NPCs for the world
      const allNPCs = await base44.entities.NPC.list();
      const worldNPCs = allNPCs.filter(n => n.world_id === foundWorld.id && n.is_active !== false);
      setNPCs(worldNPCs);
      
      // Locations loading removed
      
      setIsLoading(false);
      console.log("Game data loaded successfully");
    } catch (err) {
      console.error("Error loading game data:", err);
      setError(err.message || t('play.errorLoadingGame'));
      setIsLoading(false);
    }
  };

  const refreshCharacter = async () => {
    if (character) {
      try {
        const allCharacters = await base44.entities.Character.list();
        const updated = allCharacters.find(c => c.id === character.id);
        if (updated) {
          setCharacter(updated);
        }
      } catch (error) {
        console.error("Error refreshing character:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-400">{t('play.loadingGame')}</p>
        </div>
      </div>
    );
  }

  if (error || !character || !world || !chronicle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || t('play.errorLoadingGame')}</p>
          <Button onClick={() => navigate(createPageUrl("Home"))} variant="outline">
            {t('common.back')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-background overflow-hidden">
      <div className="flex-none border-b border-border bg-card px-3 py-2 flex items-center justify-between relative z-[200]">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("CharactersList") + `?worldId=${world.id}`)}
            className="text-gray-400 hover:text-foreground hover:bg-secondary h-8 w-8 touch-manipulation"
            title={t('play.backToCharacters')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="font-headline text-sm font-bold text-foreground leading-tight">{character.name}</h1>
            <p className="text-[10px] text-gray-400">{world.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
            <RulesPopup 
              trigger={
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-yellow-500/50 hover:bg-yellow-500/10 hover:border-yellow-500 text-yellow-400 h-8 w-8 touch-manipulation"
                    title={t('play.helpAndRules')}
                  >
                    <HelpCircle className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
              }
            />

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-purple-500/50 hover:bg-purple-500/10 hover:border-purple-500 text-purple-400 h-8 w-8 touch-manipulation"
                  title={t('charactersList.tabNPCs')}
                >
                  <Users className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-4xl max-h-[85vh] overflow-y-auto z-[250]">
                <DialogHeader>
                  <DialogTitle className="font-headline text-2xl text-foreground">{t('charactersList.tabNPCs')}</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    {t('charactersList.npcSubtitle', "Personagens do Mestre")}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="mt-6">
                  {npcs.length === 0 ? (
                    <Card className="bg-card border-border">
                      <CardContent className="py-12 text-center">
                        <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 mb-2">{t('charactersList.noNPCs')}</p>
                        <p className="text-sm text-gray-500">
                          {t('charactersList.noNPCsHelp')}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {npcs.map((npc) => (
                        <NPCCard key={npc.id} npc={npc} />
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="lg:hidden border-primary/50 hover:bg-primary/10 hover:border-primary text-primary h-8 w-8 touch-manipulation"
                  title={t('play.openCharacterSheet')}
                >
                  <User className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-96 bg-background border-border p-0 z-[250]">
                <Tabs defaultValue="character" className="h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-2 bg-secondary rounded-none">
                    <TabsTrigger value="character">{t('character.name')}</TabsTrigger>
                    <TabsTrigger value="inventory">{t('inventory.title')}</TabsTrigger>
                  </TabsList>
                  <TabsContent value="character" className="flex-1 overflow-auto p-4 mt-0">
                    <CharacterSheet
                      character={character}
                      world={world}
                      chronicle={chronicle}
                      refreshCharacter={refreshCharacter}
                      onUseDiscipline={(data) => storyChatRef.current?.handleDisciplineUsage(data)}
                    />
                  </TabsContent>
                  <TabsContent value="inventory" className="flex-1 overflow-hidden p-4 mt-0">
                    <InventoryPanel character={character} chronicle={chronicle} />
                  </TabsContent>
                </Tabs>
              </SheetContent>
            </Sheet>

            <SettingsMenu character={character} world={world} chronicle={chronicle} />
          </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <StoryChat
            ref={storyChatRef}
            character={character}
            world={world}
            chronicle={chronicle}
            refreshCharacter={refreshCharacter}
          />
        </div>

        <div className="hidden lg:flex w-80 xl:w-96 border-l border-border">
          <Tabs defaultValue="character" className="w-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 bg-secondary rounded-none">
              <TabsTrigger value="character">{t('character.name')}</TabsTrigger>
              <TabsTrigger value="inventory">{t('inventory.title')}</TabsTrigger>
            </TabsList>
            <TabsContent value="character" className="flex-1 overflow-auto p-4 mt-0">
              <CharacterSheet
                character={character}
                world={world}
                chronicle={chronicle}
                refreshCharacter={refreshCharacter}
                onUseDiscipline={(data) => storyChatRef.current?.handleDisciplineUsage(data)}
              />
            </TabsContent>
            <TabsContent value="inventory" className="flex-1 overflow-hidden p-4 mt-0">
              <InventoryPanel character={character} chronicle={chronicle} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

{/* Map dialog removed */}
    </div>
  );
}