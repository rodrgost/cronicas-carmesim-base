import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Eye, Heart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslation } from "@/components/i18n/LanguageContext";

const RELATIONSHIP_CONFIG = {
  unknown: { color: "text-gray-400", bg: "bg-gray-500/20", label: "Desconhecido" },
  ally: { color: "text-green-500", bg: "bg-green-500/20", label: "Aliado" },
  neutral: { color: "text-blue-400", bg: "bg-blue-500/20", label: "Neutro" },
  suspicious: { color: "text-yellow-500", bg: "bg-yellow-500/20", label: "Desconfiado" },
  hostile: { color: "text-red-500", bg: "bg-red-500/20", label: "Hostil" },
  friend: { color: "text-pink-500", bg: "bg-pink-500/20", label: "Amigo" },
  enemy: { color: "text-red-600", bg: "bg-red-600/20", label: "Inimigo" },
  mentor: { color: "text-purple-500", bg: "bg-purple-500/20", label: "Mentor" },
  rival: { color: "text-orange-500", bg: "bg-orange-500/20", label: "Rival" }
};

export default function NPCCard({ npc }) {
  const { t } = useTranslation();
  const relationConfig = RELATIONSHIP_CONFIG[npc.relationship_to_player] || RELATIONSHIP_CONFIG.unknown;
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="bg-card/50 border-border hover:border-purple-500/50 transition-all cursor-pointer group relative overflow-hidden">
          {npc.portrait_url && (
            <div className="w-full h-48 overflow-hidden">
              <img 
                src={npc.portrait_url} 
                alt={npc.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <CardHeader>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-purple-400" />
                  <CardTitle className="font-headline text-lg text-foreground group-hover:text-purple-400 transition-colors">
                    {npc.name}
                  </CardTitle>
                </div>
                {npc.role && (
                  <CardDescription className="text-gray-400 text-sm italic">
                    {npc.role}
                  </CardDescription>
                )}
              </div>
              <Badge variant="outline" className="text-purple-400 border-purple-500 bg-purple-500/10">
              NPC
              </Badge>
              </div>

              {npc.clan && (
              <Badge variant="outline" className="w-fit text-primary border-primary/50 bg-primary/10">
              {npc.clan}
              </Badge>
              )}
              </CardHeader>
              <CardContent className="space-y-3">
              {npc.appearance && (
              <p className="text-sm text-gray-400 line-clamp-2">{npc.appearance}</p>
              )}

              <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded text-xs font-semibold ${relationConfig.bg} ${relationConfig.color}`}>
              {relationConfig.label}
              </div>

              {npc.trust_level !== undefined && (
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  npc.trust_level > 3 ? 'border-green-500 text-green-500' :
                  npc.trust_level < -3 ? 'border-red-500 text-red-500' :
                  'border-gray-500 text-gray-400'
                }`}
              >
                {t('npc.trust')}: {npc.trust_level > 0 ? '+' : ''}{npc.trust_level}
              </Badge>
              )}
              </div>

              <Button
              variant="ghost"
              className="w-full text-purple-400 hover:text-purple-300 hover:bg-purple-950/30"
              >
              <Eye className="w-4 h-4 mr-2" />
              {t('npc.viewDetails')}
              </Button>
              </CardContent>
              </Card>
              </DialogTrigger>

              <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
              <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-purple-400" />
              <div>
              <DialogTitle className="font-headline text-2xl text-foreground">{npc.name}</DialogTitle>
              {npc.role && (
              <DialogDescription className="text-purple-400 italic">{npc.role}</DialogDescription>
              )}
              </div>
              </div>
              </DialogHeader>

              <div className="space-y-4 mt-4">
              {npc.portrait_url && (
              <div className="flex justify-center">
              <img 
              src={npc.portrait_url} 
              alt={npc.name}
              className="w-64 h-64 object-cover rounded-lg border-2 border-purple-500/30"
              />
              </div>
              )}
              {npc.clan && (
              <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">{t('npc.clan')}</h3>
              <Badge variant="outline" className="text-primary border-primary/50 bg-primary/10">
              {npc.clan}
              </Badge>
              </div>
              )}

              {npc.appearance && (
              <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">{t('npc.appearance')}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{npc.appearance}</p>
              </div>
              )}

              {npc.personality && (
              <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">{t('npc.personality')}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{npc.personality}</p>
              </div>
              )}

              {npc.motivations && (
              <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">{t('npc.motivations')}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{npc.motivations}</p>
              </div>
              )}

              <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">{t('npc.relationship')}</h3>
              <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded text-sm font-semibold ${relationConfig.bg} ${relationConfig.color}`}>
              {relationConfig.label}
              </div>
              {npc.trust_level !== undefined && (
              <Badge 
                variant="outline" 
                className={`${
                  npc.trust_level > 3 ? 'border-green-500 text-green-500' :
                  npc.trust_level < -3 ? 'border-red-500 text-red-500' :
                  'border-gray-500 text-gray-400'
                }`}
              >
                <Heart className="w-3 h-3 mr-1" />
                {t('npc.trust')}: {npc.trust_level > 0 ? '+' : ''}{npc.trust_level}
              </Badge>
              )}
              </div>
              </div>

              {npc.knowledge && (
              <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">{t('npc.knowledge')}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{npc.knowledge}</p>
              </div>
              )}

              {npc.current_mood && (
              <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">{t('npc.mood')}</h3>
              <p className="text-gray-300 text-sm italic">{npc.current_mood}</p>
              </div>
              )}
              </div>
              </DialogContent>
    </Dialog>
  );
}