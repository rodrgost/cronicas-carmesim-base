import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, User, Plus, ArrowLeft, Play, Trash2, Users } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createPageUrl } from "@/utils";
import { useTranslation } from "@/components/i18n/LanguageContext";
import NPCCard from "@/components/play/NPCCard";

export default function CharactersList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [worldId, setWorldId] = useState(null);
  const [world, setWorld] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [npcs, setNPCs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const wId = params.get('worldId');
    if (wId) {
      setWorldId(wId);
      loadData(wId);
    } else {
      navigate(createPageUrl("WorldsList"));
    }
  }, [location]);

  const loadData = async (wId) => {
    setIsLoading(true);
    try {
      const user = await base44.auth.me();
      
      // Load world
      const worlds = await base44.entities.World.list();
      const foundWorld = worlds.find(w => w.id === wId);
      setWorld(foundWorld);

      // Load characters
      const allCharacters = await base44.entities.Character.list();
      const worldCharacters = allCharacters.filter(c => c.world_id === wId && c.user_id === user.email);
      setCharacters(worldCharacters);
      
      // Load ALL NPCs from this world
      const allNPCs = await base44.entities.NPC.list();
      const worldNPCs = allNPCs.filter(n => n.world_id === wId && n.is_active !== false);
      
      setNPCs(worldNPCs);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCharacter = async (characterId, e) => {
    e.stopPropagation();
    try {
      // Delete all chronicles for this character
      const allChronicles = await base44.entities.Chronicle.list();
      const charChronicles = allChronicles.filter(c => c.character_id === characterId);
      for (const chron of charChronicles) {
        await base44.entities.Chronicle.delete(chron.id);
      }

      // Delete the character
      await base44.entities.Character.delete(characterId);
      
      // Reload data
      await loadData(worldId);
    } catch (error) {
      console.error("Error deleting character:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-none p-4 md:p-8 pb-4 border-b border-border bg-background/95 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("WorldsList"))}
            className="mb-4 text-gray-400 hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('charactersList.backToWorlds')}
          </Button>
          
          {world && (
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-8 h-8 text-primary drop-shadow-[0_0_10px_rgba(220,38,38,0.6)]" />
                  <div>
                    <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
                      {t('charactersList.title')}
                    </h1>
                    <p className="text-red-300 text-lg">{world.name}</p>
                  </div>
                </div>
                <p className="text-gray-400">
                  {t('charactersList.subtitle')}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate(createPageUrl("CreateCharacter") + `?worldId=${worldId}`)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('charactersList.newCharacter')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto pb-8">
          <Tabs defaultValue="characters" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary mb-6">
            <TabsTrigger value="characters" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {t('charactersList.tabCharacters')} ({characters.length})
            </TabsTrigger>
            <TabsTrigger value="npcs" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {t('charactersList.tabNPCs')} ({npcs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="characters">
            {characters.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center">
                  <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">{t('charactersList.noCharacters')}</p>
                  <Button
                    onClick={() => navigate(createPageUrl("CreateCharacter") + `?worldId=${worldId}`)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('charactersList.createFirstCharacter')}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {characters.map((character) => {
                  const maxHealth = character.max_health || 10;
                  const maxWillpower = character.max_willpower || 10;
                  
                  return (
                    <Card 
                      key={character.id}
                      className="bg-card border-border hover:border-primary/50 transition-all group relative overflow-hidden"
                    >
                      <div className="p-4 md:p-5 pb-0 flex gap-4">
                        {/* Portrait */}
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-secondary rounded-md overflow-hidden flex-shrink-0 border border-border shadow-sm">
                          {character.portrait_url ? (
                            <img 
                              src={character.portrait_url} 
                              alt={character.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-secondary text-muted-foreground">
                              <User className="w-8 h-8 md:w-10 md:h-10 opacity-50" />
                            </div>
                          )}
                        </div>

                        {/* Header Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div className="pr-8">
                              <CardTitle className="font-headline text-lg md:text-xl text-foreground group-hover:text-primary transition-colors truncate">
                                {character.name}
                              </CardTitle>
                              <CardDescription className="text-gray-400 text-xs md:text-sm truncate mt-1">
                                {character.concept}
                              </CardDescription>
                            </div>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-2 right-2 h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-950/30"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-card border-border">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-foreground">{t('charactersList.deleteTitle')}</AlertDialogTitle>
                                  <AlertDialogDescription className="text-gray-400">
                                    {t('charactersList.deleteDescription', { name: character.name })}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="border-border bg-secondary text-foreground">{t('common.cancel')}</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={(e) => handleDeleteCharacter(character.id, e)}
                                    className="bg-red-900 hover:bg-red-800 text-foreground"
                                  >
                                    {t('common.delete')}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                          <Badge variant="outline" className="mt-2 text-primary border-primary bg-primary/10 text-xs">
                            {character.clan}
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="space-y-4 pt-4">
                        {/* Status Bars */}
                        <div className="space-y-3">
                          {/* Health */}
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-400 font-medium">{t('character.health')}</span>
                              <span className="text-gray-400">{character.health}/{maxHealth}</span>
                            </div>
                            <Progress 
                              value={(character.health / maxHealth) * 100} 
                              className="h-2 bg-secondary [&>*]:bg-red-700" 
                            />
                          </div>

                          {/* Willpower */}
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-400 font-medium">{t('character.willpower')}</span>
                              <span className="text-gray-400">{character.willpower}/{maxWillpower}</span>
                            </div>
                            <Progress 
                              value={(character.willpower / maxWillpower) * 100} 
                              className="h-2 bg-secondary [&>*]:bg-blue-600" 
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            {/* Humanity */}
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-400 font-medium">{t('character.humanity')}</span>
                                <span className="text-gray-400">{character.humanity}/10</span>
                              </div>
                              <Progress 
                                value={(character.humanity / 10) * 100} 
                                className="h-2 bg-secondary [&>*]:bg-purple-500" 
                              />
                            </div>

                            {/* Hunger */}
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-400 font-medium">{t('character.hunger')}</span>
                                <span className="text-gray-400">{character.hunger}/5</span>
                              </div>
                              <Progress 
                                value={(character.hunger / 5) * 100} 
                                className="h-2 bg-secondary [&>*]:bg-orange-600" 
                              />
                            </div>
                          </div>
                        </div>

                        {/* Play Button */}
                        <Button
                          onClick={() => navigate(createPageUrl("Play") + `?characterId=${character.id}`)}
                          className="w-full bg-primary hover:bg-primary/90 mt-2"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {t('charactersList.play')}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="npcs">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {npcs.map((npc) => (
                  <NPCCard key={npc.id} npc={npc} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
}