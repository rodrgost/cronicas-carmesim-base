import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dices } from "lucide-react";

const DIFFICULTY_LABELS = {
  2: "Trivial",
  3: "Fácil",
  4: "Normal",
  5: "Difícil",
  6: "Muito Difícil",
  7: "Extremo"
};

export default function DiceRollResult({ challenge, result }) {
  if (!challenge || !result) {
    return null;
  }

  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2 text-foreground">
            <Dices className="w-4 h-4 text-primary" />
            {challenge.description}
          </CardTitle>
          {result.isSuccess ? (
            <Badge className="bg-green-700 text-foreground text-xs">Sucesso!</Badge>
          ) : (
            <Badge variant="destructive" className="bg-red-900 text-foreground text-xs">Falha</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-gray-400">Teste:</span>
            <p className="font-semibold capitalize text-foreground">
              {challenge.attribute} + {challenge.skill.replace(/_/g, ' ')}
            </p>
          </div>
          <div>
            <span className="text-gray-400">Dificuldade:</span>
            <p className="font-semibold text-foreground">
              {challenge.difficulty} ({DIFFICULTY_LABELS[challenge.difficulty] || "Normal"})
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {result.rolls.map((roll, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs ${
                  roll >= 6 ? 'bg-green-700 text-white' : 'bg-gray-800 text-gray-400'
                }`}
              >
                {roll}
              </div>
            ))}
          </div>
          <p className="text-xs text-foreground">
            <span className="font-semibold">Sucessos: {result.successes}</span> 
            <span className="text-gray-400"> / {challenge.difficulty} necessários</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}