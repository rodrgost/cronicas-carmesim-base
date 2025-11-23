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
import { Textarea } from "@/components/ui/textarea";
import { createPageUrl } from "@/utils";
import AttributeAllocator from "../components/character/AttributeAllocator";
import SkillAllocator from "../components/character/SkillAllocator";
import DisciplineSelector from "../components/disciplines/DisciplineSelector";
import { useTranslation } from "@/components/i18n/LanguageContext";
import PageHeader from "@/components/ui/PageHeader";

const CLANS_LIST = [
  "Brujah",
  "Gangrel",
  "Malkavian",
  "Nosferatu",
  "Toreador",
  "Tremere",
  "Ventrue",
  "Lasombra",
  "Tzimisce",
  "Banu Haqim",
  "Ministry",
  "Hecata",
  "Ravnos",
  "Salubri",
  "Caitiff"
];

export default function CreateCharacter() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [worldId, setWorldId] = useState(null);
  const [world, setWorld] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState("");
  const [concept, setConcept] = useState("");
  const [clan, setClan] = useState("");
  const [portraitUrl, setPortraitUrl] = useState("");
  const [portraitDescription, setPortraitDescription] = useState("");
  const [isGeneratingPortrait, setIsGeneratingPortrait] = useState(false);

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

  const [disciplines, setDisciplines] = useState({});

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

  const handleGeneratePortrait = async () => {
    if (!name.trim() || !concept.trim() || !clan) {
      return;
    }

    setIsGeneratingPortrait(true);

    try {
      const clanDesc = t(`clans.${clan}`);
      const basePrompt = `${name}, ${concept}, ${clan} vampire from Vampire: The Masquerade, ${clanDesc}`;
      const descriptionPart = portraitDescription.trim() ? `, ${portraitDescription}` : '';
      const prompt = `${basePrompt}${descriptionPart}, portrait photograph, face and torso visible, square composition, dark gothic vampire aesthetic, professional photography, detailed facial features, 8k resolution`;

      const result = await base44.integrations.Core.GenerateImage({
        prompt: prompt
      });

      if (result && result.url) {
        setPortraitUrl(result.url);
      }
    } catch (error) {
      console.error("Error generating portrait:", error);
    } finally {
      setIsGeneratingPortrait(false);
    }
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
        portrait_url: portraitUrl || null,
        attributes,
        skills,
        disciplines,
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
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <PageHeader backTo="CharactersList" />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <User className="w-12 h-12 md:w-16 md:h-16 text-primary drop-shadow-[0_0_10px_rgba(220,38,38,0.6)]" />
            </div>
            <h1 className="font-headline text-3xl md:text-5xl font-bold text-foreground mb-3">
              {t('createCharacter.title')}
            </h1>
            {world && (
              <p className="text-red-300 text-lg">
                {world.name}
              </p>
            )}
          </div>

          <Card className="bg-card border-border shadow-[0_0_30px_rgba(220,38,38,0.2)] mb-8">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-foreground">{t('createCharacter.cardTitle')}</CardTitle>
              <CardDescription className="text-gray-400">
                {t('createCharacter.cardDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="identity" className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-6 bg-secondary">
                  <TabsTrigger value="identity">{t('createCharacter.tabs.identity')}</TabsTrigger>
                  <TabsTrigger value="attributes">{t('createCharacter.tabs.attributes')}</TabsTrigger>
                  <TabsTrigger value="skills">{t('createCharacter.tabs.skills')}</TabsTrigger>
                  <TabsTrigger value="disciplines">{t('createCharacter.tabs.disciplines')}</TabsTrigger>
                  <TabsTrigger value="review">{t('createCharacter.tabs.review')}</TabsTrigger>
                </TabsList>

                <TabsContent value="identity" className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground">{t('createCharacter.identity.name')}</Label>
                    <Input
                      id="name"
                      placeholder={t('createCharacter.identity.namePlaceholder')}
                      value={name}
                      onChange={(e) => {
                        const words = e.target.value.split(' ');
                        const capitalized = words.map(word =>
                          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                        ).join(' ');
                        setName(capitalized);
                      }}
                      className="bg-secondary border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="concept" className="text-foreground">{t('createCharacter.identity.concept')}</Label>
                    <Input
                      id="concept"
                      placeholder={t('createCharacter.identity.conceptPlaceholder')}
                      value={concept}
                      onChange={(e) => {
                        const words = e.target.value.split(' ');
                        const capitalized = words.map(word =>
                          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                        ).join(' ');
                        setConcept(capitalized);
                      }}
                      className="bg-secondary border-border"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-foreground">{t('createCharacter.identity.clan')}</Label>
                    <Select value={clan} onValueChange={setClan}>
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder={t('createCharacter.identity.clanPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {CLANS_LIST.map((clanName) => (
                          <SelectItem key={clanName} value={clanName}>
                            <div className="flex flex-col">
                              <span className="font-semibold text-foreground">{clanName}</span>
                              <span className="text-xs text-gray-400">{t(`clans.${clanName}`)}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border">
                    <Label className="text-foreground">{t('createCharacter.identity.portrait')}</Label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label className="text-sm text-gray-400">{t('createCharacter.identity.physicalDesc')}</Label>
                        <Textarea
                          placeholder={t('createCharacter.identity.physicalDescPlaceholder')}
                          value={portraitDescription}
                          onChange={(e) => setPortraitDescription(e.target.value)}
                          className="bg-secondary border-border text-foreground h-32 resize-none"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleGeneratePortrait}
                          disabled={isGeneratingPortrait || !name.trim() || !concept.trim() || !clan}
                          className="w-full"
                        >
                          {isGeneratingPortrait ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              {t('createCharacter.identity.generatingPortrait')}
                            </>
                          ) : (
                            <>
                              <User className="w-4 h-4 mr-2" />
                              {t('createCharacter.identity.generatePortrait')}
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-gray-500">
                          {t('createCharacter.identity.fillRequired')}
                        </p>
                      </div>
                      <div className="flex items-center justify-center">
                        {portraitUrl ? (
                          <img
                            src={portraitUrl}
                            alt={name || "Personagem"}
                            className="w-48 h-48 object-cover rounded-lg border-2 border-primary/30"
                          />
                        ) : (
                          <div className="w-48 h-48 bg-secondary rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                            <User className="w-12 h-12 text-gray-600" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="attributes">
                  <AttributeAllocator attributes={attributes} setAttributes={setAttributes} />
                </TabsContent>

                <TabsContent value="skills">
                  <SkillAllocator skills={skills} setSkills={setSkills} />
                </TabsContent>

                <TabsContent value="disciplines">
                  {clan ? (
                    <DisciplineSelector
                      clan={clan}
                      disciplines={disciplines}
                      onChange={setDisciplines}
                      maxPoints={3}
                    />
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      {t('createCharacter.selectClanFirst')}
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="review" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-secondary border-border">
                      <CardHeader>
                        <CardTitle className="text-lg text-foreground">{t('createCharacter.review.identity')}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <span className="text-gray-400 text-sm">{t('createCharacter.identity.name')}:</span>
                          <p className="font-semibold text-foreground">{name || "—"}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">{t('createCharacter.identity.concept')}:</span>
                          <p className="font-semibold text-foreground">{concept || "—"}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">{t('createCharacter.identity.clan')}:</span>
                          <p className="font-semibold text-foreground">{clan || "—"}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-secondary border-border">
                      <CardHeader>
                        <CardTitle className="text-lg text-foreground">{t('createCharacter.review.initialStatus')}</CardTitle>
                        <CardDescription className="text-xs text-gray-500">
                          {t('createCharacter.review.basedOn')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">{t('character.health')}:</span>
                          <Badge variant="outline" className="border-primary text-primary">
                            {derivedStats.maxHealth} (5 + {t('attributes.stamina')} {attributes.physical.stamina})
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">{t('character.willpower')}:</span>
                          <Badge variant="outline" className="border-primary text-primary">
                            {derivedStats.maxWillpower} ({t('attributes.composure')} {attributes.social.composure} + {t('attributes.resolve')} {attributes.mental.resolve})
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">{t('character.humanity')}:</span>
                          <Badge variant="outline" className="border-primary text-primary">7 / 10</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">{t('character.hunger')}:</span>
                          <Badge variant="destructive">1 / 5</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">{t('character.bloodPotency')}:</span>
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
                        {t('createCharacter.creatingButton')}
                      </>
                    ) : (
                      <>
                        <Scroll className="w-5 h-5 mr-2" />
                        {t('createCharacter.createButton')}
                      </>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}