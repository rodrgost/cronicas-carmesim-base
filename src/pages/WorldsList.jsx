
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Map, ArrowRight, Plus, ArrowLeft, Trash2 } from "lucide-react";
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
import { createPageUrl } from "@/utils";

export default function WorldsList() {
  const navigate = useNavigate();
  const [worlds, setWorlds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWorlds();
  }, []);

  const loadWorlds = async () => {
    try {
      const user = await base44.auth.me();
      const allWorlds = await base44.entities.World.list();
      const userWorlds = allWorlds.filter(w => w.user_id === user.email);
      setWorlds(userWorlds);
    } catch (error) {
      console.error("Error loading worlds:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWorld = async (worldId, e) => {
    e.stopPropagation(); // Prevent the card's onClick from navigating
    try {
      // Delete all characters in this world
      const allCharacters = await base44.entities.Character.list();
      const worldCharacters = allCharacters.filter(c => c.world_id === worldId);
      for (const char of worldCharacters) {
        await base44.entities.Character.delete(char.id);
      }

      // Delete all chronicles in this world
      const allChronicles = await base44.entities.Chronicle.list();
      const worldChronicles = allChronicles.filter(c => c.world_id === worldId);
      for (const chron of worldChronicles) {
        await base44.entities.Chronicle.delete(chron.id);
      }

      // Delete all NPCs in this world
      const allNPCs = await base44.entities.NPC.list();
      const worldNPCs = allNPCs.filter(n => n.world_id === worldId);
      for (const npc of worldNPCs) {
        await base44.entities.NPC.delete(npc.id);
      }

      // Delete the world
      await base44.entities.World.delete(worldId);
      
      // Reload worlds
      await loadWorlds();
    } catch (error) {
      console.error("Error deleting world:", error);
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
            onClick={() => navigate(createPageUrl("Home"))}
            className="mb-4 text-gray-400 hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Map className="w-8 h-8 text-primary drop-shadow-[0_0_10px_rgba(220,38,38,0.6)]" />
                <h1 className="font-headline text-4xl font-bold text-foreground">
                  Seus Mundos
                </h1>
              </div>
              <p className="text-gray-400">
                Escolha um mundo para continuar sua crônica ou crie um novo
              </p>
            </div>
            
            <Button
              onClick={() => navigate(createPageUrl("CreateWorld"))}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Mundo
            </Button>
          </div>
        </div>

        {/* Worlds Grid */}
        {worlds.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <Map className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">Você ainda não criou nenhum mundo</p>
              <Button
                onClick={() => navigate(createPageUrl("CreateWorld"))}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Mundo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {worlds.map((world) => (
              <Card 
                key={world.id}
                className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group relative"
              >
                <div onClick={() => navigate(createPageUrl("CharactersList") + `?worldId=${world.id}`)}>
                  <CardHeader>
                    <CardTitle className="font-headline text-xl text-foreground group-hover:text-primary transition-colors">
                      {world.name}
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-sm">
                      {world.player_description?.substring(0, 100)}...
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs border-border text-gray-400">
                        {new Date(world.created_date).toLocaleDateString('pt-BR')}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="group-hover:text-primary"
                      >
                        Ver Personagens
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </div>
                
                {/* Delete Button */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 hover:bg-red-950/30"
                      onClick={(e) => e.stopPropagation()} // Stop propagation here
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-foreground">Deletar Mundo?</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-400">
                        Isso irá deletar permanentemente o mundo "{world.name}" e TODOS os personagens e crônicas associados. Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-border bg-secondary text-foreground">Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={(e) => handleDeleteWorld(world.id, e)} // Pass event to stop propagation
                        className="bg-red-900 hover:bg-red-800 text-foreground"
                      >
                        Deletar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
