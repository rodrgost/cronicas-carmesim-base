import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Droplet, ChevronDown, Lock } from "lucide-react";
import { DISCIPLINES, getClanDisciplines } from "./disciplineData";
import RouseCheckDialog from "./RouseCheckDialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function DisciplineActivator({ character, onUseDiscipline }) {
  const [expandedDiscipline, setExpandedDiscipline] = useState(null);
  const [rouseCheckState, setRouseCheckState] = useState({
    isOpen: false,
    disciplineName: null,
    powerName: null,
    powerLevel: null,
    cost: 0
  });

  const characterDisciplines = character.disciplines || {};
  const clanDisciplines = getClanDisciplines(character.clan);

  const sortedDisciplines = Object.entries(characterDisciplines)
    .sort(([keyA], [keyB]) => {
      const aIsClan = clanDisciplines.includes(keyA);
      const bIsClan = clanDisciplines.includes(keyB);
      if (aIsClan && !bIsClan) return -1;
      if (!aIsClan && bIsClan) return 1;
      return 0;
    });

  const handleActivatePower = (disciplineKey, powerLevel, power) => {
    const disciplineData = DISCIPLINES[disciplineKey];
    
    setRouseCheckState({
      isOpen: true,
      disciplineName: disciplineData.name,
      powerName: power.name,
      powerLevel: powerLevel,
      disciplineKey: disciplineKey,
      cost: power.cost
    });
  };

  const handleRouseCheckResult = (hungerIncrease) => {
    // Chamar callback com informações do poder usado e aumento de fome
    onUseDiscipline({
      disciplineKey: rouseCheckState.disciplineKey,
      disciplineName: rouseCheckState.disciplineName,
      powerName: rouseCheckState.powerName,
      powerLevel: rouseCheckState.powerLevel,
      hungerIncrease: hungerIncrease,
      cost: rouseCheckState.cost
    });

    // Fechar dialog
    setRouseCheckState({
      isOpen: false,
      disciplineName: null,
      powerName: null,
      powerLevel: null,
      cost: 0
    });
  };

  if (sortedDisciplines.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-headline flex items-center gap-2 text-foreground">
            <Zap className="w-4 h-4 text-primary" />
            Disciplinas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 py-3">
          {sortedDisciplines.map(([disciplineKey, level]) => {
            const disciplineData = DISCIPLINES[disciplineKey];
            if (!disciplineData) return null;

            const isClanDiscipline = clanDisciplines.includes(disciplineKey);
            const isExpanded = expandedDiscipline === disciplineKey;

            return (
              <Collapsible
                key={disciplineKey}
                open={isExpanded}
                onOpenChange={() => setExpandedDiscipline(isExpanded ? null : disciplineKey)}
              >
                <CollapsibleTrigger asChild>
                  <div className="border border-border rounded-md p-2 hover:bg-secondary/50 cursor-pointer transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        <span className="font-semibold text-xs text-foreground">
                          {disciplineData.name}
                        </span>
                        <span className="flex-shrink-0 tracking-wide text-sm leading-none">
                          <span className="text-primary">{"●".repeat(level)}</span>
                          <span className="text-gray-700 opacity-30">{"●".repeat(5-level)}</span>
                        </span>
                        {isClanDiscipline && (
                          <Badge className="bg-primary/20 text-primary text-xs px-1 py-0 h-4">Clã</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="mt-1 ml-3 space-y-1">
                    {[1, 2, 3, 4, 5].map(powerLevel => {
                      const power = disciplineData.powers[powerLevel];
                      const isAvailable = powerLevel <= level;
                      
                      if (!power) return null;
                      
                      return (
                        <div
                          key={powerLevel}
                          className={`border-l-2 ${isAvailable ? 'border-primary/30' : 'border-gray-700'} pl-2 py-1.5 flex items-start justify-between gap-2`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 mb-0.5">
                              <span className={`text-xs font-semibold ${isAvailable ? 'text-foreground' : 'text-gray-600'}`}>
                                {power.name}
                              </span>
                              <Badge variant="outline" className="text-[10px] px-1 py-0 h-3.5 leading-none">
                                Nível {powerLevel}
                              </Badge>
                            </div>
                            <p className={`text-[11px] ${isAvailable ? 'text-gray-400' : 'text-gray-600'} leading-tight mb-0.5`}>
                              {power.description}
                            </p>
                            <div className="flex gap-1 flex-wrap">
                              {power.cost > 0 && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-3.5 leading-none">
                                  <Droplet className="w-2 h-2 mr-0.5" />
                                  {power.cost} Rouse
                                </Badge>
                              )}
                              {power.type && (
                                <Badge variant="secondary" className="text-[10px] px-1 py-0 h-3.5 leading-none capitalize">
                                  {power.type}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {isAvailable ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleActivatePower(disciplineKey, powerLevel, power);
                              }}
                              className="h-6 px-2 text-[10px] flex-shrink-0"
                            >
                              Usar
                            </Button>
                          ) : (
                            <div className="h-6 px-2 flex items-center text-gray-600 flex-shrink-0">
                              <Lock className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </CardContent>
      </Card>

      <RouseCheckDialog
        isOpen={rouseCheckState.isOpen}
        onClose={() => setRouseCheckState({ ...rouseCheckState, isOpen: false })}
        onResult={handleRouseCheckResult}
        disciplineName={rouseCheckState.disciplineName}
        powerName={rouseCheckState.powerName}
        cost={rouseCheckState.cost}
      />
    </>
  );
}