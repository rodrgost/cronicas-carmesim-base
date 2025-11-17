import React from "react";
import { BookOpen, MessageSquare, User, Heart, Brain, Skull, Droplet, TrendingUp, TrendingDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";

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

export default function StoryMessage({ message, npcName, character, chronicle }) {
  const isUser = message.role === "user";

  // Don't show empty messages
  if (!message.content || message.content.trim() === "") {
    return null;
  }

  let content = message.content;
  let isNPCDialogue = false;
  let isPlayerAction = false;
  let shouldShow = false;
  let statUpdates = null;
  let worldStateChanges = null;
  
  // Try to parse JSON
  try {
    const parsed = JSON.parse(message.content);
    
    // Extract stat updates if present
    if (parsed.statUpdates && typeof parsed.statUpdates === 'object') {
      statUpdates = parsed.statUpdates;
    }
    
    // Extract world state changes if present
    if (parsed.worldStateChanges && typeof parsed.worldStateChanges === 'object') {
      worldStateChanges = parsed.worldStateChanges;
    }
    
    // MOST IMPORTANT: Extract player action FIRST
    if (parsed.playerAction !== undefined && parsed.playerAction !== null) {
      content = parsed.playerAction;
      isPlayerAction = true;
      shouldShow = true;
    }
    // Extract NPC dialogue
    else if (parsed.npcDialogue !== undefined && parsed.npcDialogue !== null) {
      content = parsed.npcDialogue;
      isNPCDialogue = true;
      shouldShow = true;
    } 
    // Extract story event
    else if (parsed.storyEvent !== undefined && parsed.storyEvent !== null) {
      content = parsed.storyEvent;
      shouldShow = true;
    }
    // Filter out system messages that have ONLY internal fields
    else if (
      parsed.diceRollResult !== undefined || 
      parsed.characterStats !== undefined || 
      parsed.worldDescription !== undefined || 
      parsed.timeOfDay !== undefined ||
      parsed.turnCount !== undefined ||
      parsed.conversationMode !== undefined ||
      parsed.outcomes !== undefined ||
      parsed.diceRollChallenge !== undefined ||
      parsed.statUpdates !== undefined ||
      parsed.activeNPCs !== undefined ||
      parsed.newNPCs !== undefined ||
      parsed.npcUpdate !== undefined ||
      parsed.worldStateChanges !== undefined ||
      parsed.worldEvent !== undefined
    ) {
      // Pure system message - don't show
      return null;
    }
    // If JSON but no recognized field, don't show
    else {
      return null;
    }
  } catch (e) {
    // Not JSON - it's raw text from assistant
    const trimmed = content.trim();
    
    // Check if message contains JSON anywhere in the text
    // Look for common JSON patterns
    const jsonPatterns = [
      /\n\n\s*\{/,  // Double newline before {
      /\n\s*\{[\s\S]*"[^"]+"\s*:/,  // Newline + JSON object with key
      /,\s*\n\s*"[^"]+"\s*:/,  // Comma + newline + JSON key
    ];
    
    let foundJsonStart = -1;
    for (const pattern of jsonPatterns) {
      const match = trimmed.match(pattern);
      if (match) {
        foundJsonStart = match.index;
        break;
      }
    }
    
    if (foundJsonStart !== -1) {
      // Extract only the narrative part before the JSON
      content = trimmed.substring(0, foundJsonStart).trim();
      shouldShow = true;
    }
    // Check if entire message starts with JSON
    else if (
      trimmed.startsWith('{') || 
      trimmed.startsWith('[') || 
      trimmed.startsWith('<') ||
      trimmed.includes('<?xml') ||
      trimmed.includes('<!DOCTYPE') ||
      trimmed.includes('<assistant>') ||
      trimmed.includes('</assistant>') ||
      trimmed.includes('<thinking>') ||
      trimmed.includes('</thinking>') ||
      trimmed.includes('<output>') ||
      trimmed.includes('</output>') ||
      trimmed.startsWith('```')
    ) {
      return null;
    }
    // If it's from assistant and not blocked, show it
    else if (message.role === 'assistant') {
      shouldShow = true;
    }
    // If it's from user, show it
    else if (message.role === 'user') {
      isPlayerAction = true;
      shouldShow = true;
    }
  }

  // If we decided not to show, return null
  if (!shouldShow) {
    return null;
  }

  // Ultra clean - remove ALL tags multiple times
  for (let i = 0; i < 5; i++) {
    content = content.replace(/<[^>]*>/g, '');
    content = content.replace(/&lt;/g, '').replace(/&gt;/g, '').replace(/&amp;/g, '');
    content = content.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  }
  
  // Remove any remaining JSON blocks aggressively
  // Remove complete JSON objects
  content = content.replace(/\{[\s\S]*?\}/g, '');
  // Remove complete JSON arrays
  content = content.replace(/\[[\s\S]*?\]/g, '');
  // Remove JSON-like patterns (key: value)
  content = content.replace(/"[^"]+"\s*:\s*[^,}\]]+/g, '');
  // Remove stray JSON syntax characters at the end
  content = content.replace(/[,\{\}\[\]]\s*$/g, '');
  content = content.replace(/^\s*[,\{\}\[\]]/g, '');
  
  // Remove lines that are just JSON fragments
  const lines = content.split('\n');
  const cleanLines = lines.filter(line => {
    const trimmedLine = line.trim();
    // Skip lines that look like JSON
    if (trimmedLine.startsWith('"') && trimmedLine.includes(':')) return false;
    if (trimmedLine.match(/^\s*[,\{\}\[\]]/)) return false;
    if (trimmedLine.match(/[,\{\}\[\]]\s*$/)) return false;
    return true;
  });
  content = cleanLines.join('\n').trim();
  
  // If empty after cleaning, don't show
  if (!content.trim()) {
    return null;
  }

  // Player Action - RIGHT SIDE
  if (isPlayerAction || isUser) {
    return (
      <div className="flex justify-end w-full">
        <div className="max-w-[85%] flex items-start gap-2">
          <div className="bg-primary/30 border border-primary/50 rounded-lg px-4 py-3 shadow-lg break-words overflow-wrap-anywhere">
            <p className="text-sm text-foreground whitespace-pre-wrap break-words">{content}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary/40 flex items-center justify-center flex-shrink-0 border border-primary/50">
            <User className="w-4 h-4 text-primary" />
          </div>
        </div>
      </div>
    );
  }

  // NPC Dialogue - LEFT SIDE
  if (isNPCDialogue) {
    return (
      <div className="flex justify-start w-full">
        <div className="max-w-[85%] flex items-start gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center flex-shrink-0 border border-purple-500/50">
            <MessageSquare className="w-4 h-4 text-purple-400" />
          </div>
          <div className="space-y-2">
            <div className="bg-purple-950/60 border border-purple-800/50 rounded-lg px-4 py-3 shadow-lg break-words overflow-wrap-anywhere">
              {npcName && (
                <p className="text-xs text-purple-400 font-semibold mb-1">{npcName}</p>
              )}
              <ReactMarkdown 
                className="prose prose-sm prose-invert max-w-none break-words [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>pre]:whitespace-pre-wrap [&>pre]:break-words [&>code]:whitespace-pre-wrap [&>code]:break-words"
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-gray-200 break-words">{children}</p>,
                  strong: ({ children }) => <strong className="text-purple-300 font-semibold">{children}</strong>,
                  em: ({ children }) => <em className="text-purple-400">{children}</em>,
                  code: ({ children }) => <code className="break-words whitespace-pre-wrap">{children}</code>,
                  pre: ({ children }) => <pre className="break-words whitespace-pre-wrap overflow-x-auto">{children}</pre>,
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
            
            {/* Show stat changes if present */}
            {(statUpdates || worldStateChanges) && character && (
              <div className="flex flex-wrap gap-2 ml-10">
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
            )}
          </div>
        </div>
      </div>
    );
  }

  // Narrator message - LEFT SIDE (DEFAULT for assistant messages)
  return (
    <div className="flex justify-start w-full">
      <div className="max-w-[85%] flex items-start gap-2">
        <div className="w-8 h-8 rounded-full bg-red-900/40 flex items-center justify-center flex-shrink-0 border border-red-700/50">
          <BookOpen className="w-4 h-4 text-red-400" />
        </div>
        <div className="space-y-2">
          <div className="bg-card border border-border rounded-lg px-4 py-3 shadow-lg break-words overflow-wrap-anywhere">
            <ReactMarkdown 
              className="prose prose-sm prose-invert max-w-none break-words [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>pre]:whitespace-pre-wrap [&>pre]:break-words [&>code]:whitespace-pre-wrap [&>code]:break-words"
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-gray-300 break-words">{children}</p>,
                strong: ({ children }) => <strong className="text-primary font-semibold">{children}</strong>,
                em: ({ children }) => <em className="text-red-400">{children}</em>,
                code: ({ children }) => <code className="break-words whitespace-pre-wrap">{children}</code>,
                pre: ({ children }) => <pre className="break-words whitespace-pre-wrap overflow-x-auto">{children}</pre>,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
          
          {/* Show stat changes if present */}
          {(statUpdates || worldStateChanges) && character && (
            <div className="flex flex-wrap gap-2 ml-10">
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
          )}
        </div>
      </div>
    </div>
  );
}