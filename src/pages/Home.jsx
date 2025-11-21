import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skull, BookOpen, Plus, Globe } from "lucide-react";
import { createPageUrl } from "@/utils";
import { useTranslation } from "@/components/i18n/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Home() {
  const navigate = useNavigate();
  const { t, language, changeLanguage } = useTranslation();

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

      {/* Language Selector */}
      <div className="absolute top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => changeLanguage(language === 'pt' ? 'en' : 'pt')}
          className="text-white/70 hover:text-white hover:bg-white/10 text-xs px-2 py-1 h-auto"
        >
          {language === 'pt' ? '🇧🇷 PT' : '🇺🇸 EN'}
        </Button>
      </div>

      {/* Content */}
      <div className="relative z-10 h-screen flex flex-col items-center justify-center px-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8 py-8">
          {/* Skull Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Skull className="w-24 h-24 text-primary drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]" />
              <div className="absolute inset-0 blur-2xl bg-primary/40 animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="font-headline text-5xl md:text-8xl font-bold text-foreground tracking-tight drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]">
              {t('home.title1')}<br />
              <span className="text-primary">{t('home.title2')}</span>
            </h1>
            <p className="font-headline text-lg md:text-2xl text-red-300 italic">
              {t('home.subtitle')}
            </p>
          </div>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {t('home.description')}
          </p>

          {/* CTA Buttons */}
          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate(createPageUrl("CreateWorld"))}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-xl px-12 py-6 h-auto rounded-lg shadow-[0_0_30px_rgba(220,38,38,0.6)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(220,38,38,0.8)]"
            >
              <Plus className="w-6 h-6 mr-3" />
              {t('home.newChronicle')}
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate(createPageUrl("WorldsList"))}
              className="border-primary text-primary hover:bg-primary/10 font-headline text-xl px-12 py-6 h-auto rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all duration-300 hover:scale-105"
            >
              <BookOpen className="w-6 h-6 mr-3" />
              {t('home.continueChronicle')}
            </Button>


          </div>

          {/* Atmospheric Text */}
          <div className="pt-12">
            <p className="font-headline text-sm text-red-400 italic">
              {t('home.atmosphericText')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}