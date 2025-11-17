import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dices, X, CheckCircle, XCircle } from "lucide-react";
import { Label } from "@/components/ui/label";

const ATTRIBUTES = {
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

const SKILLS = {
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

const DIFFICULTIES = [
  { value: 2, label: "2 - Trivial" },
  { value: 3, label: "3 - Fácil" },
  { value: 4, label: "4 - Normal" },
  { value: 5, label: "5 - Difícil" },
  { value: 6, label: "6 - Muito Difícil" },
  { value: 7, label: "7 - Extremo" }
];

export default function ManualDiceRoll({ character, onClose, onResult }) {
  const [selectedAttribute, setSelectedAttribute] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [difficulty, setDifficulty] = useState(4);
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState(null);

  const getAttribute = (attr) => {
    for (const category of Object.values(character.attributes)) {
      if (category[attr] !== undefined) {
        return category[attr];
      }
    }
    return 0;
  };

  const getSkill = (skill) => {
    for (const category of Object.values(character.skills)) {
      if (category[skill] !== undefined) {
        return category[skill];
      }
    }
    return 0;
  };

  const handleRoll = () => {
    if (!selectedAttribute || !selectedSkill) return;

    setIsRolling(true);
    
    const attributeValue = getAttribute(selectedAttribute);
    const skillValue = getSkill(selectedSkill);
    const dicePool = attributeValue + skillValue;

    let successes = 0;
    const rolls = [];
    
    for (let i = 0; i < dicePool; i++) {
      const roll = Math.floor(Math.random() * 10) + 1;
      rolls.push(roll);
      if (roll >= 6) {
        successes++;
      }
    }

    setTimeout(() => {
      const rollResult = {
        successes,
        rolls,
        isSuccess: successes >= difficulty,
        attribute: selectedAttribute,
        skill: selectedSkill,
        difficulty
      };
      setResult(rollResult);
      setIsRolling(false);
    }, 1500);
  };

  const handleComplete = () => {
    if (onResult && result) {
      onResult(result);
    }
    onClose();
  };

  const attributeValue = selectedAttribute ? getAttribute(selectedAttribute) : 0;
  const skillValue = selectedSkill ? getSkill(selectedSkill) : 0;
  const dicePool = attributeValue + skillValue;

  // Get attribute display name
  const getAttributeName = (attr) => {
    for (const category of Object.values(ATTRIBUTES)) {
      if (category[attr]) return category[attr];
    }
    return attr;
  };

  const getSkillName = (skill) => {
    for (const category of Object.values(SKILLS)) {
      if (category[skill]) return category[skill];
    }
    return skill;
  };

  return (
    <Card className="border-primary/50 bg-card shadow-[0_0_20px_rgba(220,38,38,0.3)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-foreground">
            <Dices className="w-5 h-5 text-primary" />
            Rolar Dados Manualmente
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <CardDescription className="text-gray-400">
          Escolha o atributo, perícia e dificuldade para fazer um teste
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!result ? (
          <>
            <div className="space-y-2">
              <Label className="text-foreground">Atributo</Label>
              <Select value={selectedAttribute} onValueChange={setSelectedAttribute}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Escolha um atributo" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {Object.entries(ATTRIBUTES).map(([category, attrs]) => (
                    <React.Fragment key={category}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase">
                        {category === "physical" ? "Físicos" : category === "social" ? "Sociais" : "Mentais"}
                      </div>
                      {Object.entries(attrs).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label} ({getAttribute(key)})
                        </SelectItem>
                      ))}
                    </React.Fragment>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Perícia</Label>
              <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Escolha uma perícia" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-64 overflow-y-auto">
                  {Object.entries(SKILLS).map(([category, skills]) => (
                    <React.Fragment key={category}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase">
                        {category === "physical" ? "Físicas" : category === "social" ? "Sociais" : "Mentais"}
                      </div>
                      {Object.entries(skills).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label} ({getSkill(key)})
                        </SelectItem>
                      ))}
                    </React.Fragment>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Dificuldade</Label>
              <Select value={difficulty.toString()} onValueChange={(val) => setDifficulty(parseInt(val))}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {DIFFICULTIES.map((diff) => (
                    <SelectItem key={diff.value} value={diff.value.toString()}>
                      {diff.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedAttribute && selectedSkill && (
              <div className="p-3 bg-secondary/50 rounded-lg border border-border">
                <p className="text-sm text-gray-400 mb-2">Parada de Dados:</p>
                <p className="text-lg font-bold text-foreground">
                  {getAttributeName(selectedAttribute)} ({attributeValue}) + {getSkillName(selectedSkill)} ({skillValue}) = {dicePool} dados
                </p>
              </div>
            )}

            <Button
              onClick={handleRoll}
              disabled={isRolling || !selectedAttribute || !selectedSkill}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isRolling ? (
                <>
                  <Dices className="w-4 h-4 mr-2 animate-spin" />
                  Rolando...
                </>
              ) : (
                <>
                  <Dices className="w-4 h-4 mr-2" />
                  Rolar Dados
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Resultado:</span>
                {result.isSuccess ? (
                  <Badge className="bg-green-700 text-foreground">Sucesso!</Badge>
                ) : (
                  <Badge variant="destructive" className="bg-red-900 text-foreground">Falha</Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {result.rolls.map((roll, index) => (
                  <div
                    key={index}
                    className={`w-10 h-10 rounded flex items-center justify-center font-bold ${
                      roll >= 6 ? 'bg-green-700 text-white' : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {roll}
                  </div>
                ))}
              </div>

              <div className="p-3 bg-secondary/50 rounded-lg border border-border">
                <p className="text-sm text-foreground">
                  <span className="font-semibold">Sucessos: {result.successes}</span> 
                  <span className="text-gray-400"> (necessário {result.difficulty})</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {getAttributeName(result.attribute)} + {getSkillName(result.skill)}
                </p>
              </div>
            </div>

            <Button
              onClick={handleComplete}
              className="w-full"
              variant={result.isSuccess ? "default" : "secondary"}
            >
              {result.isSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmar Sucesso
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Confirmar Falha
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}