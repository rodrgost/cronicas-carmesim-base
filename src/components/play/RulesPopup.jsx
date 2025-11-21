import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, Droplet, Heart, Brain, Skull, Flame } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function RulesPopup({ trigger }) {
  return (
    <Dialog>
      {trigger || (
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-primary"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[80vh] bg-card border-border z-[250]">
        <DialogHeader>
          <DialogTitle className="text-foreground font-headline text-xl">
            Regras do Jogo - Vampire: The Masquerade V5
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Referência rápida das mecânicas principais
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            {/* Fome */}
            <div className="space-y-2">
              <h3 className="font-semibold text-primary flex items-center gap-2">
                <Droplet className="w-4 h-4" />
                Fome (Hunger) [0-5]
              </h3>
              <ul className="space-y-1 text-gray-300 ml-6 list-disc">
                <li>Aumenta +1 ao acordar após descanso</li>
                <li>Aumenta +1 ao usar disciplinas vampíricas (Rouse Check)</li>
                <li>Diminui ao se alimentar de humanos vivos (-2 ou -3)</li>
                <li>Diminui menos com animais ou bolsas de sangue (-1)</li>
                <li><strong className="text-red-500">Fome = 5 → FRENESI AUTOMÁTICO</strong> (perda total de controle)</li>
              </ul>
            </div>

            {/* Vitalidade */}
            <div className="space-y-2">
              <h3 className="font-semibold text-red-500 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Vitalidade (Health)
              </h3>
              <ul className="space-y-1 text-gray-300 ml-6 list-disc">
                <li>Máximo = 5 + Vigor (atributo Stamina)</li>
                <li>Reduz ao sofrer dano (combate, sol, fogo, etc)</li>
                <li>Recupera lentamente ao descansar (+3 por dia de descanso)</li>
                <li><strong className="text-red-500">Vitalidade = 0 → TORPOR</strong> (inconsciência vampírica)</li>
              </ul>
            </div>

            {/* Força de Vontade */}
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-500 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Força de Vontade (Willpower)
              </h3>
              <ul className="space-y-1 text-gray-300 ml-6 list-disc">
                <li>Máximo = Autocontrole + Determinação</li>
                <li>Gasta ao resistir frenesi ou usar certas habilidades</li>
                <li>Recupera totalmente ao descansar</li>
                <li><strong className="text-blue-500">Willpower = 0 → EXAUSTÃO MENTAL</strong> (vulnerável a dominação)</li>
              </ul>
            </div>

            {/* Humanidade */}
            <div className="space-y-2">
              <h3 className="font-semibold text-purple-500 flex items-center gap-2">
                <Skull className="w-4 h-4" />
                Humanidade (Humanity) [0-10]
              </h3>
              <ul className="space-y-1 text-gray-300 ml-6 list-disc">
                <li>Diminui ao cometer atos imorais (matar, torturar, etc)</li>
                <li>Quanto menor, mais próximo da Besta você está</li>
                <li><strong className="text-purple-500">Humanidade ≤ 3 → DOMÍNIO DA BESTA</strong> (quase um monstro)</li>
              </ul>
            </div>

            {/* Frenesi */}
            <div className="space-y-2">
              <h3 className="font-semibold text-red-600 flex items-center gap-2">
                <Flame className="w-4 h-4" />
                Frenesi (Frenzy)
              </h3>
              <ul className="space-y-1 text-gray-300 ml-6 list-disc">
                <li>Ocorre automaticamente quando Fome = 5</li>
                <li>Durante frenesi: sem controle, ataca o mais próximo</li>
                <li>Após frenesi: Fome reduz a 0, mas Humanidade pode diminuir</li>
              </ul>
            </div>

            {/* Descanso */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-300">Descanso</h3>
              <ul className="space-y-1 text-gray-300 ml-6 list-disc">
                <li>Vampiros devem descansar durante o dia</li>
                <li>Ao descansar: +3 Vitalidade, Força de Vontade completa, +1 Fome</li>
                <li>Dias sem descanso: penalidades crescentes de Vitalidade</li>
              </ul>
            </div>

            {/* Comandos de Debug */}
            <div className="space-y-2 border-t border-border pt-4 mt-4">
              <h3 className="font-semibold text-yellow-500">Comandos Especiais</h3>
              <ul className="space-y-1 text-gray-300 ml-6 list-disc">
                <li><code className="bg-secondary px-2 py-0.5 rounded text-yellow-400">/narrador</code> - Conversar com o narrador fora do jogo (tirar dúvidas, discutir regras)</li>
                <li><code className="bg-secondary px-2 py-0.5 rounded text-yellow-400">/debug</code> - Exibir log das últimas mensagens para debug</li>
                <li><code className="bg-secondary px-2 py-0.5 rounded text-yellow-400">/admin criar npc</code> - Criar um novo NPC aleatório</li>
                <li><code className="bg-secondary px-2 py-0.5 rounded text-yellow-400">/admin fome [0-5]</code> - Alterar nível de fome</li>
                <li><code className="bg-secondary px-2 py-0.5 rounded text-yellow-400">/admin vida [0-max]</code> - Alterar vitalidade</li>
                <li><code className="bg-secondary px-2 py-0.5 rounded text-yellow-400">/admin humanidade [0-10]</code> - Alterar humanidade</li>
                <li><code className="bg-secondary px-2 py-0.5 rounded text-yellow-400">/admin vontade [0-max]</code> - Alterar força de vontade</li>
              </ul>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}