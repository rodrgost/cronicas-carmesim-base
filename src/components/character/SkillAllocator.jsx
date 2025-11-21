import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus, HelpCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslation } from "@/components/i18n/LanguageContext";

const TOTAL_POINTS = 26;

export default function SkillAllocator({ skills, setSkills }) {
  const { t, language } = useTranslation();

  const SKILL_DESCRIPTIONS = {
    athletics: language === 'en' ? "Running, jumping, swimming, climbing, and other physical activities." : "Corrida, salto, natação, escalada e outras atividades físicas.",
    brawl: language === 'en' ? "Unarmed melee combat, including vampiric claws and fangs." : "Combate corpo a corpo desarmado, incluindo garras e presas vampíricas.",
    drive: language === 'en' ? "Driving ground vehicles, including chases and risky maneuvers." : "Condução de veículos terrestres, incluindo perseguições e manobras arriscadas.",
    firearms: language === 'en' ? "Use of pistols, rifles, and other firearms." : "Uso de pistolas, rifles e outras armas de fogo.",
    stealth: language === 'en' ? "Moving silently, hiding, and going unnoticed." : "Movimento silencioso, esconder-se e passar despercebido.",
    survival: language === 'en' ? "Tracking, navigation, finding shelter and food in wild environments." : "Rastreamento, navegação, encontrar abrigo e comida em ambientes selvagens.",
    animal_ken: language === 'en' ? "Handling animals, calming them, or commanding them (especially useful for Gangrel)." : "Lidar com animais, acalmá-los ou comandá-los (especialmente útil para Gangrel).",
    etiquette: language === 'en' ? "Proper social behavior in high society and vampiric courts." : "Comportamento social adequado em alta sociedade e cortes vampíricas.",
    insight: language === 'en' ? "Reading facial expressions, body language, and detecting lies." : "Ler expressões faciais, linguagem corporal e detectar mentiras.",
    intimidation: language === 'en' ? "Threatening, coercing, and scaring others through physical presence or threats." : "Ameaçar, coagir e assustar outros através de presença física ou ameaças.",
    leadership: language === 'en' ? "Inspiring and commanding others, giving orders that are followed." : "Inspirar e comandar outros, dar ordens que são seguidas.",
    persuasion: language === 'en' ? "Convincing through honest arguments and genuine charisma." : "Convencer através de argumentos honestos e carisma genuíno.",
    streetwise: language === 'en' ? "Knowledge of the streets, criminal contacts, and urban culture." : "Conhecimento das ruas, contatos criminosos e cultura urbana.",
    subterfuge: language === 'en' ? "Lying convincingly, creating disguises, and deceiving others." : "Mentir convincentemente, criar disfarces e enganar outros.",
    academics: language === 'en' ? "Knowledge in humanities, history, philosophy, and formal education." : "Conhecimento em humanidades, história, filosofia e educação formal.",
    awareness: language === 'en' ? "Sensory perception, noticing details, and being aware of the environment." : "Percepção sensorial, notar detalhes e estar atento ao ambiente.",
    finance: language === 'en' ? "Resource management, investments, and understanding of economics." : "Gestão de recursos, investimentos e compreensão de economia.",
    investigation: language === 'en' ? "Analyzing clues, logical deduction, and solving mysteries." : "Analisar pistas, dedução lógica e resolver mistérios.",
    medicine: language === 'en' ? "Medical knowledge, first aid, and anatomy." : "Conhecimento médico, primeiros socorros e anatomia.",
    occult: language === 'en' ? "Knowledge of the supernatural, rituals, magic, and vampiric society." : "Conhecimento sobre o sobrenatural, rituais, magia e sociedade vampírica.",
    politics: language === 'en' ? "Understanding of political systems, bureaucracy, and intrigue." : "Compreensão de sistemas políticos, burocracia e intriga.",
    science: language === 'en' ? "Knowledge in natural sciences, physics, chemistry, and biology." : "Conhecimento em ciências naturais, física, química e biologia.",
    technology: language === 'en' ? "Use of computers, hacking, electronics, and modern technology." : "Uso de computadores, hacking, eletrônicos e tecnologia moderna."
  };
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

  const renderSkillCategory = (category) => (
    <Card key={category} className="bg-secondary border-border">
      <CardHeader>
        <CardTitle className="text-lg text-foreground">{t(`attributes.${category}`)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {Object.keys(skills[category]).map((skill) => (
          <div key={skill} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-foreground">{t(`skills.${skill}`)}</span>
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
                  {SKILL_DESCRIPTIONS[skill]}
                </PopoverContent>
              </Popover>
            </div>
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
        {renderSkillCategory("physical")}
        {renderSkillCategory("social")}
        {renderSkillCategory("mental")}
      </div>

      <p className="text-sm text-gray-500 text-center">
        {language === 'en' ? "Skills start at 0. Distribute points between them (max 5 per skill)." : "Perícias começam em 0. Distribua pontos entre elas (máximo 5 por perícia)."}
      </p>
    </div>
  );
}