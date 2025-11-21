import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Archive } from "lucide-react";

export default function StoryLengthIndicator({ messageCount, onSummarize, isSummarizing }) {
  if (messageCount < 50) return null;

  const severity = messageCount > 100 ? "critical" : "warning";

  return (
    <Alert className={`${
      severity === "critical" 
        ? "bg-red-950/50 border-red-700" 
        : "bg-yellow-950/50 border-yellow-700"
    } mb-4`}>
      <AlertTriangle className={`w-4 h-4 ${
        severity === "critical" ? "text-red-400" : "text-yellow-400"
      }`} />
      <AlertDescription className="flex items-center justify-between gap-4">
        <span className={severity === "critical" ? "text-red-300" : "text-yellow-300"}>
          {severity === "critical" 
            ? `História muito longa (${messageCount} mensagens). Considere resumir para melhorar performance.`
            : `História está ficando longa (${messageCount} mensagens). Performance pode ser afetada.`
          }
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={onSummarize}
          disabled={isSummarizing}
          className={`${
            severity === "critical"
              ? "border-red-700 text-red-300 hover:bg-red-900"
              : "border-yellow-700 text-yellow-300 hover:bg-yellow-900"
          } flex-shrink-0`}
        >
          <Archive className="w-3 h-3 mr-1" />
          {isSummarizing ? "Resumindo..." : "Resumir História"}
        </Button>
      </AlertDescription>
    </Alert>
  );
}