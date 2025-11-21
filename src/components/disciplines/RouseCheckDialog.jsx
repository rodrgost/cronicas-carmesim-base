import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Droplet, Dices } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function RouseCheckDialog({ 
  isOpen, 
  onClose, 
  onResult,
  disciplineName,
  powerName,
  cost = 1
}) {
  const [results, setResults] = useState([]);
  const [isRolling, setIsRolling] = useState(false);

  const rollRouseCheck = () => {
    setIsRolling(true);
    
    // Animar por 1 segundo
    setTimeout(() => {
      const newResults = [];
      let totalHungerIncrease = 0;
      
      for (let i = 0; i < cost; i++) {
        const roll = Math.floor(Math.random() * 10) + 1;
        const success = roll >= 6;
        newResults.push({ roll, success });
        if (!success) totalHungerIncrease++;
      }
      
      setResults(newResults);
      setIsRolling(false);
      
      // Chamar callback após 1 segundo mostrando resultado
      setTimeout(() => {
        onResult(totalHungerIncrease);
      }, 1500);
      
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Droplet className="w-5 h-5 text-primary" />
            Rouse Check
          </DialogTitle>
          <DialogDescription>
            {disciplineName && powerName ? (
              <>Ativar <span className="font-semibold">{powerName}</span> de {disciplineName}</>
            ) : (
              "Teste de despertar"
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-secondary/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              {cost === 1 ? "1 Rouse Check necessário" : `${cost} Rouse Checks necessários`}
            </p>
            <p className="text-xs text-muted-foreground">
              Role 6+ para não aumentar a Fome
            </p>
          </div>

          {results.length === 0 ? (
            <Button
              onClick={rollRouseCheck}
              disabled={isRolling}
              className="w-full"
              size="lg"
            >
              {isRolling ? (
                <>
                  <Dices className="w-5 h-5 mr-2 animate-spin" />
                  Rolando...
                </>
              ) : (
                <>
                  <Dices className="w-5 h-5 mr-2" />
                  Rolar Dados
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 justify-center">
                {results.map((result, idx) => (
                  <div
                    key={idx}
                    className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center text-2xl font-bold ${
                      result.success
                        ? "border-green-500 bg-green-500/10 text-green-500"
                        : "border-red-500 bg-red-500/10 text-red-500"
                    }`}
                  >
                    {result.roll}
                  </div>
                ))}
              </div>

              <div className="text-center">
                {results.every(r => r.success) ? (
                  <Badge className="bg-green-500/20 text-green-500">
                    ✓ Sucesso! Fome não aumenta
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    ✗ Fome aumenta +{results.filter(r => !r.success).length}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}