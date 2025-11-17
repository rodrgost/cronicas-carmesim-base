import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users, MessageCircle, Heart, Shield, Skull, AlertTriangle, Smile } from "lucide-react";

const RELATIONSHIP_CONFIG = {
  unknown: { icon: AlertTriangle, color: "text-gray-400", label: "Desconhecido", bgColor: "bg-gray-500/20" },
  ally: { icon: Shield, color: "text-green-500", label: "Aliado", bgColor: "bg-green-500/20" },
  neutral: { icon: Smile, color: "text-blue-400", label: "Neutro", bgColor: "bg-blue-500/20" },
  suspicious: { icon: AlertTriangle, color: "text-yellow-500", label: "Desconfiado", bgColor: "bg-yellow-500/20" },
  hostile: { icon: Skull, color: "text-red-500", label: "Hostil", bgColor: "bg-red-500/20" },
  friend: { icon: Heart, color: "text-pink-500", label: "Amigo", bgColor: "bg-pink-500/20" },
  enemy: { icon: Skull, color: "text-red-600", label: "Inimigo", bgColor: "bg-red-600/20" },
  mentor: { icon: Shield, color: "text-purple-500", label: "Mentor", bgColor: "bg-purple-500/20" },
  rival: { icon: AlertTriangle, color: "text-orange-500", label: "Rival", bgColor: "bg-orange-500/20" }
};

export default function NPCPanel({ npcs, activeNPCIds, onTalkToNPC, currentNPCId }) {
  if (!npcs || !activeNPCIds) {
    return null;
  }

  const activeNPCs = npcs.filter(npc => activeNPCIds.includes(npc.id));

  if (activeNPCs.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            NPCs na Cena
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 italic">Nenhum NPC presente no momento</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border shadow-[0_0_15px_rgba(220,38,38,0.15)]">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          NPCs na Cena ({activeNPCs.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 overflow-y-auto space-y-3">
          {activeNPCs.map((npc, index) => {
            const relationConfig = RELATIONSHIP_CONFIG[npc.relationship_to_player] || RELATIONSHIP_CONFIG.unknown;
            const RelationIcon = relationConfig.icon;
            const isCurrentNPC = currentNPCId === npc.id;

            return (
              <div key={npc.id}>
                <div className={`space-y-2 p-3 rounded-lg border transition-all ${
                  isCurrentNPC 
                    ? 'border-primary bg-primary/10 shadow-[0_0_10px_rgba(220,38,38,0.3)]' 
                    : 'border-border bg-secondary/50'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">{npc.name}</h4>
                        {isCurrentNPC && (
                          <Badge className="bg-primary text-xs">Conversando</Badge>
                        )}
                      </div>
                      {npc.clan && (
                        <p className="text-xs text-gray-400">{npc.clan}</p>
                      )}
                      {npc.role && (
                        <p className="text-xs text-primary italic">{npc.role}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant={isCurrentNPC ? "default" : "outline"}
                      onClick={() => onTalkToNPC(isCurrentNPC ? null : npc.id)}
                      className={isCurrentNPC ? "bg-primary hover:bg-primary/90" : "border-border"}
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      {isCurrentNPC ? "Parar" : "Falar"}
                    </Button>
                  </div>

                  {npc.appearance && (
                    <p className="text-xs text-gray-400 line-clamp-2">{npc.appearance}</p>
                  )}

                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${relationConfig.bgColor}`}>
                      <RelationIcon className={`w-3 h-3 ${relationConfig.color}`} />
                      <span className={relationConfig.color}>{relationConfig.label}</span>
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
                        Confiança: {npc.trust_level > 0 ? '+' : ''}{npc.trust_level}
                      </Badge>
                    )}
                  </div>

                  {npc.current_mood && (
                    <p className="text-xs text-gray-500 italic">
                      Humor: {npc.current_mood}
                    </p>
                  )}
                </div>
                {index < activeNPCs.length - 1 && <Separator className="my-2" />}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}