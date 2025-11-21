import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Settings as SettingsIcon, ArrowLeft, Check } from "lucide-react";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";


const NARRATIVE_STYLES = [
  {
    value: "concise",
    label: "Resumido e Natural",
    description: "Narração direta e objetiva. Vai direto ao ponto sem muitos floreios.",
    example: "Você encontra um mendigo dormindo. A fome aperta. O que fazer?"
  },
  {
    value: "balanced",
    label: "Equilibrado",
    description: "Um meio termo entre descrição e objetividade. Atmosférico mas conciso.",
    example: "Você encontra um morador de rua dormindo em uma caixa de papelão. A Fome aperta. O cheiro de sangue é irresistível."
  },
  {
    value: "theatrical",
    label: "Teatral e Imersivo",
    description: "Narração rica, detalhada e atmosférica. Mergulha fundo na história.",
    example: "Nas sombras de uma viela esquecida, você encontra um morador de rua envolto em trapos imundos, seu sono profundo perturbado apenas por tremores ocasionais. A Fome dentro de você desperta como uma besta faminta, seus sentidos vampíricos captando cada batimento cardíaco, cada gota de sangue quente pulsando sob a pele frágil..."
  }
];

export default function Settings() {
  const navigate = useNavigate();
  const location = useLocation();
  const [chronicleId, setChronicleId] = useState(null);
  const [chronicle, setChronicle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [narrativeStyle, setNarrativeStyle] = useState("concise");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const chronId = params.get('chronicleId');
    if (chronId) {
      setChronicleId(chronId);
      loadChronicle(chronId);
    } else {
      setIsLoading(false);
    }
  }, [location]);

  const loadChronicle = async (chronId) => {
    try {
      const chronicles = await base44.entities.Chronicle.list();
      const chron = chronicles.find(c => c.id === chronId);
      if (chron) {
        setChronicle(chron);
        setNarrativeStyle(chron.narrative_style || "concise");
      }
    } catch (error) {
      console.error("Error loading chronicle:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!chronicleId) return;

    setIsSaving(true);
    setSaved(false);

    try {
      await base44.entities.Chronicle.update(chronicleId, {
        narrative_style: narrativeStyle
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (chronicle) {
      navigate(createPageUrl("Play") + `?characterId=${chronicle.character_id}`);
    } else {
      navigate(-1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-none p-4 md:p-8 pb-2 bg-background z-10">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4 text-gray-400 hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="w-8 h-8 text-primary drop-shadow-[0_0_10px_rgba(220,38,38,0.6)]" />
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
              Configurações da Crônica
            </h1>
          </div>
          <p className="text-gray-400">
            Personalize como o narrador conta sua história
          </p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {/* Narrative Style Card */}
            <Card className="bg-card border-border shadow-[0_0_30px_rgba(220,38,38,0.2)] mb-8">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-foreground">
                Estilo de Narração
              </CardTitle>
              <CardDescription className="text-gray-400">
                Escolha como você prefere que a história seja contada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup value={narrativeStyle} onValueChange={setNarrativeStyle}>
                {NARRATIVE_STYLES.map((style) => (
                  <div
                    key={style.value}
                    className={`relative flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-all ${
                      narrativeStyle === style.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setNarrativeStyle(style.value)}
                  >
                    <RadioGroupItem value={style.value} id={style.value} className="mt-1" />
                    <div className="flex-1">
                      <Label
                        htmlFor={style.value}
                        className="text-base font-semibold text-foreground cursor-pointer"
                      >
                        {style.label}
                      </Label>
                      <p className="text-sm text-gray-400 mt-1">{style.description}</p>
                      <div className="mt-3 p-3 bg-secondary rounded border border-border">
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                          Exemplo:
                        </p>
                        <p className="text-sm text-gray-300 italic">{style.example}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !chronicleId}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-lg py-6 h-auto shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : saved ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Salvo!
                    </>
                  ) : (
                    <>
                      <SettingsIcon className="w-5 h-5 mr-2" />
                      Salvar Configurações
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-gray-400">
                  <strong className="text-primary">💡 Dica:</strong> Você pode mudar o estilo de narração a qualquer momento durante a crônica. As mudanças serão aplicadas nas próximas interações com o narrador.
                </p>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </div>
  );
}