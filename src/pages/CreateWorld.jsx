
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Map, ArrowRight, Sparkles, RefreshCw, ArrowLeft } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CreateWorld() {
  const navigate = useNavigate();
  const [worldName, setWorldName] = useState("");
  const [worldDescription, setWorldDescription] = useState("");
  const [quickKeywords, setQuickKeywords] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDetails, setGeneratedDetails] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleQuickGenerate = async () => {
    if (!worldName.trim() || !quickKeywords.trim()) {
      return;
    }

    setIsGenerating(true);
    setGeneratedDetails(null);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um mestre experiente em criar mundos ricos e detalhados para Vampiro: A Máscara V5.

**TAREFA:** Criar uma cidade vampírica completa baseado nas seguintes informações:

**Nome da Cidade:** ${worldName}
**Conceito/Keywords:** ${quickKeywords}

Crie uma descrição detalhada e atmosférica que inclua:

## 1. GEOGRAFIA E ATMOSFERA (2-3 parágrafos)
Descreva a cidade fisicamente: arquitetura, clima, bairros principais, como a cidade "se sente" à noite. Use linguagem evocativa e gótica.

## 2. ESTRUTURA DE PODER DA CAMARILLA (2 parágrafos)
- **Príncipe:** Nome, clã, personalidade, estilo de governo
- **Primogênitos:** 3-4 membros importantes do Primogênito (nome, clã, papel)
- **Xerife:** Nome, clã, reputação
- Descreva a dinâmica de poder e tensões políticas

## 3. FACÇÕES E AMEAÇAS (1-2 parágrafos)
- **Anarquistas:** Presença na cidade, líderes, territórios
- **Sabbat ou outras ameaças:** Perigos externos ou internos
- **Caçadores:** Presença de segunda inquisição ou outros caçadores
- Tensões entre facções

## 4. LOCAIS IMPORTANTES (lista de 5-7 locais)
Para cada local, forneça:
- **Nome do local**
- **Descrição:** 1-2 frases sobre o que é e por que é importante
- **Tipo:** (Elísio, Território de Caça, Refúgio, Zona de Perigo, etc)

Exemplo de formato:
- **O Salão Vermelho** - Elísio oficial da cidade, um teatro do século XIX restaurado onde vampiros se encontram sob a proteção da tradição. Controlado pelo Príncipe.

## 5. SEGREDOS E GANCHOS (3-5 itens)
Mistérios, rumores, conspirações e ganchos de história que o Narrador pode usar. Seja intrigante!

Seja detalhado, atmosférico e use o tom gótico-punk apropriado para V5. A descrição deve ter pelo menos 1000 palavras.`,
        add_context_from_internet: false
      });

      setGeneratedDetails(result);
    } catch (error) {
      console.error("Error generating world:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualGenerate = async () => {
    if (!worldName.trim() || !worldDescription.trim()) {
      return;
    }

    setIsGenerating(true);
    setGeneratedDetails(null);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um construtor de mundos experiente para Vampiro: A Máscara V5.

O jogador forneceu a seguinte descrição para sua cidade/mundo:

**Nome:** ${worldName}
**Descrição:** ${worldDescription}

Sua tarefa é expandir essa ideia em uma descrição rica e detalhada do mundo que inclua:

## 1. GEOGRAFIA E ATMOSFERA
Descreva a cidade, seus bairros, clima político e social. Use a descrição do jogador como base e expanda com detalhes evocativos.

## 2. FACÇÕES IMPORTANTES
- **Príncipe da cidade:** Nome, clã, personalidade, estilo de governo
- **Primogênitos:** 3-5 membros do conselho (nome, clã, motivações)
- **Anarquistas:** Líderes, territórios, objetivos
- **Outras facções:** Camarilla, independentes, ameaças

## 3. LOCAIS NOTÁVEIS
Liste 6-8 locais importantes:
- Elísios (locais de encontro protegidos)
- Territórios de caça
- Áreas perigosas
- Refúgios importantes
Para cada local: nome, descrição (2-3 frases), importância

## 4. NPCs CHAVE
5-7 NPCs importantes com:
- Nome
- Clã
- Papel/posição
- Personalidade (1-2 frases)
- Motivação/objetivo

## 5. TENSÕES ATUAIS
Conflitos, ameaças, mistérios que podem servir de ganchos de história. Inclua:
- Conflitos políticos
- Ameaças externas (Sabbat, Segunda Inquisição)
- Mistérios e conspirações
- Oportunidades para histórias

## 6. TOM E ESTILO
Estabeleça o tom gótico-punk apropriado para a cidade baseado na descrição do jogador.

Seja detalhado, evocativo e crie um cenário viável para uma campanha. Use linguagem rica e atmosférica. A descrição deve ter pelo menos 1000 palavras e respeitar PROFUNDAMENTE a visão original do jogador.`,
        add_context_from_internet: false
      });

      setGeneratedDetails(result);
    } catch (error) {
      console.error("Error generating world:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveWorld = async () => {
    if (!worldName.trim() || !generatedDetails) {
      return;
    }

    setIsSaving(true);

    try {
      const user = await base44.auth.me();

      const world = await base44.entities.World.create({
        name: worldName,
        player_description: worldDescription || quickKeywords,
        generated_details: generatedDetails,
        user_id: user.email
      });

      navigate(createPageUrl("CreateCharacter") + `?worldId=${world.id}`);
    } catch (error) {
      console.error("Error saving world:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Home"))}
          className="mb-4 text-gray-400 hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Map className="w-16 h-16 text-primary drop-shadow-[0_0_10px_rgba(220,38,38,0.6)]" />
          </div>
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground mb-3">
            Construa Seu Mundo
          </h1>
          <p className="text-gray-400 text-lg">
            Descreva a cidade onde sua crônica se desenrolará
          </p>
        </div>

        <Card className="bg-card border-border shadow-[0_0_30px_rgba(220,38,38,0.2)]">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-foreground">
              {generatedDetails ? "Mundo Gerado" : "Criação do Mundo"}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {generatedDetails 
                ? "Revise os detalhes gerados pela IA e salve para continuar"
                : "Escolha entre geração rápida por keywords ou descrição detalhada"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!generatedDetails ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="worldName" className="text-base text-foreground">
                    Nome da Cidade/Mundo *
                  </Label>
                  <Input
                    id="worldName"
                    placeholder="Ex: São Paulo, Nova York, Londres, Praga..."
                    value={worldName}
                    onChange={(e) => setWorldName(e.target.value)}
                    disabled={isGenerating}
                    className="text-base bg-secondary border-border"
                  />
                </div>

                <Tabs defaultValue="quick" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-secondary">
                    <TabsTrigger value="quick">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Geração Rápida
                    </TabsTrigger>
                    <TabsTrigger value="detailed">
                      <Map className="w-4 h-4 mr-2" />
                      Descrição Detalhada
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="quick" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="quickKeywords" className="text-base text-foreground">
                        Keywords / Conceito *
                      </Label>
                      <Input
                        id="quickKeywords"
                        placeholder="Ex: megacidade cyberpunk, porto histórico, cidade universitária..."
                        value={quickKeywords}
                        onChange={(e) => setQuickKeywords(e.target.value)}
                        disabled={isGenerating}
                        className="text-base bg-secondary border-border"
                      />
                      <p className="text-sm text-gray-500">
                        Forneça 3-5 palavras-chave ou uma frase curta descrevendo o tipo de cidade que deseja
                      </p>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <p className="text-sm text-gray-300 mb-2">
                        <strong className="text-primary">Geração Rápida:</strong> A IA criará automaticamente:
                      </p>
                      <ul className="text-sm text-gray-400 space-y-1 ml-4">
                        <li>• Geografia e atmosfera detalhadas</li>
                        <li>• Estrutura de poder completa (Príncipe, Primogênito, Xerife)</li>
                        <li>• Facções e tensões políticas</li>
                        <li>• 5-7 locais importantes</li>
                        <li>• NPCs chave com personalidades</li>
                        <li>• Ganchos de história e mistérios</li>
                      </ul>
                    </div>

                    <Button
                      onClick={handleQuickGenerate}
                      disabled={isGenerating || !worldName.trim() || !quickKeywords.trim()}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-lg py-6 h-auto shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Gerando Mundo...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Gerar Mundo Automaticamente
                        </>
                      )}
                    </Button>
                  </TabsContent>

                  <TabsContent value="detailed" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="worldDescription" className="text-base text-foreground">
                        Descrição Detalhada *
                      </Label>
                      <Textarea
                        id="worldDescription"
                        placeholder="Descreva sua cidade em detalhes: clima, facções, locais importantes, NPCs notáveis, tensões políticas, estilo da crônica... Seja criativo! A IA usará sua descrição como base para criar um mundo rico e detalhado."
                        value={worldDescription}
                        onChange={(e) => setWorldDescription(e.target.value)}
                        disabled={isGenerating}
                        rows={12}
                        className="text-base resize-none bg-secondary border-border"
                      />
                      <p className="text-sm text-gray-500">
                        Forneça o máximo de detalhes possível sobre sua visão para a cidade
                      </p>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <p className="text-sm text-gray-300 mb-2">
                        <strong className="text-primary">Descrição Detalhada:</strong> A IA expandirá sua visão mantendo fidelidade:
                      </p>
                      <ul className="text-sm text-gray-400 space-y-1 ml-4">
                        <li>• Respeita totalmente sua visão original</li>
                        <li>• Expande com detalhes atmosféricos</li>
                        <li>• Adiciona NPCs e locais consistentes</li>
                        <li>• Cria tensões e ganchos de história</li>
                        <li>• Estrutura tudo para facilitar a narrativa</li>
                      </ul>
                    </div>

                    <Button
                      onClick={handleManualGenerate}
                      disabled={isGenerating || !worldName.trim() || !worldDescription.trim()}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-lg py-6 h-auto shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Gerando Mundo...
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-5 h-5 mr-2" />
                          Expandir com IA
                        </>
                      )}
                    </Button>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-headline font-bold text-foreground">{worldName}</h3>
                      <Badge variant="outline" className="mt-2 text-green-400 border-green-500">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Gerado pela IA
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (quickKeywords) {
                          handleQuickGenerate();
                        } else {
                          handleManualGenerate();
                        }
                      }}
                      disabled={isGenerating}
                      className="border-border"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerar
                    </Button>
                  </div>

                  <Card className="bg-secondary border-border max-h-96 overflow-y-auto">
                    <CardContent className="pt-6">
                      <div className="prose prose-sm prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap font-body text-sm text-gray-300 leading-relaxed">
                          {generatedDetails}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setGeneratedDetails(null)}
                      className="flex-1 border-border"
                    >
                      Voltar
                    </Button>
                    <Button
                      onClick={handleSaveWorld}
                      disabled={isSaving}
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-lg py-6 h-auto shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-5 h-5 mr-2" />
                          Salvar e Criar Personagem
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-red-400 italic font-headline">
            "Cada cidade tem seus segredos. Cada noite, suas histórias."
          </p>
        </div>
      </div>
    </div>
  );
}
