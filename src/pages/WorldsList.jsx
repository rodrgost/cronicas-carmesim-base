import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Map, ArrowRight, Plus, Trash2, BookOpen } from "lucide-react";
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
import { createPageUrl } from "@/utils";
import { useTranslation } from "@/components/i18n/LanguageContext";
import PageHeader from "@/components/ui/PageHeader";

export default function WorldsList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [worlds, setWorlds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWorlds();
  }, []);

  const loadWorlds = async () => {
    try {
      const allWorlds = await base44.entities.World.list();
      setWorlds(allWorlds);
    } catch (error) {
      console.error("Error loading worlds:", error);
      alert(`Erro ao carregar mundos: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWorld = async (worldId, e) => {
    e.stopPropagation();
    try {
      const allCharacters = await base44.entities.Character.list();
      const worldCharacters = allCharacters.filter(c => c.world_id === worldId);
      for (const char of worldCharacters) {
        await base44.entities.Character.delete(char.id);
      }

      const allChronicles = await base44.entities.Chronicle.list();
      const worldChronicles = allChronicles.filter(c => c.world_id === worldId);
      for (const chron of worldChronicles) {
        await base44.entities.Chronicle.delete(chron.id);
      }

      const allNPCs = await base44.entities.NPC.list();
      const worldNPCs = allNPCs.filter(n => n.world_id === worldId);
      for (const npc of worldNPCs) {
        await base44.entities.NPC.delete(npc.id);
      }

      await base44.entities.World.delete(worldId);

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
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Page Header */}
      <PageHeader
        backTo="Home"
        title={
          <div className="flex items-center gap-3">
            <Map className="w-8 h-8 text-primary drop-shadow-[0_0_10px_rgba(220,38,38,0.6)]" />
            <span>{t('worlds.yourWorlds')}</span>
          </div>
        }
        actions={
          <Button
            onClick={() => navigate(createPageUrl("CreateWorld"))}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('worlds.newWorld')}
          </Button>
        }
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto pb-8">
          {worlds.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <Map className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">{t('worlds.noWorlds')}</p>
                <Button
                  onClick={() => navigate(createPageUrl("CreateWorld"))}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('worlds.createFirstWorld')}
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
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="text-xs border-border text-gray-400">
                          {new Date(world.created_date).toLocaleDateString('pt-BR')}
                        </Badge>

                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-400 hover:text-primary"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <BookOpen className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="text-foreground font-headline text-2xl">
                                  {world.name}
                                </DialogTitle>
                                <DialogDescription className="text-gray-400">
                                  {t('createWorld.detailedTab')}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="mt-4 space-y-4">
                                <div>
                                  <h3 className="text-sm font-semibold text-primary mb-2">{t('worlds.yourDescription')}</h3>
                                  <p className="text-gray-300 text-sm">{world.player_description}</p>
                                </div>
                                <div className="border-t border-border pt-4">
                                  <h3 className="text-sm font-semibold text-primary mb-2">{t('worlds.generatedDetails')}</h3>
                                  <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                                    {world.generated_details}
                                  </p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="group-hover:text-primary"
                          >
                            {t('worlds.viewCharacters')}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
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
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-foreground">{t('worlds.deleteTitle')}</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                          {t('worlds.deleteDescription', { name: world.name })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-border bg-secondary text-foreground">{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e) => handleDeleteWorld(world.id, e)}
                          className="bg-red-900 hover:bg-red-800 text-foreground"
                        >
                          {t('common.delete')}
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
    </div>
  );
}