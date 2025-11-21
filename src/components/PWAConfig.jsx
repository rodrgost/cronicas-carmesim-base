import React, { useEffect } from 'react';

const MANIFEST = {
  "name": "Crônicas Carmesim",
  "short_name": "Crônicas",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#0a0a0a",
  "theme_color": "#dc2626",
  "description": "Narrativa interativa de Vampiro: A Máscara V5",
  "icons": [
    {
      "src": "https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=192&auto=format&fit=crop",
      "sizes": "192x192",
      "type": "image/jpeg"
    },
    {
      "src": "https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=512&auto=format&fit=crop",
      "sizes": "512x512",
      "type": "image/jpeg"
    }
  ]
};

export default function PWAConfig() {
  useEffect(() => {
    // 1. Gerar e injetar o Manifesto via Data URI
    const stringManifest = JSON.stringify(MANIFEST);
    const blob = new Blob([stringManifest], {type: 'application/json'});
    const manifestURL = URL.createObjectURL(blob);
    
    let linkManifest = document.querySelector("link[rel='manifest']");
    if (!linkManifest) {
      linkManifest = document.createElement('link');
      linkManifest.rel = 'manifest';
      document.head.appendChild(linkManifest);
    }
    linkManifest.href = manifestURL;

    // 2. Injetar Meta Tags para iOS e Android (Web App Capable)
    const metaTags = [
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'apple-mobile-web-app-title', content: 'Crônicas' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'theme-color', content: '#dc2626' },
      // Prevenir zoom indevido em inputs no mobile
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' }
    ];

    metaTags.forEach(tag => {
      // Verifica se já existe para não duplicar (exceto viewport que vamos forçar)
      let element = document.querySelector(`meta[name="${tag.name}"]`);
      
      if (tag.name === 'viewport') {
        // Atualiza viewport existente ou cria
        if (!element) {
          element = document.createElement('meta');
          element.name = 'viewport';
          document.head.appendChild(element);
        }
        element.content = tag.content;
      } else if (!element) {
        element = document.createElement('meta');
        element.name = tag.name;
        element.content = tag.content;
        document.head.appendChild(element);
      }
    });

    // 3. Ícone para iOS (Apple Touch Icon)
    let linkIcon = document.querySelector("link[rel='apple-touch-icon']");
    if (!linkIcon) {
      linkIcon = document.createElement('link');
      linkIcon.rel = 'apple-touch-icon';
      document.head.appendChild(linkIcon);
    }
    linkIcon.href = MANIFEST.icons[0].src;

  }, []);

  return null; // Componente lógico, sem renderização visual
}