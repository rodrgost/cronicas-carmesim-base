import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Globe, Eye, ArrowLeft, Calendar, User } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function PublicChronicles() {
  const navigate = useNavigate();
  const [chronicles, setChronicles] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [worlds, setWorlds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPublicChronicles();
  }, []);

  const loadPublicChronicles = async () => {
    try {
      setIsLoading(true);
      
      const [allChronicles, allCharacters, allWorlds] = await Promise.all([
        base44.entities.Chronicle.list(),
        base44.entities.Character.list(),
        base44.entities.World.list()
      ]);

      const publicChronicles = allChronicles.filter(c => c.is_public && c.shared_id);
      
      setChronicles(publicChronicles);
      setCharacters(allCharacters);
      setWorlds(allWorlds);
    } catch (error) {
      console.error("Error loading public chronicles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCharacterName = (characterId) => {
    const char = characters.find(c => c.id === characterId);
    return char?.name || "Personagem Desconhecido";
  };

  const getWorldName = (worldId) => {
    const world = worlds.find(w => w.id === worldId);
    return world?.name || "Mundo Desconhecido";
  };

  const handleViewChronicle = (sharedId) => {
    navigate(createPageUrl("SharedChronicle") + `?id=${sharedId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-400">Carregando crônicas públicas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Home"))}
          className="mb-4 text-gray-400 hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Início
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-8 h-8 text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
            <h1 className="font-headline text-4xl font-bold text-foreground">
              Crônicas Compartilhadas
            </h1>
          </div>
          <p className="text-gray-400">
            Explore histórias criadas por outros jogadores
          </p>
        </div>

        {chronicles.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <Globe className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Nenhuma Crônica Compartilhada
              </h3>
              <p className="text-gray-400 mb-6">
                Ainda não há crônicas públicas disponíveis para visualização
              </p>
              <Button onClick={() => navigate(createPageUrl("Home"))}>
                Voltar ao Início
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chronicles.map((chronicle) => (
              <Card
                key={chronicle.id}
                className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer"
                onClick={() => handleViewChronicle(chronicle.shared_id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-foreground text-lg">
                      {getCharacterName(chronicle.character_id)}
                    </CardTitle>
                    <Badge variant="outline" className="bg-blue-950 text-blue-300 border-blue-700 shrink-0">
                      <Globe className="w-3 h-3 mr-1" />
                      Pública
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-400">
                    {getWorldName(chronicle.world_id)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Dia {chronicle.current_day || 1}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <User className="w-4 h-4" />
                    <span>Por {chronicle.created_by?.split('@')[0] || 'Anônimo'}</span>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewChronicle(chronicle.shared_id);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Crônica
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}