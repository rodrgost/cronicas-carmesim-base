import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Plus, Minus } from "lucide-react";
import { DISCIPLINES, getClanDisciplines } from "./disciplineData";
import { useTranslation } from "@/components/i18n/LanguageContext";

export default function DisciplineSelector({ clan, disciplines, onChange, maxPoints = 3 }) {
  const { t, language } = useTranslation();
  const clanDisciplines = getClanDisciplines(clan);
  const currentDisciplines = disciplines || {};
  
  // Calcular pontos gastos
  const pointsSpent = Object.values(currentDisciplines).reduce((sum, level) => sum + level, 0);
  const pointsRemaining = maxPoints - pointsSpent;

  const handleIncrease = (disciplineKey) => {
    const currentLevel = currentDisciplines[disciplineKey] || 0;
    if (currentLevel < 5 && pointsRemaining > 0) {
      onChange({
        ...currentDisciplines,
        [disciplineKey]: currentLevel + 1
      });
    }
  };

  const handleDecrease = (disciplineKey) => {
    const currentLevel = currentDisciplines[disciplineKey] || 0;
    if (currentLevel > 0) {
      const newDisciplines = { ...currentDisciplines };
      if (currentLevel === 1) {
        delete newDisciplines[disciplineKey];
      } else {
        newDisciplines[disciplineKey] = currentLevel - 1;
      }
      onChange(newDisciplines);
    }
  };

  // Disciplinas disponíveis para o clã
  const availableDisciplines = clanDisciplines.map(key => ({
    key,
    data: DISCIPLINES[key],
    isClan: true
  }));

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-headline flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Disciplinas
          </CardTitle>
          <Badge variant={pointsRemaining > 0 ? "default" : "secondary"}>
            {pointsRemaining} / {maxPoints} {language === 'en' ? "points" : "pontos"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground mb-4">
          {language === 'en' 
            ? `Distribute ${maxPoints} points among your clan disciplines. You can place up to 3 points in a single discipline.`
            : `Distribua ${maxPoints} pontos entre as disciplinas do seu clã. Você pode colocar até 3 pontos em uma única disciplina.`}
        </p>

        {availableDisciplines.map(({ key, data, isClan }) => {
          const currentLevel = currentDisciplines[key] || 0;
          
          return (
            <div
              key={key}
              className="border border-border rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground">
                      {language === 'en' && data.nameEn ? data.nameEn : data.name}
                    </span>
                    {isClan && (
                      <Badge className="bg-primary/20 text-primary text-xs">{language === 'en' ? "Clan" : "Clã"}</Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {language === 'en' && data.descriptionEn ? data.descriptionEn : data.description}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleDecrease(key)}
                    disabled={currentLevel === 0}
                    className="h-8 w-8"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1 px-3">
                    {[1, 2, 3, 4, 5].map((dot) => (
                      <div
                        key={dot}
                        className={`w-3 h-3 rounded-full border-2 ${
                          dot <= currentLevel
                            ? "bg-primary border-primary"
                            : "border-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>

                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleIncrease(key)}
                    disabled={currentLevel >= 3 || pointsRemaining === 0}
                    className="h-8 w-8"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <span className="text-sm text-muted-foreground">
                  {language === 'en' ? "Level" : "Nível"} {currentLevel}
                </span>
              </div>

              {/* Mostrar primeiro poder se tiver nível 1+ */}
              {currentLevel >= 1 && data.powers[1] && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold">{language === 'en' && data.powers[1].nameEn ? data.powers[1].nameEn : data.powers[1].name}:</span>{" "}
                    {language === 'en' && data.powers[1].descriptionEn ? data.powers[1].descriptionEn : data.powers[1].description}
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {availableDisciplines.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            {language === 'en' ? "This clan has no disciplines defined." : "Este clã não possui disciplinas definidas."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}