import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Scroll } from "lucide-react";
import { createPageUrl } from "@/utils";
import AttributeAllocator from "../components/character/AttributeAllocator";
import SkillAllocator from "../components/character/SkillAllocator";

const CLANS = [
  { value: "Brujah", description: "Rebeldes apaixonados, filósofos e revolucionários" },
  { value: "Gangrel", description: "Solitários bestiais, sobreviventes natos" },
  { value: "Malkavian", description: "Loucos oraculares com visões perturbadoras" },
  { value: "Nosferatu", description: "Monstros deformados, mestres da informação" },
  { value: "Toreador", description: "Artistas e estetas obcecados por beleza" },
  { value: "Tremere", description: "Feiticeiros de sangue, usurpadores de poder" },
  { value: "Ventrue", description: "Líderes do clã azul-sangue, elite da Camarilla" },
  { value: "Lasombra", description: "Mestres das sombras, ex-pilares do Sabbat" },
  { value: "Tzimisce", description: "Modeladores de carne, senhores do terror" },
  { value: "Banu Haqim", description: "Ex-Assamitas, juízes e assassinos de sangue" },
  { value: "Ministry", description: "Ex-Seguidores de Set, libertadores corruptores" },
  { value: "Hecata", description: "Necromantes unidos, mestres da morte" },
  { value: "Ravnos", description: "Nômades trapaceiros próximos à Besta" },
  { value: "Salubri", description: "Curandeiros perseguidos, guerreiros ciclopes" },
  { value: "Caitiff", description: "Sem clã, rejeitados pela sociedade vampírica" }
];

export default function CreateCharacter() {
  const navigate = useNavigate();
  const location = useLocation();
  const [worldId, setWorldId] = useState(null);
  const [world, setWorld] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState("");
  const [concept, setConcept] = useState("");
  const [clan, setClan] = useState("");

  const [attributes, setAttributes] = useState({
    physical: { strength: 1, dexterity: 1, stamina: 1 },
    social: { charisma: 1, manipulation: 1, composure: 1 },
    mental: { intelligence: 1, wits: 1, resolve: 1 }
  });

  const [skills, setSkills] = useState({
    physical: { athletics: 0, brawl: 0, drive: 0, firearms: 0, stealth: 0, survival: 0 },
    social: { animal_ken: 0, etiquette: 0, insight: 0, intimidation: 0, leadership: 0, persuasion: 0, streetwise: 0, subterfuge: 0 },
    mental: { academics: 0, awareness: 0, finance: 0, investigation: 0, medicine: 0, occult: 0, politics: 0, science: 0, technology: 0 }
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const wId = params.get('worldId');
    if (wId) {
      setWorldId(wId);
      loadWorld(wId);
    } else {
      setIsLoading(false);
    }
  }, [location]);

  const loadWorld = async (wId) => {
    try {
      const worlds = await base44.entities.World.list();
      const foundWorld = worlds.find(w => w.id === wId);
      setWorld(foundWorld);
    } catch (error) {
      console.error("Error loading world:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate derived stats based on V5 rules
  const calculateDerivedStats = () => {
    const stamina = attributes.physical.stamina;
    const composure = attributes.social.composure;
    const resolve = attributes.mental.resolve;

    const maxHealth = 5 + stamina;
    const maxWillpower = composure + resolve;

    return {
      maxHealth,
      maxWillpower,
      health: maxHealth,
      willpower: maxWillpower
    };
  };

  const handleCreateCharacter = async () => {
    if (!name.trim() || !concept.trim() || !clan) {
      return;
    }

    setIsSaving(true);

    try {
      const user = await base44.auth.me();
      const derivedStats = calculateDerivedStats();

      const character = await base44.entities.Character.create({
        name,
        concept,
        clan,
        attributes,
        skills,
        health: derivedStats.health,
        max_health: derivedStats.maxHealth,
        willpower: derivedStats.willpower,
        max_willpower: derivedStats.maxWillpower,
        humanity: 7,
        hunger: 1,
        blood_potency: 0,
        world_id: worldId,
        user_id: user.email
      });

      navigate(createPageUrl("Play") + `?characterId=${character.id}`);
    } catch (error) {
      console.error("Error creating character:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const derivedStats = calculateDerivedStats();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <User className="w-16 h-16 text-primary drop-shadow-[0_0_10px_rgba(220,38,38,0.6)]" />
          </div>
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground mb-3">
            Crie Seu Vampiro
          </h1>
          {world && (
            <p className="text-red-300 text-lg">
              {world.name}
            </p>
          )}
        </div>

        <Card className="bg-card border-border shadow-[0_0_30px_rgba(220,38,38,0.2)]">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-foreground">Ficha de Personagem</CardTitle>
            <CardDescription className="text-gray-400">
              Defina a identidade do seu vampiro e distribua pontos em atributos e perícias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="identity" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6 bg-secondary">
                <TabsTrigger value="identity">Identidade</TabsTrigger>
                <TabsTrigger value="attributes">Atributos</TabsTrigger>
                <TabsTrigger value="skills">Perícias</TabsTrigger>
                <TabsTrigger value="review">Revisar</TabsTrigger>
              </TabsList>

              <TabsContent value="identity" className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Nome</Label>
                  <Input
                    id="name"
                    placeholder="Nome do seu vampiro"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="concept" className="text-foreground">Conceito</Label>
                  <Input
                    id="concept"
                    placeholder="Ex: Detetive Particular, Artista de Rua, CEO Corporativo..."
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-foreground">Clã</Label>
                  <Select value={clan} onValueChange={setClan}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Escolha seu clã vampírico" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {CLANS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">{c.value}</span>
                            <span className="text-xs text-gray-400">{c.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="attributes">
                <AttributeAllocator attributes={attributes} setAttributes={setAttributes} />
              </TabsContent>

              <TabsContent value="skills">
                <SkillAllocator skills={skills} setSkills={setSkills} />
              </TabsContent>

              <TabsContent value="review" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-secondary border-border">
                    <CardHeader>
                      <CardTitle className="text-lg text-foreground">Identidade</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <span className="text-gray-400 text-sm">Nome:</span>
                        <p className="font-semibold text-foreground">{name || "—"}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Conceito:</span>
                        <p className="font-semibold text-foreground">{concept || "—"}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Clã:</span>
                        <p className="font-semibold text-foreground">{clan || "—"}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-secondary border-border">
                    <CardHeader>
                      <CardTitle className="text-lg text-foreground">Status Inicial</CardTitle>
                      <CardDescription className="text-xs text-gray-500">
                        Baseado nos atributos do sistema V5
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Vitalidade:</span>
                        <Badge variant="outline" className="border-primary text-primary">
                          {derivedStats.maxHealth} (5 + Vigor {attributes.physical.stamina})
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Força de Vontade:</span>
                        <Badge variant="outline" className="border-primary text-primary">
                          {derivedStats.maxWillpower} (Autocontrole {attributes.social.composure} + Perseverança {attributes.mental.resolve})
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Humanidade:</span>
                        <Badge variant="outline" className="border-primary text-primary">7 / 10</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Fome:</span>
                        <Badge variant="destructive">1 / 5</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Potência de Sangue:</span>
                        <Badge variant="outline" className="border-gray-500 text-gray-400">0</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Button
                  onClick={handleCreateCharacter}
                  disabled={isSaving || !name.trim() || !concept.trim() || !clan}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-lg py-6 h-auto shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Criando Personagem...
                    </>
                  ) : (
                    <>
                      <Scroll className="w-5 h-5 mr-2" />
                      Começar a Crônica
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}