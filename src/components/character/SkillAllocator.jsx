import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";

const SKILL_NAMES = {
  physical: {
    athletics: "Atletismo",
    brawl: "Briga",
    drive: "Condução",
    firearms: "Armas de Fogo",
    stealth: "Furtividade",
    survival: "Sobrevivência"
  },
  social: {
    animal_ken: "Empatia com Animais",
    etiquette: "Etiqueta",
    insight: "Intuição",
    intimidation: "Intimidação",
    leadership: "Liderança",
    persuasion: "Persuasão",
    streetwise: "Manha",
    subterfuge: "Subterfúgio"
  },
  mental: {
    academics: "Acadêmicos",
    awareness: "Prontidão",
    finance: "Finanças",
    investigation: "Investigação",
    medicine: "Medicina",
    occult: "Ocultismo",
    politics: "Política",
    science: "Ciências",
    technology: "Tecnologia"
  }
};

const TOTAL_POINTS = 26;

export default function SkillAllocator({ skills, setSkills }) {
  const calculateTotalPoints = () => {
    let total = 0;
    Object.values(skills).forEach(category => {
      Object.values(category).forEach(value => {
        total += value;
      });
    });
    return total;
  };

  const updateSkill = (category, skill, delta) => {
    const currentValue = skills[category][skill];
    const newValue = currentValue + delta;

    if (newValue < 0 || newValue > 5) return;

    const totalPoints = calculateTotalPoints();
    if (delta > 0 && totalPoints >= TOTAL_POINTS) return;

    setSkills({
      ...skills,
      [category]: {
        ...skills[category],
        [skill]: newValue
      }
    });
  };

  const renderSkillCategory = (category, title) => (
    <Card key={category} className="bg-secondary border-border">
      <CardHeader>
        <CardTitle className="text-lg text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {Object.entries(SKILL_NAMES[category]).map(([skill, label]) => (
          <div key={skill} className="flex items-center justify-between">
            <span className="text-xs text-foreground">{label}</span>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-7 w-7 border-border"
                onClick={() => updateSkill(category, skill, -1)}
                disabled={skills[category][skill] <= 0}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center font-bold text-foreground">
                {skills[category][skill]}
              </span>
              <Button
                size="icon"
                variant="outline"
                className="h-7 w-7 border-border"
                onClick={() => updateSkill(category, skill, 1)}
                disabled={skills[category][skill] >= 5 || calculateTotalPoints() >= TOTAL_POINTS}
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
        {renderSkillCategory("physical", "Físicas")}
        {renderSkillCategory("social", "Sociais")}
        {renderSkillCategory("mental", "Mentais")}
      </div>

      <p className="text-sm text-gray-500 text-center">
        Perícias começam em 0. Distribua pontos entre elas (máximo 5 por perícia).
      </p>
    </div>
  );
}