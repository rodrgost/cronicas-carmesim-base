import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown, MessageCircle, Users, Info } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const RELATIONSHIP_CONFIG = {
  unknown: { icon: "❓", color: "text-gray-400", label: "Desconhecido" },
  ally: { icon: "🤝", color: "text-green-400", label: "Aliado" },
  neutral: { icon: "😐", color: "text-yellow-400", label: "Neutro" },
  suspicious: { icon: "🤨", color: "text-orange-400", label: "Suspeito" },
  hostile: { icon: "😠", color: "text-red-400", label: "Hostil" },
  friend: { icon: "😊", color: "text-blue-400", label: "Amigo" },
  enemy: { icon: "⚔️", color: "text-red-600", label: "Inimigo" },
  mentor: { icon: "📚", color: "text-purple-400", label: "Mentor" },
  rival: { icon: "⚡", color: "text-amber-400", label: "Rival" }
};

export default function NPCCollapsible({ npcs, activeNPCIds, onTalkToNPC, currentNPCId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNPC, setSelectedNPC] = useState(null);

  if (npcs.length === 0) return null;

  return (
    <>
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="border-t border-border bg-card"
      >
        <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary/50 transition-colors">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              NPCs da História ({npcs.length})
            </span>
          </div>
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          )}
        </CollapsibleTrigger>

        <CollapsibleContent className="px-4 pb-4">
          <div className="flex flex-wrap gap-2 max-h-[30vh] overflow-y-auto">
            {npcs.map((npc) => {
              const relationshipConfig = RELATIONSHIP_CONFIG[npc.relationship_to_player] || RELATIONSHIP_CONFIG.unknown;
              const isTalking = currentNPCId === npc.id;

              return (
                <div
                  key={npc.id}
                  className={`relative p-2 rounded-lg border w-[140px] ${
                    isTalking 
                      ? 'bg-purple-950/50 border-purple-700' 
                      : 'bg-card border-border'
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    {npc.portrait_url && (
                      <img 
                        src={npc.portrait_url} 
                        alt={npc.name}
                        className="w-full h-24 object-cover rounded-md mb-1"
                      />
                    )}
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-semibold text-xs text-foreground truncate flex-1">
                        {npc.name}
                      </h4>
                      <button
                        onClick={() => setSelectedNPC(npc)}
                        className="text-gray-400 hover:text-primary transition-colors flex-shrink-0"
                      >
                        <Info className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <p className="text-[10px] text-gray-400 truncate">{npc.clan}</p>
                    
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs">{relationshipConfig.icon}</span>
                    </div>

                    <Button
                      size="sm"
                      variant={isTalking ? "outline" : "default"}
                      onClick={() => onTalkToNPC(isTalking ? null : npc.id)}
                      className={`w-full mt-1 h-6 text-[10px] ${
                        isTalking 
                          ? "border-purple-700 text-purple-300 hover:bg-purple-900" 
                          : "bg-primary hover:bg-primary/90"
                      }`}
                    >
                      <MessageCircle className="w-2.5 h-2.5 mr-1" />
                      {isTalking ? "Parar" : "Falar"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Dialog open={!!selectedNPC} onOpenChange={(open) => !open && setSelectedNPC(null)}>
        <DialogContent className="bg-card border-border max-w-md max-h-[80vh] overflow-y-auto">
          {selectedNPC && (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-2">
                  {selectedNPC.name}
                  {currentNPCId === selectedNPC.id && (
                    <Badge variant="outline" className="bg-purple-900 text-purple-300 border-purple-700 text-xs">
                      Conversando
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {selectedNPC.clan} • {selectedNPC.role}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 text-sm">
                {selectedNPC.portrait_url && (
                  <div className="flex justify-center">
                    <img 
                      src={selectedNPC.portrait_url} 
                      alt={selectedNPC.name}
                      className="w-48 h-48 object-cover rounded-lg border-2 border-primary/30"
                    />
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Aparência</h4>
                  <p className="text-gray-300">{selectedNPC.appearance}</p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Personalidade</h4>
                  <p className="text-gray-300">{selectedNPC.personality}</p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Motivações</h4>
                  <p className="text-gray-300">{selectedNPC.motivations}</p>
                </div>

                {selectedNPC.knowledge && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Conhecimento</h4>
                    <p className="text-gray-300">{selectedNPC.knowledge}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Relacionamento:</span>
                    <div className="flex items-center gap-1">
                      <span>{RELATIONSHIP_CONFIG[selectedNPC.relationship_to_player]?.icon}</span>
                      <span className={`text-xs ${RELATIONSHIP_CONFIG[selectedNPC.relationship_to_player]?.color}`}>
                        {RELATIONSHIP_CONFIG[selectedNPC.relationship_to_player]?.label}
                      </span>
                    </div>
                  </div>
                  {selectedNPC.trust_level !== undefined && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">Confiança:</span>
                      <span className={`text-xs font-semibold ${
                        selectedNPC.trust_level > 0 ? "text-green-400" : 
                        selectedNPC.trust_level < 0 ? "text-red-400" : "text-gray-400"
                      }`}>
                        {selectedNPC.trust_level > 0 ? '+' : ''}{selectedNPC.trust_level}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  variant={currentNPCId === selectedNPC.id ? "outline" : "default"}
                  onClick={() => {
                    onTalkToNPC(currentNPCId === selectedNPC.id ? null : selectedNPC.id);
                    setSelectedNPC(null);
                  }}
                  className={`w-full ${
                    currentNPCId === selectedNPC.id
                      ? "border-purple-700 text-purple-300 hover:bg-purple-900"
                      : "bg-primary hover:bg-primary/90"
                  }`}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {currentNPCId === selectedNPC.id ? "Parar Conversa" : "Falar com este NPC"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}