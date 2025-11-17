import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";

const ATTRIBUTE_NAMES = {
  physical: {
    strength: "Força",
    dexterity: "Destreza",
    stamina: "Vigor"
  },
  social: {
    charisma: "Carisma",
    manipulation: "Manipulação",
    composure: "Autocontrole"
  },
  mental: {
    intelligence: "Inteligência",
    wits: "Raciocínio",
    resolve: "Determinação"
  }
};

const TOTAL_POINTS = 27;

export default function AttributeAllocator({ attributes, setAttributes }) {
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

  const renderAttributeCategory = (category, title) => (
    <Card key={category} className="bg-secondary border-border">
      <CardHeader>
        <CardTitle className="text-lg text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(ATTRIBUTE_NAMES[category]).map(([attr, label]) => (
          <div key={attr} className="flex items-center justify-between">
            <span className="text-sm text-foreground">{label}</span>
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
        {renderAttributeCategory("physical", "Físicos")}
        {renderAttributeCategory("social", "Sociais")}
        {renderAttributeCategory("mental", "Mentais")}
      </div>

      <p className="text-sm text-gray-500 text-center">
        Cada atributo começa em 1. Distribua os pontos restantes entre eles (máximo 5 por atributo).
      </p>
    </div>
  );
}