
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Moon, Sun, Sunrise, Skull, Heart, Brain, Droplet, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

const TIME_OF_DAY_CONFIG = {
  night: { icon: Moon, label: "Noite", color: "text-blue-400", description: "A cidade dorme, mas você desperta" },
  dusk: { icon: Sunrise, label: "Crepúsculo", color: "text-orange-400", description: "O sol nascerá em breve!" },
  day: { icon: Sun, label: "Dia", color: "text-yellow-400", description: "O sol é mortal para sua espécie" }
};

const ATTRIBUTE_LABELS = {
  strength: "Força", dexterity: "Destreza", stamina: "Vigor",
  charisma: "Carisma", manipulation: "Manipulação", composure: "Autocontrole",
  intelligence: "Inteligência", wits: "Raciocínio", resolve: "Determinação"
};

const SKILL_LABELS = {
  athletics: "Atletismo", brawl: "Briga", drive: "Condução", firearms: "Armas de Fogo",
  stealth: "Furtividade", survival: "Sobrevivência",
  animal_ken: "Empatia com Animais", etiquette: "Etiqueta", insight: "Intuição",
  intimidation: "Intimidação", leadership: "Liderança", persuasion: "Persuasão",
  streetwise: "Manha", subterfuge: "Subterfúgio",
  academics: "Acadêmicos", awareness: "Prontidão", finance: "Finanças",
  investigation: "Investigação", medicine: "Medicina", occult: "Ocultismo",
  politics: "Política", science: "Ciências", technology: "Tecnologia"
};

export default function CharacterSheet({ character, chronicle, refreshCharacter }) {
  const navigate = useNavigate();

  if (!character || !chronicle) return null;

  const timeConfig = TIME_OF_DAY_CONFIG[chronicle.time_of_day] || TIME_OF_DAY_CONFIG.night;
  const TimeIcon = timeConfig.icon;

  // Calculate max values based on V5 rules
  const maxHealth = character.max_health || (5 + (character.attributes?.physical?.stamina || 1));
  const maxWillpower = character.max_willpower || ((character.attributes?.social?.composure || 1) + (character.attributes?.mental?.resolve || 1));

  // Ensure current values don't exceed max
  const currentHealth = Math.min(character.health || 0, maxHealth);
  const currentWillpower = Math.min(character.willpower || 0, maxWillpower);

  const handleRestartChronicle = async () => {
    try {
      await base44.entities.Chronicle.update(chronicle.id, {
        turn_count: 1,
        time_of_day: "night",
        story_log: [],
        active_npcs: [],
        conversation_mode: "narrator",
        active_npc_id: null
      });

      await base44.entities.Character.update(character.id, {
        health: maxHealth,
        willpower: maxWillpower,
        humanity: 7,
        hunger: 1
      });

      window.location.reload();
    } catch (error) {
      console.error("Error restarting chronicle:", error);
    }
  };

  const handleOpenSettings = () => {
    navigate(createPageUrl("Settings") + `?chronicleId=${chronicle.id}`);
  };

  return (
    <div className="p-6 space-y-6 bg-background">
      {/* Identity */}
      <div className="text-center space-y-2">
        <h2 className="font-headline text-2xl font-bold text-foreground">{character.name}</h2>
        <p className="text-sm text-gray-400">{character.concept}</p>
        <Badge variant="outline" className="text-primary border-primary bg-primary/10">
          {character.clan}
        </Badge>
      </div>

      <Separator className="bg-border" />

      {/* Time of Day */}
      <Card className={`${chronicle.time_of_day === 'dusk' ? 'border-orange-500 bg-orange-500/10' : 'bg-card border-border'}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TimeIcon className={`w-6 h-6 ${timeConfig.color}`} />
              <div>
                <p className="font-semibold text-foreground">{timeConfig.label}</p>
                <p className="text-xs text-gray-400">{timeConfig.description}</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-secondary text-foreground">Turno {chronicle.turn_count}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Status Trackers */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-foreground">Vitalidade</span>
            </div>
            <span className="text-sm text-gray-400">{currentHealth} / {maxHealth}</span>
          </div>
          <Progress value={(currentHealth / maxHealth) * 100} className="h-2 bg-secondary" />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-foreground">Força de Vontade</span>
            </div>
            <span className="text-sm text-gray-400">{currentWillpower} / {maxWillpower}</span>
          </div>
          <Progress value={(currentWillpower / maxWillpower) * 100} className="h-2 bg-secondary" />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <div className="flex items-center gap-2">
              <Skull className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-foreground">Humanidade</span>
            </div>
            <span className="text-sm text-gray-400">{character.humanity} / 10</span>
          </div>
          <Progress value={character.humanity * 10} className="h-2 bg-secondary" />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <div className="flex items-center gap-2">
              <Droplet className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-foreground">Fome</span>
            </div>
            <span className="text-sm text-gray-400">{character.hunger} / 5</span>
          </div>
          <Progress value={character.hunger * 20} className="h-2 bg-red-950/40" />
        </div>

        {character.blood_potency !== undefined && (
          <div>
            <div className="flex justify-between mb-2">
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-foreground">Potência de Sangue</span>
              </div>
              <span className="text-sm text-gray-400">{character.blood_potency}</span>
            </div>
          </div>
        )}
      </div>

      <Separator className="bg-border" />

      {/* Attributes */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base text-foreground">Atributos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {["physical", "social", "mental"].map(category => (
            <div key={category}>
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">
                {category === "physical" ? "Físicos" : category === "social" ? "Sociais" : "Mentais"}
              </p>
              <div className="space-y-1">
                {Object.entries(character.attributes[category] || {}).map(([attr, value]) => (
                  <div key={attr} className="flex justify-between text-sm">
                    <span className="text-gray-300">{ATTRIBUTE_LABELS[attr]}</span>
                    <span className="font-bold text-primary">{"●".repeat(value || 0)}<span className="text-gray-700">{"○".repeat(5-(value || 0))}</span></span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base text-foreground">Perícias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {["physical", "social", "mental"].map(category => {
            const categorySkills = Object.entries(character.skills[category] || {})
              .filter(([_, value]) => value > 0);

            if (categorySkills.length === 0) return null;

            return (
              <div key={category}>
                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">
                  {category === "physical" ? "Físicas" : category === "social" ? "Sociais" : "Mentais"}
                </p>
                <div className="space-y-1">
                  {categorySkills.map(([skill, value]) => (
                    <div key={skill} className="flex justify-between text-sm">
                      <span className="text-gray-300">{SKILL_LABELS[skill]}</span>
                      <span className="font-bold text-primary">{"●".repeat(value)}<span className="text-gray-700">{"○".repeat(5-value)}</span></span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Separator className="bg-border" />

      {/* Settings Button */}
      <Button
        variant="outline"
        className="w-full border-border bg-secondary text-foreground hover:bg-secondary/80"
        size="sm"
        onClick={handleOpenSettings}
      >
        <Settings className="w-4 h-4 mr-2" />
        Configurações da Crônica
      </Button>

      {/* Restart Button */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="w-full bg-red-900 hover:bg-red-800 text-foreground" size="sm">
            Reiniciar Crônica
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Reiniciar a Crônica?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Isso irá resetar o log da história e os status do personagem, mas manterá o mundo e a ficha do personagem. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border bg-secondary text-foreground">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestartChronicle} className="bg-red-900 hover:bg-red-800 text-foreground">
              Reiniciar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
