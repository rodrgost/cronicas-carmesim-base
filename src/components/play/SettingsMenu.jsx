import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Settings, RefreshCcw, ChevronRight, FileText } from "lucide-react";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import { useTranslation } from "@/components/i18n/LanguageContext";
import { processMessages, extractChanges } from "@/components/play/MessageProcessor";

export default function SettingsMenu({ character, world, chronicle }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleNavigateToSettings = () => {
    navigate(createPageUrl("Settings") + `?chronicleId=${chronicle.id}`);
  };

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    toast.info(t('settings.toastGenerating'));
    
    try {
      const conversation = await base44.agents.getConversation(chronicle.conversation_id);
      
      if (!conversation || !conversation.messages || conversation.messages.length === 0) {
        toast.error(t('settings.toastNoMessages'));
        setIsGeneratingPDF(false);
        return;
      }

      // Prepare content for PDF
      let pdfContent = `CRÔNICA: ${character.name}\nMundo: ${world.name}\nDia: ${chronicle.current_day}\n\n`;
      pdfContent += "═".repeat(60) + "\n\n";

      // Process messages to handle JSON content consistently
      const processedMessages = processMessages(conversation.messages);

      for (const msg of processedMessages) {
        if (msg.role === 'user') {
          try {
            const parsed = msg.parsedContent || JSON.parse(msg.content);
            
            if (parsed.playerAction) {
              pdfContent += `🎭 JOGADOR: ${parsed.playerAction}\n\n`;
            } else if (parsed.diceRollResult !== undefined) {
              pdfContent += `🎲 RESULTADO DOS DADOS: ${parsed.diceRollResult} sucessos\n\n`;
            } else if (parsed.worldEventResponse) {
              pdfContent += `⚡ RESPOSTA AO EVENTO: ${parsed.worldEventResponse}\n\n`;
            } else if (parsed.disciplineUsage) {
              pdfContent += `🩸 DISCIPLINA: ${parsed.disciplineUsage.disciplineName} - ${parsed.disciplineUsage.powerName}\n\n`;
            } else {
              // Fallback for other JSON or plain text
              const textContent = typeof parsed === 'string' ? parsed : JSON.stringify(parsed);
              if (textContent !== "{}") {
                pdfContent += `🎭 JOGADOR: ${textContent}\n\n`;
              }
            }
          } catch {
            pdfContent += `🎭 JOGADOR: ${msg.content}\n\n`;
          }
        } else if (msg.role === 'assistant') {
          try {
            const parsed = msg.parsedContent || JSON.parse(msg.content);
            
            // Narrative content
            if (parsed.storyEvent) {
              pdfContent += `📖 NARRADOR: ${parsed.storyEvent}\n\n`;
            } else if (parsed.npcDialogue) {
              pdfContent += `💬 NPC: ${parsed.npcDialogue}\n\n`;
            } else if (msg.content && !parsed.storyEvent && !parsed.npcDialogue) {
              // Sometimes the content is mixed or structure is different
              pdfContent += `📖 NARRADOR: ${msg.content.replace(/```json[\s\S]*?```/g, '').trim()}\n\n`;
            }

            // State changes (Health, Hunger, Inventory, etc)
            const changes = extractChanges(msg);
            if (changes && changes.length > 0) {
              pdfContent += `📊 MUDANÇAS DE ESTADO:\n`;
              changes.forEach(change => {
                pdfContent += `  • ${change.description}\n`;
              });
              pdfContent += `\n`;
            }

            // Dice Challenges
            if (parsed.diceRollChallenge) {
              const c = parsed.diceRollChallenge;
              pdfContent += `🎲 DESAFIO: ${c.skill} + ${c.attribute} (Dif: ${c.difficulty})\n\n`;
            }

            // World Events
            if (parsed.worldEvent) {
               pdfContent += `⚡ EVENTO: ${parsed.worldEvent.title}\n${parsed.worldEvent.description}\n\n`;
            }

          } catch {
            pdfContent += `📖 NARRADOR: ${msg.content}\n\n`;
          }
        }
        pdfContent += "─".repeat(60) + "\n\n";
      }

      // Create blob and download
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cronica-${character.name}-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(t('settings.toastSuccess'));
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error(t('settings.toastError'));
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleRestartChronicle = async () => {
    setIsRestarting(true);
    try {
      // Delete ALL NPCs associated with this world (including those from previous chronicles)
      const allNPCs = await base44.entities.NPC.list();
      const worldNPCs = allNPCs.filter(npc => 
        npc.world_id === world.id || npc.chronicle_id === chronicle.id
      );
      for (const npc of worldNPCs) {
        await base44.entities.NPC.delete(npc.id);
      }

      // Delete locations associated with this chronicle
      const allLocations = await base44.entities.Location.list();
      const chronicleLocations = allLocations.filter(loc => loc.chronicle_id === chronicle.id);
      for (const location of chronicleLocations) {
        await base44.entities.Location.delete(location.id);
      }

      // Delete inventory items for this character
      const allItems = await base44.entities.Item.list();
      const characterItems = allItems.filter(item => item.character_id === character.id);
      for (const item of characterItems) {
        await base44.entities.Item.delete(item.id);
      }

      // Delete the chronicle
      await base44.entities.Chronicle.delete(chronicle.id);

      const conversation = await base44.agents.createConversation({
        agent_name: "story_narrator",
        metadata: {
          character_id: character.id,
          world_id: world.id,
          name: `Crônica de ${character.name}`,
          description: `Crônica em ${world.name}`
        }
      });

      const user = await base44.auth.me();
      await base44.entities.Chronicle.create({
        character_id: character.id,
        world_id: world.id,
        conversation_id: conversation.id,
        current_day: 1,
        last_rest_day: 0,
        active_npcs: [],
        conversation_mode: "narrator",
        story_log: [],
        world_state: {
          inquisition_activity: 3,
          masquerade_threat: 2,
          political_tension: 5,
          supernatural_activity: 4
        },
        narrative_style: "balanced",
        user_id: user.email
      });

      toast.success(t('settings.toastRestartSuccess'));
      window.location.reload();
    } catch (error) {
      console.error("Error restarting chronicle:", error);
      toast.error(t('settings.toastRestartError'));
      setIsRestarting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-foreground h-8 w-8 touch-manipulation">
            <Settings className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-card border-border">
          <DropdownMenuLabel className="text-foreground">{t('settings.options')}</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border" />
          
          <DropdownMenuItem
            onClick={handleNavigateToSettings}
            className="text-foreground hover:bg-primary/20 cursor-pointer"
          >
            <Settings className="w-4 h-4 mr-2" />
            {t('settings.narrationSettings')}
            <ChevronRight className="w-4 h-4 ml-auto" />
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleGeneratePDF}
            disabled={isGeneratingPDF}
            className="text-foreground hover:bg-primary/20 cursor-pointer"
          >
            <FileText className="w-4 h-4 mr-2" />
            {isGeneratingPDF ? t('settings.generating') : t('settings.export')}
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-border" />
          
          <DropdownMenuItem
            onClick={() => setShowRestartDialog(true)}
            className="text-red-400 hover:bg-red-950/50 hover:text-red-300 cursor-pointer"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            {t('settings.restart')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showRestartDialog} onOpenChange={setShowRestartDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">{t('settings.restartTitle')}</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              <span dangerouslySetInnerHTML={{ __html: t('settings.restartDesc') }} />
              
              <div className="mt-3 p-3 bg-red-950/30 border border-red-800/50 rounded">
                <p className="text-sm text-red-300">
                  <strong>{t('settings.restartWarning')}</strong>
                </p>
                <ul className="text-sm text-red-300 mt-2 ml-4 list-disc">
                  <li>{t('settings.restartList1')}</li>
                  <li>{t('settings.restartList2')}</li>
                  <li>{t('settings.restartList3')}</li>
                  <li>{t('settings.restartList4')}</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary text-foreground border-border hover:bg-secondary/80">
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestartChronicle}
              disabled={isRestarting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isRestarting ? t('settings.restarting') : t('settings.confirmRestart')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}