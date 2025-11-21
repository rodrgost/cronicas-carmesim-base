import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Loader2, Heart, Brain, Skull, Droplet, ArrowLeft, Calendar, Users, Globe } from "lucide-react";
import { createPageUrl } from "@/utils";
import StoryMessage from "../components/play/StoryMessage";

export default function SharedChronicle() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chronicle, setChronicle] = useState(null);
  const [character, setCharacter] = useState(null);
  const [world, setWorld] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [npcs, setNPCs] = useState([]);

  useEffect(() => {
    loadSharedChronicle();
  }, [location]);

  const loadSharedChronicle = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams(location.search);
      const sharedId = params.get('id');

      if (!sharedId) {
        setError("Link de compartilhamento inválido");
        setIsLoading(false);
        return;
      }

      // Buscar todas as crônicas (incluindo públicas devido ao RLS)
      const allChronicles = await base44.entities.Chronicle.list();
      const sharedChronicle = allChronicles.find(c => c.shared_id === sharedId && c.is_public === true);

      if (!sharedChronicle) {
        setError("Crônica não encontrada ou não está mais compartilhada");
        setIsLoading(false);
        return;
      }

      // Buscar dados relacionados
      const [allCharacters, allWorlds, allNPCs] = await Promise.all([
        base44.entities.Character.list(),
        base44.entities.World.list(),
        base44.entities.NPC.list()
      ]);

      const char = allCharacters.find(c => c.id === sharedChronicle.character_id);
      const wld = allWorlds.find(w => w.id === sharedChronicle.world_id);
      
      if (!char || !wld) {
        setError("Dados da crônica incompletos");
        setIsLoading(false);
        return;
      }

      // Buscar conversa
      let conv = null;
      try {
        conv = await base44.agents.getConversation(sharedChronicle.conversation_id);
      } catch (err) {
        console.warn("Could not load conversation:", err);
        conv = { messages: [] };
      }

      // Filtrar NPCs da crônica
      const chronicleNPCs = allNPCs.filter(npc => 
        npc.chronicle_id === sharedChronicle.id || npc.world_id === sharedChronicle.world_id
      );

      setChronicle(sharedChronicle);
      setCharacter(char);
      setWorld(wld);
      setConversation(conv);
      setNPCs(chronicleNPCs);
      setIsLoading(false);
    } catch (err) {
      console.error("Error loading shared chronicle:", err);
      setError("Erro ao carregar crônica compartilhada");
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-400">Carregando crônica compartilhada...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="bg-card border-border max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-red-400">{error}</p>
            <Button onClick={() => navigate(createPageUrl("Home"))} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const maxHealth = character.max_health || 10;
  const maxWillpower = character.max_willpower || 10;
  const currentDay = chronicle.current_day || 1;
  const daysSinceRest = currentDay - (chronicle.last_rest_day || 0);
  const messages = conversation?.messages || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("PublicChronicles"))}
          className="mb-4 text-gray-400 hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar às Crônicas Públicas
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="font-headline text-3xl font-bold text-foreground">
              Crônica Compartilhada
            </h1>
            <p className="text-sm text-gray-400">Somente leitura</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Story Content */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">História</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">Esta crônica ainda não começou</p>
                ) : (
                  messages.map((message, index) => (
                    <StoryMessage
                      key={index}
                      message={message}
                      character={character}
                      chronicle={chronicle}
                    />
                  ))
                )}
              </CardContent>
            </Card>

            {/* NPCs */}
            {npcs.length > 0 && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    NPCs da Crônica ({npcs.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {npcs.map((npc) => (
                      <div key={npc.id} className="p-3 bg-secondary rounded-lg border border-border">
                        <h4 className="font-semibold text-foreground">{npc.name}</h4>
                        <p className="text-xs text-gray-400">{npc.clan} • {npc.role}</p>
                        <p className="text-sm text-gray-300 mt-2 line-clamp-2">{npc.personality}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Character Sheet */}
          <div className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="text-center space-y-2">
                  <h2 className="font-headline text-2xl font-bold text-foreground">{character.name}</h2>
                  <p className="text-sm text-gray-400">{character.concept}</p>
                  <Badge variant="outline" className="text-primary border-primary">
                    {character.clan}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Day */}
                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-semibold text-foreground">Dia {currentDay}</span>
                  </div>
                  {daysSinceRest > 2 && (
                    <Badge variant="destructive" className="text-xs">Exausto</Badge>
                  )}
                </div>

                <Separator className="bg-border" />

                {/* Stats */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium text-foreground">Vitalidade</span>
                      </div>
                      <span className="text-sm text-gray-400">{character.health} / {maxHealth}</span>
                    </div>
                    <Progress value={(character.health / maxHealth) * 100} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-foreground">Força de Vontade</span>
                      </div>
                      <span className="text-sm text-gray-400">{character.willpower} / {maxWillpower}</span>
                    </div>
                    <Progress value={(character.willpower / maxWillpower) * 100} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Skull className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium text-foreground">Humanidade</span>
                      </div>
                      <span className="text-sm text-gray-400">{character.humanity} / 10</span>
                    </div>
                    <Progress value={character.humanity * 10} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-foreground">Fome</span>
                      </div>
                      <span className="text-sm text-gray-400">{character.hunger} / 5</span>
                    </div>
                    <Progress value={character.hunger * 20} className="h-2" />
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* World Info */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Mundo</h3>
                  <p className="text-sm font-bold text-primary">{world.name}</p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-3">{world.player_description}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}