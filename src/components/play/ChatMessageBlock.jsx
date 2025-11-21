import React from "react";
import StoryMessage from "./StoryMessage";
import DiceRollChallenge from "./DiceRollChallenge";
import DiceRollResult from "./DiceRollResult";

export default function ChatMessageBlock({
  message,
  index,
  conversationMode,
  currentNPC,
  character,
  chronicle,
  changes,
  diceResult,
  imageUrl,
  showDiceChallenge,
  handleDiceRollComplete
}) {
  const messageId = message.id || `msg-${index}`;

  return (
    <div className="space-y-2">
      <StoryMessage
        message={message}
        npcName={conversationMode === "npc" ? currentNPC?.name : null}
        character={character}
        chronicle={chronicle}
        changes={changes}
      />

      {showDiceChallenge && message.parsedContent?.diceRollChallenge && (
        <DiceRollChallenge
          challenge={message.parsedContent.diceRollChallenge}
          character={character}
          onComplete={(successes, result) => handleDiceRollComplete(successes, result, messageId)}
        />
      )}

      {diceResult && diceResult.challenge && (
        <DiceRollResult
          challenge={diceResult.challenge}
          result={diceResult.result}
        />
      )}

      {imageUrl && (
        <div className="flex justify-start w-full">
          <div className="max-w-[85%] ml-10">
            <img 
              src={imageUrl} 
              alt="Scene illustration" 
              className="w-full rounded-lg border border-border shadow-lg"
              loading="lazy"
            />
          </div>
        </div>
      )}
    </div>
  );
}