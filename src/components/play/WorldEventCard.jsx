import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Flame, Skull, Eye, Sparkles, Swords } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const EVENT_CONFIG = {
  masquerade_breach: {
    icon: Eye,
    color: "text-red-500",
    bgColor: "bg-red-950/50",
    borderColor: "border-red-800",
    label: "Quebra da Máscara"
  },
  inquisition_raid: {
    icon: Flame,
    color: "text-orange-500",
    bgColor: "bg-orange-950/50",
    borderColor: "border-orange-800",
    label: "Operação da Inquisição"
  },
  faction_war: {
    icon: Swords,
    color: "text-purple-500",
    bgColor: "bg-purple-950/50",
    borderColor: "border-purple-800",
    label: "Guerra entre Facções"
  },
  blood_hunt: {
    icon: Skull,
    color: "text-red-600",
    bgColor: "bg-red-950/60",
    borderColor: "border-red-900",
    label: "Caçada de Sangue"
  },
  elysium_gathering: {
    icon: Sparkles,
    color: "text-blue-400",
    bgColor: "bg-blue-950/50",
    borderColor: "border-blue-800",
    label: "Reunião de Elísio"
  },
  supernatural_phenomenon: {
    icon: Sparkles,
    color: "text-cyan-400",
    bgColor: "bg-cyan-950/50",
    borderColor: "border-cyan-800",
    label: "Fenômeno Sobrenatural"
  },
  power_struggle: {
    icon: Swords,
    color: "text-yellow-500",
    bgColor: "bg-yellow-950/50",
    borderColor: "border-yellow-800",
    label: "Disputa de Poder"
  },
  betrayal: {
    icon: AlertTriangle,
    color: "text-red-500",
    bgColor: "bg-red-950/50",
    borderColor: "border-red-800",
    label: "Traição"
  },
  discovery: {
    icon: Eye,
    color: "text-green-500",
    bgColor: "bg-green-950/50",
    borderColor: "border-green-800",
    label: "Descoberta"
  },
  threat: {
    icon: AlertTriangle,
    color: "text-orange-600",
    bgColor: "bg-orange-950/50",
    borderColor: "border-orange-900",
    label: "Ameaça"
  }
};

const SEVERITY_CONFIG = {
  minor: { label: "Menor", color: "bg-gray-700 text-gray-300" },
  moderate: { label: "Moderado", color: "bg-yellow-700 text-yellow-200" },
  major: { label: "Grave", color: "bg-orange-700 text-orange-200" },
  critical: { label: "CRÍTICO", color: "bg-red-700 text-red-100" }
};

export default function WorldEventCard({ event, onChoice, isProcessing }) {
  const config = EVENT_CONFIG[event.event_type] || EVENT_CONFIG.threat;
  const severityConfig = SEVERITY_CONFIG[event.severity] || SEVERITY_CONFIG.moderate;
  const Icon = config.icon;

  return (
    <Alert className={`${config.bgColor} border-2 ${config.borderColor} shadow-[0_0_20px_rgba(220,38,38,0.4)] overflow-hidden`}>
      <AlertDescription>
        <Card className="bg-transparent border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-12 h-12 rounded-lg ${config.bgColor} border ${config.borderColor} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge className={severityConfig.color}>
                      {severityConfig.label}
                    </Badge>
                    <Badge variant="outline" className="text-gray-400 border-gray-600">
                      {config.label}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-headline text-foreground break-words">
                    {event.title}
                  </CardTitle>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription className="text-base text-gray-300 leading-relaxed break-words whitespace-pre-wrap">
              {event.description}
            </CardDescription>

            {event.choices_presented && event.choices_presented.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-400 uppercase">Como você reage?</p>
                <div className="grid grid-cols-1 gap-2">
                  {event.choices_presented.map((choice, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => onChoice(event.id, choice)}
                      disabled={isProcessing}
                      className={`w-full justify-start text-left h-auto py-3 px-4 ${config.borderColor} hover:bg-primary/20 hover:border-primary hover:text-primary transition-all whitespace-normal break-words`}
                    >
                      <span className="text-sm break-words">{choice}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </AlertDescription>
    </Alert>
  );
}