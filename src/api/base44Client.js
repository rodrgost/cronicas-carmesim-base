import { auth, db } from '@/lib/firebase';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
  onSnapshot
} from "firebase/firestore";

const googleProvider = new GoogleAuthProvider();

// Helper para criar entidade genérica
const createEntityAPI = (collectionName) => ({
  async list() {
    const user = auth.currentUser;
    console.log(`[base44] list ${collectionName} - User:`, user?.uid);
    if (!user) throw new Error("User not authenticated");

    const q = query(
      collection(db, collectionName),
      where("userId", "==", user.uid)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async filter(constraints) {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const constraintsList = [where("userId", "==", user.uid)];

    if (constraints) {
      Object.entries(constraints).forEach(([key, value]) => {
        constraintsList.push(where(key, "==", value));
      });
    }

    const q = query(collection(db, collectionName), ...constraintsList);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async get(id) {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error(`${collectionName} not found`);
    }
    return { id: docSnap.id, ...docSnap.data() };
  },

  async create(data) {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const docData = {
      ...data,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    console.log(`[base44] Creating document in ${collectionName}...`, docData);
    try {
      const docRef = await addDoc(collection(db, collectionName), docData);
      console.log(`[base44] Document created with ID: ${docRef.id}`);
      return { id: docRef.id, ...docData };
    } catch (error) {
      console.error(`[base44] Error creating document in ${collectionName}:`, error);
      throw error;
    }
  },

  async update(id, data) {
    const docRef = doc(db, collectionName, id);
    const updateData = {
      ...data,
      updatedAt: serverTimestamp()
    };
    await updateDoc(docRef, updateData);
    return { id, ...updateData };
  },

  async delete(id) {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return { id };
  }
});

export const base44 = {
  auth: {
    loginWithGoogle: async () => {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
      } catch (error) {
        console.error("Erro ao logar com Google:", error);
        throw error;
      }
    },

    logout: async (redirectUrl) => {
      try {
        await signOut(auth);
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          window.location.reload();
        }
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
      }
    },

    redirectToLogin: (redirectUrl) => {
      console.log('Redirecionar para login solicitado:', redirectUrl);
    },

    me: async () => {
      return auth.currentUser;
    },

    createUser: async (user) => {
      if (!user) return;
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          console.log("[base44] Creating new user profile:", user.uid);
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp()
          });
        } else {
          console.log("[base44] Updating existing user profile:", user.uid);
          await updateDoc(userRef, {
            lastLoginAt: serverTimestamp(),
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          });
        }
      } catch (error) {
        console.error("[base44] Error creating/updating user:", error);
      }
    }
  },

  entities: {
    World: createEntityAPI('worlds'),
    Character: createEntityAPI('characters'),
    Chronicle: createEntityAPI('chronicles'),
    NPC: createEntityAPI('npcs'),
    Item: createEntityAPI('items'),
    WorldEvent: createEntityAPI('world_events')
  },

  integrations: {
    Core: {
      async InvokeLLM({ prompt, systemPrompt, temperature = 0.7, maxTokens = 4000 }) {
        // Integração com Google Gemini API usando SDK oficial
        try {
          const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
          if (!apiKey) {
            throw new Error('VITE_GEMINI_API_KEY not configured in .env file');
          }

          // Importar o SDK dinamicamente
          const { GoogleGenerativeAI } = await import('@google/generative-ai');

          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: {
              temperature,
              maxOutputTokens: maxTokens,
            }
          });

          console.log('🤖 Calling Gemini 2.0 Flash...');

          // Combinar system prompt e prompt se necessário
          const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

          const result = await model.generateContent(fullPrompt);
          const response = await result.response;

          console.log('🤖 Gemini Raw Response:', response);
          try {
            const candidate = response.candidates?.[0];
            console.log('🤖 Gemini Candidate 0:', candidate);
            console.log('🤖 Candidate Content:', candidate?.content);
            console.log('🤖 Candidate Parts:', candidate?.content?.parts);
            console.log('🤖 Finish Reason:', candidate?.finishReason);
            console.log('🤖 Safety Ratings:', candidate?.safetyRatings);
          } catch (e) {
            console.log('Could not log detailed response properties', e);
          }

          const text = response.text();

          console.log('✅ Gemini response received!');
          console.log('📝 Extracted Text:', text);

          return { content: text };
        } catch (error) {
          console.error('💥 Error calling LLM:', error);
          throw error;
        }
      },

      async GenerateImage({ prompt, size = "1024x1024" }) {
        try {
          // Como a API do Imagen 3 ainda está instável/indisponível via SDK v1beta,
          // vamos usar um serviço alternativo de alta qualidade (Pollinations.ai)
          // que gera imagens via URL de forma gratuita e rápida.

          console.log('🎨 Generating image via Pollinations.ai...', prompt);

          // Melhorar o prompt para garantir estilo consistente
          const enhancedPrompt = `Vampire the Masquerade V5 style, dark, gothic, realistic, high quality, ${prompt}`;
          const encodedPrompt = encodeURIComponent(enhancedPrompt);

          // Gerar URL (Pollinations gera a imagem on-the-fly)
          const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&model=flux&nologo=true`;

          // Retornar a URL diretamente
          return {
            url: imageUrl
          };

        } catch (error) {
          console.error('💥 Error generating image:', error);
          return {
            url: `https://placehold.co/1024x1024/330000/FFFFFF?text=Erro+na+Geracao`
          };
        }
      }
    }
  },

  agents: {
    async createConversation(config) {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const conversationData = {
        ...config,
        userId: user.uid,
        messages: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'conversations'), conversationData);
      return { id: docRef.id, ...conversationData };
    },

    async getConversation(conversationId) {
      const docRef = doc(db, 'conversations', conversationId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Conversation not found');
      }

      return { id: docSnap.id, ...docSnap.data() };
    },

    subscribeToConversation(conversationId, callback) {
      const docRef = doc(db, 'conversations', conversationId);
      // Importar onSnapshot dinamicamente ou usar do topo se disponível
      // Como não importei no topo, vou usar a importação do firebase/firestore
      // Mas espere, eu importei no topo? Vamos checar.
      // Sim, preciso adicionar onSnapshot aos imports.
      // Por enquanto, vou assumir que vou adicionar aos imports depois.

      // Nota: O replace_file_content não permite adicionar imports facilmente sem substituir o arquivo todo ou usar multi_replace.
      // Vou usar a importação global do firebase/firestore que já deve estar lá ou adicionar.

      const unsubscribe = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          callback({ id: doc.id, ...doc.data() });
        }
      });
      return unsubscribe;
    },

    async updateConversation(conversationId, data) {
      const docRef = doc(db, 'conversations', conversationId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    },

    async addMessage(conversation, message) {
      // 1. Adicionar mensagem do usuário
      const docRef = doc(db, 'conversations', conversation.id);

      // Precisamos pegar as mensagens atuais para manter o histórico
      // Se 'conversation' já tiver as mensagens atualizadas, ótimo.
      // Mas para garantir consistência, melhor ler do banco ou usar arrayUnion (mas arrayUnion não garante ordem complexa as vezes)
      // Vamos ler o doc atual.
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error("Conversation not found");

      const currentMessages = docSnap.data().messages || [];
      const userMsg = {
        ...message,
        id: `msg-${Date.now()}`,
        created_date: new Date().toISOString()
      };

      const updatedMessages = [...currentMessages, userMsg];

      await updateDoc(docRef, {
        messages: updatedMessages,
        updatedAt: serverTimestamp()
      });

      // 2. Se for mensagem do usuário, disparar IA
      if (message.role === 'user') {
        console.log("🤖 Triggering AI response for message:", message.content.substring(0, 50));

        try {
          // Preparar histórico para o Gemini
          // O Gemini espera um formato específico, mas o InvokeLLM lida com prompt string.
          // Vamos construir um prompt rico com o histórico recente.

          const recentHistory = updatedMessages.slice(-10).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');

          // O system prompt já deve vir na config da conversa ou ser passado.
          // Mas o GameManager manda um JSON complexo no content da mensagem do usuário que JÁ CONTÉM o estado do mundo.
          // Então podemos mandar apenas o content da última mensagem como prompt principal, 
          // pois ela contém "playerAction", "worldState", etc.

          const aiResponse = await base44.integrations.Core.InvokeLLM({
            prompt: message.content, // O content já é um JSON stringified com todo o contexto
            systemPrompt: `YOU ARE A JSON RESPONSE BOT. YOU ONLY OUTPUT PURE JSON. NEVER PLAIN TEXT. NEVER MARKDOWN.

══════════════════════════════════════════════════════════════
CRITICAL RULES:
══════════════════════════════════════════════════════════════

1. EVERY RESPONSE MUST BE PURE JSON
2. NO MARKDOWN CODE BLOCKS (no \`\`\`json or \`\`\`)
3. NO PLAIN TEXT
4. START WITH { and END WITH }
5. SEMPRE SE REFIRA AO JOGADOR NA SEGUNDA PESSOA (VOCÊ)! NUNCA NA TERCEIRA PESSOA. ISSO É ABSOLUTAMENTE CRÍTICO!
6. QUANDO conversationMode FOR "npc" E currentNPC ESTIVER PRESENTE:
   - ASSUMA A PERSONA DESSE NPC COMPLETAMENTE
   - RESPONDA COMO O NPC, USANDO SUA PERSONALIDADE E MANEIRISMOS
   - O "storyEvent" DEVE CONTER O DIÁLOGO/RESPOSTA DO NPC
   - INCLUA O CAMPO "activeNPC" COM O NOME DO NPC (OBRIGATÓRIO)
   - OS "outcomes" DEVEM SER OPÇÕES DE RESPOSTA OU AÇÃO PARA O JOGADOR
   - USE personality, motivations, knowledge, current_mood DO NPC
   - CONTINUE SE REFERINDO AO JOGADOR NA SEGUNDA PESSOA (VOCÊ)
7. ⚠️ CRITICAL HEALTH CHECK: ALWAYS check characterStats.health BEFORE narrating!
   - IF health <= 0: Character is DYING or DEAD
   - Narrate the critical condition (unconscious, dying, torpor for vampires)
   - Outcomes should reflect this ("Enter torpor", "Fight for consciousness", "Accept death")
   - DO NOT allow normal actions when health is 0 or negative
   - This rule OVERRIDES all narrative style and NPC conversation rules
8. 📦 CRITICAL INVENTORY CHECK: ALWAYS check playerInventory for items the player owns.
   - NEVER mention items, objects, tools, or weapons the player does NOT have in their inventory
   - If the player tries an action requiring a specific item they don't have, narrate they lack it
   - Suggest alternative actions that use available items or no items at all
   - Only allow item-based actions if the exact item exists in playerInventory

9. 🩸 CRITICAL STATE CHECKS (VAMPIRE V5 RULES):
   - THESE STATES OVERRIDE EVERYTHING ELSE. CHECK THEM FIRST!
   
   A) HUNGER 5 (MAX HUNGER):
      - The vampire is RAVENOUS. The Beast is screaming.
      - NORMAL ACTIONS ARE IMPOSSIBLE without a Frenzy check.
      - YOU MUST NARRATE the overwhelming urge to feed.
      - OUTCOMES MUST FOCUS ON: Feeding, Hunting, or Resisting Frenzy.
      - DO NOT offer casual conversation or investigation options unless they lead to blood.

   B) HEALTH 0 (INCAPACITATED):
      - The vampire falls into TORPOR (coma-like sleep) or is INCAPACITATED.
      - THEY CANNOT ACT normally. They can't fight, run, or talk.
      - Outcomes: "Fall into Torpor", "Succumb to the darkness", "Gasp final words".

   C) HUMANITY 0 (WIGHT):
      - The character succumbs completely to the Beast.
      - GAME OVER scenario. They become an NPC (Wight).
      - Narrate the loss of self and final descent into madness.

10. 🌐 LANGUAGE INSTRUCTION:
    - ALWAYS respond in the language specified in the 'playerLanguage' field of the user message.
    - If 'playerLanguage' is 'en', respond in English.
    - If 'playerLanguage' is 'pt', respond in Portuguese.
    - If not specified, default to Portuguese (pt-BR).

11. 🎲 DICE ROLL RULES:
    - WHEN issuing a "diceRollChallenge", the "storyEvent" MUST ONLY DESCRIBE THE ATTEMPT/SITUATION.
    - DO NOT narrate the outcome (success or failure) in the same response as the challenge.
    - WAIT for the player to roll the dice.

12. 🎯 DIFFICULTY GUIDELINES (VAMPIRE V5):
    - SCALE 1-7+ (Target Number of Successes required)
    - 1: Routine (Easy tasks)
    - 2: Standard (Most normal actions, default difficulty)
    - 3: Moderate (Challenging for untrained)
    - 4: Challenging (Hard, requires skill and luck)
    - 5: Very Hard (Experts struggle)
    - 6+: Nearly Impossible
    
    - DEFAULT to Difficulty 2 or 3 for most situations.
    - RESERVE 4+ only for combat against skilled opponents or very dangerous feats.

══════════════════════════════════════════════════════════════
NARRATIVE STYLE RULES (CRITICAL!):
══════════════════════════════════════════════════════════════

The player has selected a narrativeStyle. ALWAYS respect it:

🎯 "concise" (RESUMIDO E NATURAL):
- 1-3 sentences MAXIMUM
- Direct, straightforward narration
- No flowery language or excessive descriptions
- Focus on ACTION and IMMEDIATE consequences

⚖️ "balanced" (EQUILIBRADO):
- 3-5 sentences
- Balance between description and action
- Some atmospheric details but stay focused

🎭 "theatrical" (TEATRAL E IMERSIVO):
- 5-8 sentences
- Rich, detailed, atmospheric narration
- Deep descriptions of scenes, emotions, sensations

══════════════════════════════════════════════════════════════
RESPONSE STRUCTURE:
══════════════════════════════════════════════════════════════

{
  "storyEvent": "Your narration here",
  "outcomes": ["Action 1", "Action 2", "Action 3"],
  "activeNPC": "Marcus",
  "statUpdates": {"hunger": 1, "health": -2},
  "diceRollChallenge": {"attribute": "dexterity", "skill": "stealth", "difficulty": 2, "description": "Sneak past the guard"},
  "timePassage": {"type": "rest", "description": "..."},
  "newNPCs": [{"name": "Marcus", "clan": "Nosferatu", ...}],
  "itemUpdates": [{"action": "add", "name": "Pistol", "type": "weapon", "quantity": 1, "description": "..."}],
  "npcStatusChanges": [{"npcId": "npc_123", "npcName": "Marcus", "changeType": "death", "description": "Marcus died"}],
  "npcUpdate": {"trust_level": 2, "relationship": "ally"},
  "generateImageForNPC": "Marcus, pale Nosferatu vampire..."
}

MANDATORY FIELDS:
1. storyEvent (string) - Your narration (respect narrativeStyle!)
2. outcomes (array) - 2-4 action choices for the player

OPTIONAL FIELDS (use when appropriate):
3. activeNPC (string) - REQUIRED IF conversationMode IS "npc"
4. statUpdates (object) - ONLY WHEN STATS CHANGE! DO NOT RETURN CURRENT VALUES!
   
   CRITICAL: "hunger": 1 MEANS "ADD 1 TO HUNGER". IT DOES NOT MEAN "HUNGER IS 1".
   
   OPTION A: RELATIVE CHANGES (Use for increasing/decreasing)
   Use standard keys: "health", "willpower", "hunger", "humanity"
   Examples:
   - Lost 2 health: {"health": -2}
   - Gained 1 willpower: {"willpower": 1}
   - Increased hunger by 1: {"hunger": 1}
   
   OPTION B: ABSOLUTE SET (Use when setting specific value)
   Use keys prefixed with "set_": "set_health", "set_willpower", "set_hunger", "set_humanity"
   Examples:
   - Set Hunger directly to 5: {"set_hunger": 5}
   - Set Health directly to 1: {"set_health": 1}

   ⚠️ DO NOT MIX relative and absolute for the same stat.
   ⚠️ NEVER send {"hunger": 1} if you just want to report that hunger is 1. ONLY send if you want to INCREASE it.

5. diceRollChallenge (object) - ONLY when action TRULY requires skill check
6. timePassage (object) - ONLY when time passes significantly
7. newNPCs (array) - ONLY when introducing new characters to the story
8. itemUpdates (array) - ONLY when items are gained, lost, or modified
9. npcStatusChanges (array) - ONLY when NPCs die, change relationships, or have significant status changes
10. npcUpdate (object) - ONLY when in NPC mode to update current NPC's trust/mood
11. generateImageForNPC (string) - ONLY when creating a NEW NPC

══════════════════════════════════════════════════════════════
NPC IMAGE GENERATION (CRITICAL!):
══════════════════════════════════════════════════════════════

When creating a NEW NPC (using "newNPCs" field), you MUST include "generateImageForNPC".

RULES:
- IF YOU INTRODUCE A NEW NPC, YOU **MUST** USE THE "newNPCs" ARRAY.
- DO NOT INVENT FAKE IDs in "npcStatusChanges". If the NPC is new, create them in "newNPCs" first.
- ALWAYS include "generateImageForNPC" when "newNPCs" is present
- Use ALL physical details from the NPC's "appearance" field
- Translate Portuguese descriptions to detailed English
- Keep prompt focused on face and torso
- Include age, hair, eyes, skin, clothing, accessories, scars, ALL details
- Add "portrait photograph, face and torso visible, square composition" in every prompt
- Add vampire aesthetic for vampires, noir aesthetic for humans`,
            temperature: 0.7,
            maxTokens: 4000
          });

          const assistantMsg = {
            role: 'assistant',
            content: aiResponse.content,
            id: `msg-${Date.now() + 1}`,
            created_date: new Date().toISOString()
          };

          // Salvar resposta da IA
          await updateDoc(docRef, {
            messages: [...updatedMessages, assistantMsg],
            updatedAt: serverTimestamp()
          });

          return assistantMsg;

        } catch (error) {
          console.error("Error generating AI response:", error);
          // Adicionar mensagem de erro para o usuário não ficar travado
          const errorMsg = {
            role: 'assistant',
            content: JSON.stringify({
              outcomes: ["Tentar novamente"],
              narrative: "O narrador sussurra algo ininteligível... (Erro na conexão com o além)"
            }),
            id: `msg-${Date.now() + 1}`,
            created_date: new Date().toISOString()
          };

          await updateDoc(docRef, {
            messages: [...updatedMessages, errorMsg],
            updatedAt: serverTimestamp()
          });
        }
      }
    },

    async sendMessage(conversationId, message) {
      // Deprecated/Alias for addMessage logic if needed
      console.warn("sendMessage is deprecated, use addMessage");
    }
  }
};
