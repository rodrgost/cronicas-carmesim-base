import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, User, Plus, ArrowLeft, Play, Trash2, Users, Eye, Heart } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createPageUrl } from "@/utils";

const RELATIONSHIP_CONFIG = {
  unknown: { color: "text-gray-400", bg: "bg-gray-500/20", label: "Desconhecido" },
  ally: { color: "text-green-500", bg: "bg-green-500/20", label: "Aliado" },
  neutral: { color: "text-blue-400", bg: "bg-blue-500/20", label: "Neutro" },
  suspicious: { color: "text-yellow-500", bg: "bg-yellow-500/20", label: "Desconfiado" },
  hostile: { color: "text-red-500", bg: "bg-red-500/20", label: "Hostil" },
  friend: { color: "text-pink-500", bg: "bg-pink-500/20", label: "Amigo" },
  enemy: { color: "text-red-600", bg: "bg-red-600/20", label: "Inimigo" },
  mentor: { color: "text-purple-500", bg: "bg-purple-500/20", label: "Mentor" },
  rival: { color: "text-orange-500", bg: "bg-orange-500/20", label: "Rival" }
};

function NPCCard({ npc }) {
  const relationConfig = RELATIONSHIP_CONFIG[npc.relationship_to_player] || RELATIONSHIP_CONFIG.unknown;
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="bg-card/50 border-border hover:border-purple-500/50 transition-all cursor-pointer group relative">
          <CardHeader>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-purple-400" />
                  <CardTitle className="font-headline text-lg text-foreground group-hover:text-purple-400 transition-colors">
                    {npc.name}
                  </CardTitle>
                </div>
                {npc.role && (
                  <CardDescription className="text-gray-400 text-sm italic">
                    {npc.role}
                  </CardDescription>
                )}
              </div>
              <Badge variant="outline" className="text-purple-400 border-purple-500 bg-purple-500/10">
                NPC
              </Badge>
            </div>
            
            {npc.clan && (
              <Badge variant="outline" className="w-fit text-primary border-primary/50 bg-primary/10">
                {npc.clan}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {npc.appearance && (
              <p className="text-sm text-gray-400 line-clamp-2">{npc.appearance}</p>
            )}
            
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded text-xs font-semibold ${relationConfig.bg} ${relationConfig.color}`}>
                {relationConfig.label}
              </div>
              
              {npc.trust_level !== undefined && (
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    npc.trust_level > 3 ? 'border-green-500 text-green-500' :
                    npc.trust_level < -3 ? 'border-red-500 text-red-500' :
                    'border-gray-500 text-gray-400'
                  }`}
                >
                  Confiança: {npc.trust_level > 0 ? '+' : ''}{npc.trust_level}
                </Badge>
              )}
            </div>

            <Button
              variant="ghost"
              className="w-full text-purple-400 hover:text-purple-300 hover:bg-purple-950/30"
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver Detalhes
            </Button>
          </CardContent>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-purple-400" />
            <div>
              <DialogTitle className="font-headline text-2xl text-foreground">{npc.name}</DialogTitle>
              {npc.role && (
                <DialogDescription className="text-purple-400 italic">{npc.role}</DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {npc.clan && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Clã/Tipo</h3>
              <Badge variant="outline" className="text-primary border-primary/50 bg-primary/10">
                {npc.clan}
              </Badge>
            </div>
          )}
          
          {npc.appearance && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Aparência</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{npc.appearance}</p>
            </div>
          )}
          
          {npc.personality && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Personalidade</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{npc.personality}</p>
            </div>
          )}
          
          {npc.motivations && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Motivações</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{npc.motivations}</p>
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Relacionamento</h3>
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded text-sm font-semibold ${relationConfig.bg} ${relationConfig.color}`}>
                {relationConfig.label}
              </div>
              {npc.trust_level !== undefined && (
                <Badge 
                  variant="outline" 
                  className={`${
                    npc.trust_level > 3 ? 'border-green-500 text-green-500' :
                    npc.trust_level < -3 ? 'border-red-500 text-red-500' :
                    'border-gray-500 text-gray-400'
                  }`}
                >
                  <Heart className="w-3 h-3 mr-1" />
                  Confiança: {npc.trust_level > 0 ? '+' : ''}{npc.trust_level}
                </Badge>
              )}
            </div>
          </div>
          
          {npc.knowledge && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Conhecimento</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{npc.knowledge}</p>
            </div>
          )}
          
          {npc.current_mood && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Humor Atual</h3>
              <p className="text-gray-300 text-sm italic">{npc.current_mood}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CharactersList() {
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
      
      // Load NPCs from this world
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
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("WorldsList"))}
            className="mb-4 text-gray-400 hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Mundos
          </Button>
          
          {world && (
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-8 h-8 text-primary drop-shadow-[0_0_10px_rgba(220,38,38,0.6)]" />
                  <div>
                    <h1 className="font-headline text-4xl font-bold text-foreground">
                      Personagens & NPCs
                    </h1>
                    <p className="text-red-300 text-lg">{world.name}</p>
                  </div>
                </div>
                <p className="text-gray-400">
                  Seus personagens jogáveis e NPCs descobertos nas crônicas
                </p>
              </div>
              
              <Button
                onClick={() => navigate(createPageUrl("CreateCharacter") + `?worldId=${worldId}`)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Personagem
              </Button>
            </div>
          )}
        </div>

        <Tabs defaultValue="characters" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary mb-6">
            <TabsTrigger value="characters" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Personagens ({characters.length})
            </TabsTrigger>
            <TabsTrigger value="npcs" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              NPCs ({npcs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="characters">
            {characters.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center">
                  <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">Você ainda não criou nenhum personagem neste mundo</p>
                  <Button
                    onClick={() => navigate(createPageUrl("CreateCharacter") + `?worldId=${worldId}`)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Personagem
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
                      className="bg-card border-border hover:border-primary/50 transition-all group relative"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <CardTitle className="font-headline text-xl text-foreground group-hover:text-primary transition-colors">
                              {character.name}
                            </CardTitle>
                            <CardDescription className="text-gray-400 text-sm">
                              {character.concept}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="text-primary border-primary bg-primary/10">
                            {character.clan}
                          </Badge>
                        </div>
                        
                        {/* Delete Button */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 hover:bg-red-950/30"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card border-border">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-foreground">Deletar Personagem?</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-400">
                                Isso irá deletar permanentemente "{character.name}" e todas as crônicas associadas. Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-border bg-secondary text-foreground">Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={(e) => handleDeleteCharacter(character.id, e)}
                                className="bg-red-900 hover:bg-red-800 text-foreground"
                              >
                                Deletar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Status */}
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-400">Vitalidade</span>
                              <span className="text-gray-400">{character.health}/{maxHealth}</span>
                            </div>
                            <Progress value={(character.health / maxHealth) * 100} className="h-1.5" />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-400">Força de Vontade</span>
                              <span className="text-gray-400">{character.willpower}/{maxWillpower}</span>
                            </div>
                            <Progress value={(character.willpower / maxWillpower) * 100} className="h-1.5" />
                          </div>
                          <div className="flex gap-2 text-xs">
                            <Badge variant="outline" className="border-purple-500 text-purple-400">
                              Humanidade: {character.humanity}
                            </Badge>
                            <Badge variant="outline" className="border-red-500 text-red-400">
                              Fome: {character.hunger}
                            </Badge>
                          </div>
                        </div>

                        {/* Play Button */}
                        <Button
                          onClick={() => navigate(createPageUrl("Play") + `?characterId=${character.id}`)}
                          className="w-full bg-primary hover:bg-primary/90"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Jogar
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
                  <p className="text-gray-400 mb-2">Nenhum NPC descoberto ainda</p>
                  <p className="text-sm text-gray-500">
                    NPCs aparecerão aqui conforme você os encontra durante suas crônicas
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
  );
}