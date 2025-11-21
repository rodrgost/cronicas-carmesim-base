import React from "react";
import { Heart, Brain, Skull, Droplet, TrendingUp, TrendingDown } from "lucide-react";

const StatChange = ({ label, oldValue, newValue, icon: Icon }) => {
  const change = newValue - oldValue;
  if (change === 0) return null;
  
  const isPositive = change > 0;
  
  return (
    <div className={`flex items-center gap-2 px-2 py-1 rounded ${
      isPositive ? 'bg-green-900/30 border border-green-700/50' : 'bg-red-900/40 border border-red-700/60'
    }`}>
      <Icon className={`w-3 h-3 ${isPositive ? 'text-green-400' : 'text-red-400'}`} />
      <span className="text-xs text-gray-300">{label}:</span>
      <span className={`text-xs font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? '+' : ''}{change}
      </span>
      <span className="text-xs text-gray-500">({oldValue} → {newValue})</span>
    </div>
  );
};

const WorldStateChange = ({ label, change }) => {
  if (!change || change === 0) return null;
  
  const isIncrease = change > 0;
  const TrendIcon = isIncrease ? TrendingUp : TrendingDown;
  
  return (
    <div className={`flex items-center gap-2 px-2 py-1 rounded ${
      isIncrease ? 'bg-orange-900/30 border border-orange-700/50' : 'bg-blue-900/30 border border-blue-700/50'
    }`}>
      <TrendIcon className={`w-3 h-3 ${isIncrease ? 'text-orange-400' : 'text-blue-400'}`} />
      <span className="text-xs text-gray-300">{label}:</span>
      <span className={`text-xs font-bold ${isIncrease ? 'text-orange-400' : 'text-blue-400'}`}>
        {isIncrease ? '+' : ''}{change}
      </span>
    </div>
  );
};

export default function StatChangesDisplay({ statUpdates, worldStateChanges, character, chronicle }) {
  const hasChanges = (statUpdates && Object.keys(statUpdates).length > 0) || 
                     (worldStateChanges && Object.keys(worldStateChanges).length > 0);
  
  if (!hasChanges || !character) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {statUpdates && (
        <>
          {statUpdates.health !== undefined && (
            <StatChange label="Vitalidade" oldValue={character.health} newValue={statUpdates.health} icon={Heart} />
          )}
          {statUpdates.willpower !== undefined && (
            <StatChange label="Força de Vontade" oldValue={character.willpower} newValue={statUpdates.willpower} icon={Brain} />
          )}
          {statUpdates.humanity !== undefined && (
            <StatChange label="Humanidade" oldValue={character.humanity} newValue={statUpdates.humanity} icon={Skull} />
          )}
          {statUpdates.hunger !== undefined && (
            <StatChange label="Fome" oldValue={character.hunger} newValue={statUpdates.hunger} icon={Droplet} />
          )}
        </>
      )}
      
      {worldStateChanges && chronicle && chronicle.world_state && (
        <>
          {worldStateChanges.inquisition_activity !== undefined && (
            <WorldStateChange label="Atividade Inquisição" change={worldStateChanges.inquisition_activity} />
          )}
          {worldStateChanges.masquerade_threat !== undefined && (
            <WorldStateChange label="Ameaça à Máscara" change={worldStateChanges.masquerade_threat} />
          )}
          {worldStateChanges.political_tension !== undefined && (
            <WorldStateChange label="Tensão Política" change={worldStateChanges.political_tension} />
          )}
          {worldStateChanges.supernatural_activity !== undefined && (
            <WorldStateChange label="Atividade Sobrenatural" change={worldStateChanges.supernatural_activity} />
          )}
        </>
      )}
    </div>
  );
}