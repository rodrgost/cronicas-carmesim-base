import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus, HelpCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslation } from "@/components/i18n/LanguageContext";

const TOTAL_POINTS = 27;

export default function AttributeAllocator({ attributes, setAttributes }) {
  const { t, language } = useTranslation();

  const ATTRIBUTE_DESCRIPTIONS = {
    strength: language === 'en' ? "Raw strength and physical power. Used for lifting heavy objects, hitting hard, and physical intimidation." : "Força bruta e poder físico. Usado para erguer objetos pesados, bater forte e intimidar fisicamente.",
    dexterity: language === 'en' ? "Agility, coordination, and reflexes. Used for dodging, climbing, and handling delicate objects." : "Agilidade, coordenação motora e reflexos. Usado para esquivar, escalar e manusear objetos delicados.",
    stamina: language === 'en' ? "Physical resilience and pain tolerance. Determines your health and ability to withstand damage." : "Resistência física e tolerância à dor. Determina sua vitalidade e capacidade de suportar danos.",
    charisma: language === 'en' ? "Charisma and personal magnetism. Used to inspire, seduce, and lead people." : "Carisma e magnetismo pessoal. Usado para inspirar, seduzir e liderar pessoas.",
    manipulation: language === 'en' ? "Ability to manipulate and convince others through lies or half-truths." : "Habilidade de manipular e convencer outros através de mentiras ou meias-verdades.",
    composure: language === 'en' ? "Emotional self-control and presence of mind. Used to resist provocation and stay calm." : "Autocontrole emocional e presença de espírito. Usado para resistir a provocações e manter a calma.",
    intelligence: language === 'en' ? "Intellect, memory, and logical reasoning. Used to solve complex problems." : "Intelecto, memória e capacidade de raciocínio lógico. Usado para resolver problemas complexos.",
    wits: language === 'en' ? "Quick thinking and thinking under pressure. Determines your initiative in combat." : "Raciocínio rápido e pensamento sob pressão. Determina sua iniciativa em combate.",
    resolve: language === 'en' ? "Determination, willpower, and mental focus. Used to resist mental coercion and maintain concentration." : "Determinação, força de vontade e foco mental. Usado para resistir a coerção mental e manter a concentração."
  };
  const calculateTotalPoints = () => {
    let total = 0;
    Object.values(attributes).forEach(category => {
      Object.values(category).forEach(value => {
        total += value;
      });
    });
    return total;
  };

  const updateAttribute = (category, attr, delta) => {
    const currentValue = attributes[category][attr];
    const newValue = currentValue + delta;

    if (newValue < 1 || newValue > 5) return;

    const totalPoints = calculateTotalPoints();
    if (delta > 0 && totalPoints >= TOTAL_POINTS) return;

    setAttributes({
      ...attributes,
      [category]: {
        ...attributes[category],
        [attr]: newValue
      }
    });
  };

  const renderAttributeCategory = (category) => (
    <Card key={category} className="bg-secondary border-border">
      <CardHeader>
        <CardTitle className="text-lg text-foreground">{t(`attributes.${category}`)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.keys(attributes[category]).map((attr) => (
          <div key={attr} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-foreground">{t(`attributes.${attr}`)}</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-gray-400 hover:text-primary"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="bg-card border-border text-sm text-gray-300 max-w-xs">
                  {ATTRIBUTE_DESCRIPTIONS[attr]}
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 border-border"
                onClick={() => updateAttribute(category, attr, -1)}
                disabled={attributes[category][attr] <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-12 text-center font-bold text-lg text-foreground">
                {attributes[category][attr]}
              </span>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 border-border"
                onClick={() => updateAttribute(category, attr, 1)}
                disabled={attributes[category][attr] >= 5 || calculateTotalPoints() >= TOTAL_POINTS}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card className="bg-primary/10 border-primary/30">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Pontos Usados:</span>
            <span className="text-2xl font-bold text-foreground">
              {calculateTotalPoints()} / {TOTAL_POINTS}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderAttributeCategory("physical")}
        {renderAttributeCategory("social")}
        {renderAttributeCategory("mental")}
      </div>

      <p className="text-sm text-gray-500 text-center">
        {language === 'en' ? "Each attribute starts at 1. Distribute remaining points between them (max 5 per attribute)." : "Cada atributo começa em 1. Distribua os pontos restantes entre eles (máximo 5 por atributo)."}
      </p>
    </div>
  );
}