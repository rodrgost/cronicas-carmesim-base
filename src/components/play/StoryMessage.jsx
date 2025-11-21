import React, { useState } from "react";
import { BookOpen, MessageSquare, User, Volume2, VolumeX } from "lucide-react";
import ReactMarkdown from "react-markdown";

const HighlightDialogue = ({ children }) => {
  return React.Children.map(children, (child) => {
    if (typeof child === 'string') {
      // Match text between quotes (standard and smart quotes)
      const parts = child.split(/(".*?"|“.*?”)/g);
      return parts.map((part, i) => {
        // Check if the part is a quoted string
        if (part.startsWith('"') || part.startsWith('“')) {
          return <span key={i} className="text-purple-300 font-medium">{part}</span>;
        }
        return part;
      });
    }
    return child;
  });
};
import { Button } from "@/components/ui/button";
import ChangesSummary from "./ChangesSummary";

export default function StoryMessage({ message, npcName: propNpcName, character, chronicle, changes }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!message.parsedContent) {
    return null;
  }

  const isUser = message.role === "user";
  const parsed = message.parsedContent;
  
  let content = "";
  let messageType = "narrator";
  let npcName = propNpcName;
  
  if (isUser) {
    content = parsed.playerAction || message.content;
    messageType = "player";
  }
  else if (message.role === "assistant") {
    // Check if message has embedded NPC info (better for history)
    const embeddedNPC = parsed.activeNPC || parsed.npcName;
    
    if (embeddedNPC) {
        messageType = "npc";
        npcName = embeddedNPC;
        content = parsed.npcDialogue || parsed.storyEvent;
    } 
    // Fallback to prop-based context
    else if (npcName) {
      messageType = "npc";
      content = parsed.npcDialogue || parsed.storyEvent;
    } else if (parsed.storyEvent) {
      content = parsed.storyEvent;
      messageType = "narrator";
    } else {
      return null;
    }
  } else {
    return null;
  }

  if (!content || content.trim() === "") {
    return null;
  }

  const speakText = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!('speechSynthesis' in window)) {
      alert("Seu navegador não suporta síntese de voz.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    utterance.pitch = messageType === "npc" ? 1.1 : 0.9;
    
    const voices = window.speechSynthesis.getVoices();
    const portugueseVoice = voices.find(voice => voice.lang.includes('pt'));
    if (portugueseVoice) {
      utterance.voice = portugueseVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  if (messageType === "player") {
    return (
      <div className="flex justify-end w-full">
        <div className="max-w-[85%] flex items-start gap-2">
          <div className="bg-primary/30 border border-primary/50 rounded-lg px-3 py-2 shadow-lg">
            <p className="text-sm text-foreground whitespace-pre-wrap">{content}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary/40 flex items-center justify-center flex-shrink-0 border border-primary/50">
            <User className="w-4 h-4 text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (messageType === "npc") {
    return (
      <div className="flex justify-start w-full">
        <div className="max-w-[85%] flex items-start gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center flex-shrink-0 border border-purple-500/50">
            <MessageSquare className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex-1">
            <div className="bg-purple-950/60 border border-purple-800/50 rounded-lg px-4 py-3 shadow-lg">
              {npcName && (
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-purple-400 font-semibold">{npcName}</p>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-purple-400 hover:text-purple-300"
                    onClick={speakText}
                  >
                    {isSpeaking ? (
                      <VolumeX className="w-3 h-3" />
                    ) : (
                      <Volume2 className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              )}
              <ReactMarkdown
                className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-purple-100 text-sm">{children}</p>,
                  strong: ({ children }) => <strong className="text-purple-200 font-semibold">{children}</strong>,
                  em: ({ children }) => <em className="text-purple-400">{children}</em>,
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
            {changes && (
              <ChangesSummary changes={changes} />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start w-full">
      <div className="w-full flex items-start">
        <div className="w-full">
          <div className="bg-card border border-border rounded-lg px-4 py-3 shadow-lg">
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="text-xs text-gray-500 font-semibold">NARRADOR</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-gray-400 hover:text-primary -mt-1"
                onClick={speakText}
                title="Ouvir narração"
              >
                {isSpeaking ? (
                  <VolumeX className="w-3 h-3" />
                ) : (
                  <Volume2 className="w-3 h-3" />
                )}
              </Button>
            </div>
            <ReactMarkdown
              className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              components={{
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0 leading-relaxed text-gray-300 text-sm">
                    <HighlightDialogue>{children}</HighlightDialogue>
                  </p>
                ),
                strong: ({ children }) => <strong className="text-primary font-semibold">{children}</strong>,
                em: ({ children }) => <em className="text-red-400">{children}</em>,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
          {changes && (
            <ChangesSummary changes={changes} />
          )}
        </div>
      </div>
    </div>
  );
}