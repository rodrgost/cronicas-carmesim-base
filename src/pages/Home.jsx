import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skull, BookOpen, Plus } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=2000')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Skull Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Skull className="w-24 h-24 text-primary drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]" />
              <div className="absolute inset-0 blur-2xl bg-primary/40 animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="font-headline text-6xl md:text-8xl font-bold text-foreground tracking-tight drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]">
              Crônicas<br />
              <span className="text-primary">Carmesim</span>
            </h1>
            <p className="font-headline text-xl md:text-2xl text-red-300 italic">
              Um RPG de Vampiro: A Máscara
            </p>
          </div>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Entre nas sombras de um mundo onde vampiros governam a noite.
            Sua história de sangue, poder e humanidade perdida está prestes a começar.
          </p>

          {/* CTA Buttons */}
          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate(createPageUrl("CreateWorld"))}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-xl px-12 py-6 h-auto rounded-lg shadow-[0_0_30px_rgba(220,38,38,0.6)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(220,38,38,0.8)]"
            >
              <Plus className="w-6 h-6 mr-3" />
              Nova Crônica
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate(createPageUrl("WorldsList"))}
              className="border-primary text-primary hover:bg-primary/10 font-headline text-xl px-12 py-6 h-auto rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all duration-300 hover:scale-105"
            >
              <BookOpen className="w-6 h-6 mr-3" />
              Continuar Crônica
            </Button>
          </div>

          {/* Atmospheric Text */}
          <div className="pt-12">
            <p className="font-headline text-sm text-red-400 italic">
              "A Besta sussurra em seus ouvidos. A Humanidade escorrega entre seus dedos."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}