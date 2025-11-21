import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Droplet, Lock } from "lucide-react";
import { DISCIPLINES, getClanDisciplines } from "./disciplineData";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function DisciplinePanel({ character }) {
  const [expandedDiscipline, setExpandedDiscipline] = useState(null);
  
  const characterDisciplines = character.disciplines || {};
  const clanDisciplines = getClanDisciplines(character.clan);

  // Ordenar disciplinas: do clã primeiro
  const sortedDisciplines = Object.entries(characterDisciplines)
    .sort(([keyA], [keyB]) => {
      const aIsClan = clanDisciplines.includes(keyA);
      const bIsClan = clanDisciplines.includes(keyB);
      if (aIsClan && !bIsClan) return -1;
      if (!aIsClan && bIsClan) return 1;
      return 0;
    });

  if (sortedDisciplines.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-headline flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Disciplinas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nenhuma disciplina aprendida.</p>
        </CardContent>
      </Card>
    );
  }

  const getCostBadge = (cost) => {
    if (cost === 0) return <Badge variant="outline" className="text-xs">Passivo</Badge>;
    if (cost === 1) return (
      <Badge variant="outline" className="text-xs flex items-center gap-1">
        <Droplet className="w-3 h-3" /> 1 Rouse
      </Badge>
    );
    return (
      <Badge variant="outline" className="text-xs flex items-center gap-1">
        <Droplet className="w-3 h-3" /> {cost} Rouse
      </Badge>
    );
  };

  const getTypeBadge = (type) => {
    const types = {
      active: "Ativo",
      passive: "Passivo",
      ritual: "Ritual"
    };
    return <Badge variant="secondary" className="text-xs">{types[type] || type}</Badge>;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="py-3">
        <CardTitle className="text-sm text-foreground flex items-center gap-2">
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
                <div className="border border-border rounded-lg p-2 hover:bg-secondary/50 cursor-pointer transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-foreground">
                          {disciplineData.name}
                        </span>
                        {isClanDiscipline && (
                          <Badge className="bg-primary/20 text-primary text-xs">Clã</Badge>
                        )}
                      </div>
                    </div>
                    <span className="flex-shrink-0 tracking-wide text-sm leading-none">
                      <span className="text-primary">{"●".repeat(level || 0)}</span>
                      <span className="text-gray-700 opacity-30">{"●".repeat(5-(level || 0))}</span>
                    </span>
                  </div>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="mt-2 ml-4 space-y-2">
                  {Object.entries(disciplineData.powers)
                    .filter(([powerLevel]) => parseInt(powerLevel) <= level)
                    .map(([powerLevel, power]) => (
                      <div
                        key={powerLevel}
                        className="border-l-2 border-primary/30 pl-3 py-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                Nível {powerLevel}
                              </Badge>
                              <span className="font-semibold text-sm">{power.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {power.description}
                            </p>
                            <div className="flex items-center gap-2">
                              {getCostBadge(power.cost)}
                              {getTypeBadge(power.type)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  
                  {/* Poderes bloqueados */}
                  {Object.entries(disciplineData.powers)
                    .filter(([powerLevel]) => parseInt(powerLevel) > level)
                    .map(([powerLevel, power]) => (
                      <div
                        key={powerLevel}
                        className="border-l-2 border-muted pl-3 py-2 opacity-50"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Lock className="w-3 h-3 text-muted-foreground" />
                          <Badge variant="outline" className="text-xs">
                            Nível {powerLevel}
                          </Badge>
                          <span className="font-semibold text-sm text-muted-foreground">
                            {power.name}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Requer nível {powerLevel} de {disciplineData.name}
                        </p>
                      </div>
                    ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </CardContent>
    </Card>
  );
}