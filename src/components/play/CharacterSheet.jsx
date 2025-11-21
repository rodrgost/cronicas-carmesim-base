import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skull, Heart, Brain, Droplet, Calendar } from "lucide-react";
import DisciplineActivator from "../disciplines/DisciplineActivator";
import { useTranslation } from "@/components/i18n/LanguageContext";

export default function CharacterSheet({ character, chronicle, refreshCharacter, world, onUseDiscipline }) {
  const { t } = useTranslation();
  
  if (!character || !chronicle) return null;

  const maxHealth = character.max_health || (5 + (character.attributes?.physical?.stamina || 1));
  const maxWillpower = character.max_willpower || ((character.attributes?.social?.composure || 1) + (character.attributes?.mental?.resolve || 1));

  const currentHealth = Math.min(character.health || 0, maxHealth);
  const currentWillpower = Math.min(character.willpower || 0, maxWillpower);

  const currentDay = chronicle.current_day || 1;
  const daysSinceRest = currentDay - (chronicle.last_rest_day || 0);

  return (
    <div className="p-4 space-y-4 bg-background">
      {/* Identity */}
      <div className="text-center space-y-2">
        {character.portrait_url && (
          <div className="flex justify-center mb-2">
            <img 
              src={character.portrait_url} 
              alt={character.name}
              className="w-24 h-24 object-cover rounded-lg border-2 border-primary/30"
            />
          </div>
        )}
        <h2 className="font-headline text-xl font-bold text-foreground">{character.name}</h2>
        <p className="text-xs text-gray-400">{character.concept}</p>
        <Badge variant="outline" className="text-primary border-primary bg-primary/10 text-xs">
          {character.clan}
        </Badge>
      </div>

      <Separator className="bg-border" />

      {/* Current Day & Rest Tracker */}
      <Card className="bg-card border-border">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm font-semibold text-foreground">{t('character.day')} {currentDay}</p>
                <p className="text-xs text-gray-400">
                  {daysSinceRest === 0 
                    ? t('character.restedToday')
                    : `${daysSinceRest} ${t('character.daysSinceRest')}`}
                </p>
              </div>
            </div>
            {daysSinceRest > 2 && (
              <Badge variant="destructive" className="bg-red-900">
                {t('character.exhausted')}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Trackers */}
      <div className="space-y-3">
        {/* Health */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400 font-medium">{t('character.health')}</span>
            <span className="text-gray-400">{currentHealth}/{maxHealth}</span>
          </div>
          <Progress 
            value={(currentHealth / maxHealth) * 100} 
            className="h-2 bg-secondary [&>*]:bg-red-700" 
          />
        </div>

        {/* Willpower */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400 font-medium">{t('character.willpower')}</span>
            <span className="text-gray-400">{currentWillpower}/{maxWillpower}</span>
          </div>
          <Progress 
            value={(currentWillpower / maxWillpower) * 100} 
            className="h-2 bg-secondary [&>*]:bg-blue-600" 
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Humanity */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400 font-medium">{t('character.humanity')}</span>
              <span className="text-gray-400">{character.humanity}/10</span>
            </div>
            <Progress 
              value={(character.humanity / 10) * 100} 
              className="h-2 bg-secondary [&>*]:bg-purple-500" 
            />
          </div>

          {/* Hunger */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400 font-medium">{t('character.hunger')}</span>
              <span className="text-gray-400">{character.hunger}/5</span>
            </div>
            <Progress 
              value={(character.hunger / 5) * 100} 
              className="h-2 bg-secondary [&>*]:bg-orange-600" 
            />
          </div>
        </div>

        {character.blood_potency !== undefined && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400 font-medium">{t('character.bloodPotency')}</span>
              <span className="text-gray-400">{character.blood_potency}</span>
            </div>
          </div>
        )}
      </div>

      <Separator className="bg-border" />

      {/* Attributes */}
      <Card className="bg-card border-border">
        <CardHeader className="py-3">
          <CardTitle className="text-sm text-foreground">{t('character.attributes')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 py-3">
          {["physical", "social", "mental"].map(category => (
            <div key={category}>
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">
                {t(`attributes.${category}`)}
              </p>
              <div className="space-y-0.5">
                {Object.entries(character.attributes[category] || {}).map(([attr, value]) => (
                  <div key={attr} className="flex justify-between items-center text-xs">
                    <span className="text-gray-300">{t(`attributes.${attr}`)}</span>
                    <span className="flex-shrink-0 tracking-wide text-sm leading-none">
                      <span className="text-primary">{"●".repeat(value || 0)}</span>
                      <span className="text-gray-700 opacity-30">{"●".repeat(5-(value || 0))}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card className="bg-card border-border">
        <CardHeader className="py-3">
          <CardTitle className="text-sm text-foreground">{t('character.skills')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 py-3">
          {["physical", "social", "mental"].map(category => {
            const categorySkills = Object.entries(character.skills[category] || {})
              .filter(([_, value]) => value > 0);

            if (categorySkills.length === 0) return null;

            return (
              <div key={category}>
                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">
                  {t(`attributes.${category}`)}
                </p>
                <div className="space-y-0.5">
                  {categorySkills.map(([skill, value]) => (
                    <div key={skill} className="flex justify-between items-center text-xs">
                      <span className="text-gray-300">{t(`skills.${skill}`)}</span>
                      <span className="flex-shrink-0 tracking-wide text-sm leading-none">
                        <span className="text-primary">{"●".repeat(value)}</span>
                        <span className="text-gray-700 opacity-30">{"●".repeat(5-value)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Disciplines */}
      {character.disciplines && Object.keys(character.disciplines).length > 0 && onUseDiscipline && (
        <DisciplineActivator
          character={character}
          onUseDiscipline={onUseDiscipline}
        />
      )}
    </div>
  );
}