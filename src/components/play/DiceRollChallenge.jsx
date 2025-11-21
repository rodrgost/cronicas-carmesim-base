import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dices, CheckCircle, XCircle } from "lucide-react";

const DIFFICULTY_LABELS = {
  2: "Trivial",
  3: "Fácil",
  4: "Normal",
  5: "Difícil",
  6: "Muito Difícil",
  7: "Extremo"
};

const ATTRIBUTE_TRANSLATIONS = {
  strength: "Força",
  dexterity: "Destreza",
  stamina: "Vigor",
  charisma: "Carisma",
  manipulation: "Manipulação",
  composure: "Autocontrole",
  intelligence: "Inteligência",
  wits: "Raciocínio",
  resolve: "Perseverança"
};

const SKILL_TRANSLATIONS = {
  athletics: "Esportes",
  brawl: "Briga",
  drive: "Condução",
  firearms: "Armas de Fogo",
  stealth: "Furtividade",
  survival: "Sobrevivência",
  animal_ken: "Empatia com Animais",
  etiquette: "Etiqueta",
  insight: "Intuição",
  intimidation: "Intimidação",
  leadership: "Liderança",
  persuasion: "Persuasão",
  streetwise: "Manha",
  subterfuge: "Lábia",
  academics: "Acadêmicos",
  awareness: "Prontidão",
  finance: "Finanças",
  investigation: "Investigação",
  medicine: "Medicina",
  occult: "Ocultismo",
  politics: "Política",
  science: "Ciências",
  technology: "Tecnologia"
};

export default function DiceRollChallenge({ challenge, character, onComplete }) {
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState(null);

  if (!challenge) {
    return null;
  }

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
    setIsRolling(true);
    
    const attributeValue = getAttribute(challenge.attribute);
    const skillValue = getSkill(challenge.skill);
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

    const rollResult = {
      successes,
      rolls,
      isSuccess: successes >= challenge.difficulty
    };

    setTimeout(() => {
      setResult(rollResult);
      setIsRolling(false);
    }, 1500);
  };

  const handleComplete = () => {
    onComplete(result.successes, result);
  };

  const attributeValue = getAttribute(challenge.attribute);
  const skillValue = getSkill(challenge.skill);
  const dicePool = attributeValue + skillValue;

  const attributeName = ATTRIBUTE_TRANSLATIONS[challenge.attribute] || challenge.attribute || 'Desconhecido';
  const skillName = SKILL_TRANSLATIONS[challenge.skill] || (challenge.skill ? challenge.skill.replace(/_/g, ' ') : 'Desconhecido');

  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-foreground">
            <Dices className="w-5 h-5 text-primary" />
            Teste de Dados Necessário
          </CardTitle>
          {result && (
            result.isSuccess ? (
              <Badge className="bg-green-700 text-foreground">Sucesso!</Badge>
            ) : (
              <Badge variant="destructive" className="bg-red-900 text-foreground">Falha</Badge>
            )
          )}
        </div>
        <CardDescription className="text-gray-400">{challenge.description || "Role os dados para determinar o resultado."}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Atributo:</span>
            <p className="font-semibold text-foreground">{attributeName} ({attributeValue})</p>
          </div>
          <div>
            <span className="text-gray-400">Perícia:</span>
            <p className="font-semibold text-foreground">{skillName} ({skillValue})</p>
          </div>
          <div>
            <span className="text-gray-400">Parada de Dados:</span>
            <p className="font-semibold text-foreground">{dicePool} dados</p>
          </div>
          <div>
            <span className="text-gray-400">Dificuldade:</span>
            <p className="font-semibold text-foreground">{challenge.difficulty} ({DIFFICULTY_LABELS[challenge.difficulty] || "Normal"})</p>
          </div>
        </div>

        {result && (
          <div className="space-y-2">
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
            <p className="text-sm text-foreground">
              <span className="font-semibold">Sucessos: {result.successes}</span> <span className="text-gray-400">(necessário {challenge.difficulty})</span>
            </p>
          </div>
        )}

        {!result ? (
          <Button
            onClick={handleRoll}
            disabled={isRolling}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
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
        ) : (
          <Button
            onClick={handleComplete}
            className="w-full"
            variant={result.isSuccess ? "default" : "secondary"}
          >
            {result.isSuccess ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Continuar com Sucesso
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                Continuar com Falha
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}