import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Brain, Skull, Droplet, TrendingUp, Users, Zap, Clock, Package, UserX, UserCheck, UserMinus } from "lucide-react";

const STAT_ICONS = {
  health: { icon: Heart, label: "Vitalidade", color: "text-red-500" },
  willpower: { icon: Brain, label: "Força de Vontade", color: "text-blue-500" },
  humanity: { icon: Skull, label: "Humanidade", color: "text-purple-500" },
  hunger: { icon: Droplet, label: "Fome", color: "text-red-600" }
};

const WORLD_STATE_LABELS = {
  inquisition_activity: "Atividade da Inquisição",
  masquerade_threat: "Ameaça à Máscara",
  political_tension: "Tensão Política",
  supernatural_activity: "Atividade Sobrenatural"
};

export default function ChangesSummary({ changes }) {
  console.log("🎨 [ChangesSummary] Received changes prop:", changes);
  
  if (!changes) {
    console.log("⚠️ [ChangesSummary] No changes object - returning null");
    return null;
  }

  const { statUpdates, worldStateChanges, worldEvent, npcUpdates, newNPCs, timePassageEffects, chronicleUpdates, itemUpdates, npcStatusChanges } = changes;

  console.log("🎨 [ChangesSummary] Destructured:", {
    hasStatUpdates: !!statUpdates,
    statUpdates,
    hasWorldStateChanges: !!worldStateChanges,
    hasWorldEvent: !!worldEvent,
    hasNpcUpdates: !!(npcUpdates && npcUpdates.length > 0),
    hasNewNPCs: !!(newNPCs && newNPCs.length > 0),
    hasTimePassageEffects: !!timePassageEffects
  });

  const hasChanges = statUpdates || worldStateChanges || worldEvent || 
                     (npcUpdates && npcUpdates.length > 0) || 
                     (newNPCs && newNPCs.length > 0) ||
                     timePassageEffects ||
                     (chronicleUpdates && chronicleUpdates.current_day) ||
                     (itemUpdates && itemUpdates.length > 0) ||
                     (npcStatusChanges && npcStatusChanges.length > 0);

  if (!hasChanges) {
    console.log("⚠️ [ChangesSummary] No actual changes to display - returning null");
    return null;
  }

  console.log("✅ [ChangesSummary] Rendering card with changes");

  return (
    <Card className="bg-red-950/60 border-red-800/50 shadow-lg">
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-red-400" />
          <p className="text-xs font-semibold text-red-400 uppercase tracking-wide">
            Alterações de Estado
          </p>
        </div>

        {/* Chronicle Day Update */}
        {chronicleUpdates && chronicleUpdates.current_day && (
          <div className="space-y-2 pb-2 border-b border-red-800/30">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span className="text-gray-300">Dia atual:</span>
              <span className="font-bold text-yellow-300">{chronicleUpdates.current_day}</span>
            </div>
          </div>
        )}

        {/* Time Passage Effects */}
        {timePassageEffects && (
          <div className="space-y-2 pb-2 border-b border-red-800/30">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span className="text-gray-300 font-semibold">Passagem de Tempo</span>
            </div>
            {timePassageEffects.daysPassed > 0 && (
              <div className="flex items-center gap-2 text-sm ml-6">
                <span className="text-gray-400">Dias passados:</span>
                <span className="font-bold text-yellow-300">+{timePassageEffects.daysPassed}</span>
              </div>
            )}
            {timePassageEffects.healthChange !== 0 && (
              <div className="flex items-center gap-2 text-sm ml-6">
                <Heart className="w-3 h-3 text-red-500" />
                <span className="text-gray-400">Vitalidade:</span>
                <span className={`font-bold ${timePassageEffects.healthChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {timePassageEffects.healthChange > 0 ? '+' : ''}{timePassageEffects.healthChange}
                </span>
              </div>
            )}
            {timePassageEffects.willpowerChange !== 0 && (
              <div className="flex items-center gap-2 text-sm ml-6">
                <Brain className="w-3 h-3 text-blue-500" />
                <span className="text-gray-400">Força de Vontade:</span>
                <span className={`font-bold ${timePassageEffects.willpowerChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {timePassageEffects.willpowerChange > 0 ? '+' : ''}{timePassageEffects.willpowerChange}
                </span>
              </div>
            )}
            {timePassageEffects.hungerChange !== 0 && (
              <div className="flex items-center gap-2 text-sm ml-6">
                <Droplet className="w-3 h-3 text-red-600" />
                <span className="text-gray-400">Fome:</span>
                <span className={`font-bold ${timePassageEffects.hungerChange > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {timePassageEffects.hungerChange > 0 ? '+' : ''}{timePassageEffects.hungerChange}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Stat Updates */}
        {statUpdates && Object.keys(statUpdates).length > 0 && (
          <div className="space-y-2">
            {Object.entries(statUpdates).map(([stat, newValue]) => {
              const config = STAT_ICONS[stat];
              if (!config) return null;
              const Icon = config.icon;
              
              return (
                <div key={stat} className="flex items-center gap-2 text-sm">
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  <span className="text-gray-300">{config.label}:</span>
                  <span className="font-bold text-red-300">{newValue}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* World State Changes */}
        {worldStateChanges && Object.keys(worldStateChanges).length > 0 && (
          <div className="space-y-2 pt-2 border-t border-red-800/30">
            {Object.entries(worldStateChanges).map(([key, value]) => {
              const label = WORLD_STATE_LABELS[key];
              if (!label) return null;
              
              return (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-orange-400" />
                  <span className="text-gray-300">{label}:</span>
                  <span className="font-bold text-orange-300">{value}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* New NPCs */}
        {newNPCs && newNPCs.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-red-800/30">
            {newNPCs.map((npc, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">Novo NPC:</span>
                <span className="font-bold text-purple-300">{npc.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* World Event */}
        {worldEvent && (
          <div className="pt-2 border-t border-red-800/30">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-gray-300">Evento Mundial:</span>
              <span className="font-bold text-yellow-300">{worldEvent.title}</span>
            </div>
          </div>
        )}

        {/* Item Updates */}
        {itemUpdates && itemUpdates.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-red-800/30">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-blue-400">Inventário</span>
            </div>
            {itemUpdates.map((update, index) => (
              <div key={index} className="flex items-center gap-2 text-sm ml-6">
                {update.action === 'added' && (
                  <>
                    <span className="text-green-400">+</span>
                    <span className="text-gray-300">{update.item.name}</span>
                    {update.item.quantity > 1 && (
                      <span className="text-gray-400">x{update.item.quantity}</span>
                    )}
                  </>
                )}
                {update.action === 'updated' && (
                  <>
                    <span className="text-gray-300">{update.itemName}:</span>
                    <span className="text-gray-400">{update.oldQuantity}</span>
                    <span className="text-gray-500">→</span>
                    <span className="font-bold text-blue-300">{update.newQuantity}</span>
                  </>
                )}
                {update.action === 'removed' && (
                  <>
                    <span className="text-red-400">-</span>
                    <span className="text-gray-300">{update.itemName}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* NPC Status Changes */}
        {npcStatusChanges && npcStatusChanges.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-red-800/30">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-purple-400">Mudanças em NPCs</span>
            </div>
            {npcStatusChanges.filter(change => change && change.npcName).map((change, index) => (
              <div key={index} className="space-y-1 ml-6">
                <div className="flex items-center gap-2 text-sm">
                  {change.changeType === 'death' && (
                    <>
                      <UserX className="w-3 h-3 text-red-500" />
                      <span className="font-bold text-red-400">{change.npcName}</span>
                      <span className="text-gray-400">morreu</span>
                    </>
                  )}
                  {change.changeType === 'relationship' && (
                    <>
                      {change.newValue === 'enemy' || change.newValue === 'hostile' ? (
                        <UserX className="w-3 h-3 text-red-500" />
                      ) : change.newValue === 'ally' || change.newValue === 'friend' ? (
                        <UserCheck className="w-3 h-3 text-green-500" />
                      ) : (
                        <UserMinus className="w-3 h-3 text-gray-500" />
                      )}
                      <span className="font-bold text-purple-300">{change.npcName}</span>
                      <span className="text-gray-400">agora é</span>
                      <span className={`font-bold ${
                        change.newValue === 'enemy' || change.newValue === 'hostile' ? 'text-red-400' :
                        change.newValue === 'ally' || change.newValue === 'friend' ? 'text-green-400' :
                        'text-gray-300'
                      }`}>{change.newValue}</span>
                    </>
                  )}
                  {change.changeType === 'trust' && (
                    <>
                      <Heart className="w-3 h-3 text-pink-500" />
                      <span className="font-bold text-purple-300">{change.npcName}</span>
                      <span className="text-gray-400">confiança:</span>
                      <span className="text-gray-500">{change.oldValue || '0'}</span>
                      <span className="text-gray-500">→</span>
                      <span className="font-bold text-pink-300">{change.newValue}</span>
                    </>
                  )}
                  {change.changeType === 'mood' && (
                    <>
                      <Users className="w-3 h-3 text-yellow-500" />
                      <span className="font-bold text-purple-300">{change.npcName}</span>
                      <span className="text-gray-400">humor:</span>
                      <span className="text-yellow-300">{change.newValue}</span>
                    </>
                  )}
                  {change.changeType === 'other' && (
                    <>
                      <Users className="w-3 h-3 text-gray-500" />
                      <span className="font-bold text-purple-300">{change.npcName}</span>
                    </>
                  )}
                </div>
                {change?.description && (
                  <div className="text-xs text-gray-400 ml-5">{change.description}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}