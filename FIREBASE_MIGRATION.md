# Migração para Firebase - Crônicas Carmesim

## ✅ Concluído

A aplicação foi **migrada completamente do Base44 SDK para Firebase**. Agora usa:

- **Firebase Authentication** para login com Google
- **Firebase Firestore** para armazenamento de dados (Worlds, Characters, Chronicles, NPCs)
- **Google Gemini API** para geração de conteúdo via LLM

## 📋 Configuração Necessária

### 1. Firebase Console

Acesse [Firebase Console](https://console.firebase.google.com/) e:

1. Crie um novo projeto (ou use o existente `cronicas-carmesin-v1`)
2. Ative **Authentication** > **Google Sign-In**
3. Ative **Firestore Database** (modo de produção ou teste)
4. Copie as credenciais do projeto em **Configurações do Projeto** > **Seus apps** > **Configuração do SDK**

### 2. Regras do Firestore

Configure as regras de segurança no Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura/escrita apenas para dados do próprio usuário
    match /{collection}/{document} {
      allow read, write: if request.auth != null && 
                          resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    // Regra específica para conversations (se necessário)
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && 
                          resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
  }
}
```

### 3. Google Gemini API

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma API Key gratuita
3. Adicione ao arquivo `.env` (veja abaixo)

### 4. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=sua_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id

# Google Gemini API
VITE_GEMINI_API_KEY=sua_gemini_api_key
```

**Nota:** As credenciais atuais em `src/lib/firebase.js` são apenas para desenvolvimento. Para produção, use variáveis de ambiente.

## 🔄 Mudanças na Arquitetura

### Antes (Base44 SDK)
```javascript
import { base44 } from '@base44/sdk';
await base44.entities.World.create({ name: 'Meu Mundo' });
```

### Depois (Firebase)
```javascript
import { base44 } from '@/api/base44Client';
await base44.entities.World.create({ name: 'Meu Mundo' });
```

A interface permanece a mesma! O `base44Client.js` foi reescrito para usar Firebase internamente.

## 📦 Estrutura de Dados no Firestore

### Collections

- **worlds** - Mundos criados pelos usuários
- **characters** - Personagens jogáveis
- **chronicles** - Histórias/sessões de jogo
- **npcs** - NPCs encontrados durante o jogo
- **conversations** - Conversas com o narrador AI

### Documento Exemplo (World)

```javascript
{
  id: "abc123",
  userId: "firebase_user_id",
  name: "São Paulo Noturna",
  description: "Uma metrópole...",
  keywords: "cyberpunk, vampiros",
  generatedDetails: { ... },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## 🚀 Próximos Passos

1. **Configurar Firebase** seguindo os passos acima
2. **Obter Gemini API Key** para geração de conteúdo
3. **Testar login** - O botão "Entrar com Google" deve aparecer na home
4. **Criar um mundo** - Teste a geração de conteúdo com IA

## ⚠️ Limitações Atuais

- **Geração de Imagens**: Atualmente usa placeholder. Integre com DALL-E, Stable Diffusion ou similar
- **Agente de Conversa**: A função `sendMessage` retorna resposta simulada. Integre com seu agente de IA preferido
- **Offline**: Firestore suporta modo offline, mas não está configurado

## 🐛 Troubleshooting

### "User not authenticated"
- Certifique-se de fazer login com Google primeiro
- Verifique se o Firebase Auth está configurado corretamente

### "Permission denied" no Firestore
- Verifique as regras de segurança do Firestore
- Certifique-se de que o usuário está autenticado

### Erros de CORS
- Adicione seu domínio nas configurações do Firebase
- Para desenvolvimento local, use `http://localhost:5174`

## 📚 Recursos

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Google Gemini API](https://ai.google.dev/)
