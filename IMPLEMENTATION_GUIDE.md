# Guia Completo de Implementação - Todas as Alterações

## 📋 Índice

1. [Alterações no Settings.jsx](#1-alterações-no-settingsjsx)
2. [Alterações no base44Client.js](#2-alterações-no-base44clientjs)
3. [Alterações no narrator-agent.txt](#3-alterações-no-narrator-agenttxt)
4. [Alterações no StoryChat.jsx](#4-alterações-no-storychatjsx)
5. [Como Testar](#5-como-testar)

---

## 1. Alterações no Settings.jsx

**Arquivo**: `src/pages/Settings.jsx`

### 1.1 Adicionar Constante GEMINI_MODELS (no topo do arquivo, após os imports)

```javascript
const GEMINI_MODELS = [
  {
    value: "gemini-2.0-flash",
    label: "Gemini 2.0 Flash ⚡",
    description: "Rápido, eficiente e muito econômico. Ideal para a maioria dos usos.",
    inputCost: "$0.10",
    outputCost: "$0.40",
    badge: "PADRÃO"
  },
  {
    value: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    description: "Versão melhorada do Flash com melhor qualidade.",
    inputCost: "$0.10",
    outputCost: "$0.40",
    badge: null
  },
  {
    value: "gemini-2.5-flash-lite",
    label: "Gemini 2.5 Flash Lite 💰",
    description: "Mais econômico para contextos longos.",
    inputCost: "~$0.05",
    outputCost: "~$0.20",
    badge: "ECONÔMICO"
  },
  {
    value: "gemini-2.5-pro",
    label: "Gemini 2.5 Pro 🧠",
    description: "Mais inteligente, melhor raciocínio e compreensão.",
    inputCost: "$1.25",
    outputCost: "$10.00",
    badge: "PREMIUM"
  },
  {
    value: "gemini-3-pro",
    label: "Gemini 3 Pro 🚀",
    description: "Modelo mais recente e avançado (preview).",
    inputCost: "$2.00",
    outputCost: "$12.00",
    badge: "NOVO"
  }
];
```

### 1.2 Adicionar State para geminiModel (junto com os outros useState)

```javascript
const [geminiModel, setGeminiModel] = useState("gemini-2.0-flash");
```

### 1.3 Atualizar loadChronicle (adicionar linha após carregar simpleVocabulary)

**Localização**: Dentro da função `loadChronicle`, após `setSimpleVocabulary(...)`

```javascript
setSimpleVocabulary(chron.simple_vocabulary !== false);
setGeminiModel(chron.gemini_model || "gemini-2.0-flash"); // ← ADICIONAR ESTA LINHA
```

### 1.4 Atualizar handleSave (adicionar campo gemini_model)

**Localização**: Dentro de `handleSave`, no objeto passado para `base44.entities.Chronicle.update`

```javascript
await base44.entities.Chronicle.update(chronicleId, {
  narrative_style: narrativeStyle,
  simple_vocabulary: simpleVocabulary,
  gemini_model: geminiModel, // ← ADICIONAR ESTA LINHA
  updatedAt: new Date().toISOString()
});
```

### 1.5 Adicionar Seção de UI para Modelo de IA

**Localização**: Após o card de "Vocabulário Simples", antes do botão "Salvar Configurações"

```jsx
{/* Modelo de IA */}
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Sparkles className="w-5 h-5" />
      Modelo de IA
    </CardTitle>
    <CardDescription>
      Escolha qual modelo Gemini irá narrar sua crônica
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <RadioGroup value={geminiModel} onValueChange={setGeminiModel}>
      {GEMINI_MODELS.map((model) => (
        <div key={model.value} className="flex items-start space-x-3 space-y-0">
          <RadioGroupItem value={model.value} id={model.value} />
          <Label
            htmlFor={model.value}
            className="font-normal cursor-pointer flex-1"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">{model.label}</span>
              {model.badge && (
                <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">
                  {model.badge}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              {model.description}
            </p>
            <p className="text-xs text-muted-foreground">
              Input: {model.inputCost}/M tokens | Output: {model.outputCost}/M tokens
            </p>
          </Label>
        </div>
      ))}
    </RadioGroup>

    <Alert>
      <Info className="h-4 w-4" />
      <AlertDescription className="text-sm">
        <strong>Dica:</strong> O modelo Flash é ideal para a maioria dos usos. 
        Use Pro para sessões importantes que exigem melhor raciocínio.
      </AlertDescription>
    </Alert>
  </CardContent>
</Card>
```

---

## 2. Alterações no base44Client.js

**Arquivo**: `src/api/base44Client.js`

### 2.1 Adicionar parâmetro model ao InvokeLLM

**Localização**: Linha ~180

**ANTES**:
```javascript
async InvokeLLM({ prompt, systemPrompt, temperature = 0.7, maxTokens = 4000 }) {
```

**DEPOIS**:
```javascript
async InvokeLLM({ prompt, systemPrompt, temperature = 0.7, maxTokens = 4000, model = "gemini-2.0-flash" }) {
```

### 2.2 Renomear variável interna model para genModel

**Localização**: Linhas ~191-198

**ANTES**:
```javascript
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    temperature,
    maxOutputTokens: maxTokens,
  }
});
```

**DEPOIS**:
```javascript
const genAI = new GoogleGenerativeAI(apiKey);
const genModel = genAI.getGenerativeModel({
  model: model,
  generationConfig: {
    temperature,
    maxOutputTokens: maxTokens,
  }
});
```

### 2.3 Atualizar console.log

**Localização**: Linha ~200

**ANTES**:
```javascript
console.log('🤖 Calling Gemini 2.0 Flash...');
```

**DEPOIS**:
```javascript
console.log(`🤖 Calling ${model}...`);
```

### 2.4 Usar genModel ao invés de model

**Localização**: Linha ~205

**ANTES**:
```javascript
const result = await model.generateContent(fullPrompt);
```

**DEPOIS**:
```javascript
const result = await genModel.generateContent(fullPrompt);
```

### 2.5 Adicionar lógica de carregamento do chronicle no addMessage

**Localização**: Dentro da função `addMessage`, linhas ~346-370

**ANTES**:
```javascript
try {
  // Preparar histórico para o Gemini
  const recentHistory = updatedMessages.slice(-10).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');

  const aiResponse = await base44.integrations.Core.InvokeLLM({
    prompt: message.content,
    systemPrompt: `YOU ARE A JSON RESPONSE BOT...`,
```

**DEPOIS**:
```javascript
try {
  // Buscar configurações do chronicle para pegar o modelo selecionado
  let selectedModel = "gemini-2.0-flash"; // default
  
  try {
    const conversationData = docSnap.data();
    const chronicleId = conversationData.chronicle_id || conversationData.chronicleId;
    
    if (chronicleId) {
      console.log("📖 Loading chronicle settings for model selection:", chronicleId);
      const chronicle = await base44.entities.Chronicle.get(chronicleId);
      selectedModel = chronicle.gemini_model || "gemini-2.0-flash";
      console.log(`🎯 Using selected model: ${selectedModel}`);
    } else {
      console.log("⚠️ No chronicle_id in conversation, using default model");
    }
  } catch (e) {
    console.log("⚠️ Could not load chronicle settings:", e.message);
  }

  // Preparar histórico para o Gemini
  const recentHistory = updatedMessages.slice(-10).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');

  const aiResponse = await base44.integrations.Core.InvokeLLM({
    prompt: message.content,
    model: selectedModel,
    systemPrompt: `YOU ARE A JSON RESPONSE BOT...`,
```

---

## 3. Alterações no narrator-agent.txt

**Arquivo**: `src/prompts/narrator-agent.txt`

### 3.1 Adicionar regras de vocabulário simples

**Localização**: Após a seção "NARRATIVE STYLE RULES", adicionar nova seção

```
══════════════════════════════════════════════════════════════
SIMPLE VOCABULARY RULES (CRITICAL!):
══════════════════════════════════════════════════════════════

The player may have enabled "Simple Vocabulary" mode. ALWAYS check the simpleVocabulary field!

IF simpleVocabulary === true:
- Use SIMPLE, COMMON words that a 12-year-old would understand
- AVOID: archaic, poetic, flowery, or complex vocabulary
- AVOID: words like "countenance", "visage", "erstwhile", "hitherto", etc.
- USE: "face" instead of "visage", "former" instead of "erstwhile"
- Keep sentences SHORT and DIRECT
- Focus on CLARITY over literary style
- Still maintain atmosphere, but through simple, vivid descriptions

IF simpleVocabulary === false or undefined:
- You may use rich, atmospheric, literary vocabulary
- Poetic and evocative language is encouraged
- Complex sentence structures are acceptable

EXAMPLES:

❌ Complex: "Your countenance betrays the trepidation that grips your immortal soul."
✅ Simple: "Your face shows the fear that grips your undead soul."

❌ Complex: "The erstwhile prince regards you with palpable disdain."
✅ Simple: "The former prince looks at you with clear disgust."

❌ Complex: "Shadows coalesce around your form, heralding the Beast's ascendance."
✅ Simple: "Shadows gather around you as the Beast rises within."
```

---

## 4. Alterações no StoryChat.jsx

**Arquivo**: `src/components/play/StoryChat.jsx`

### 4.1 Adicionar simpleVocabulary ao JSON da mensagem inicial

**Localização**: Dentro de `loadConversation`, na mensagem inicial (linha ~201)

**ANTES**:
```javascript
content: JSON.stringify({
  playerAction: language === 'en' ? "Start the story" : "Comece a história",
  playerLanguage: language,
  characterStats: JSON.stringify({...}),
  worldDescription: world.generated_details,
  worldState: chronicle.world_state,
  currentDay: chronicle.current_day || 1,
  daysSinceLastRest: 0,
  conversationMode: "narrator",
  narrativeStyle: chronicle.narrative_style || "concise"
})
```

**DEPOIS**:
```javascript
content: JSON.stringify({
  playerAction: language === 'en' ? "Start the story" : "Comece a história",
  playerLanguage: language,
  characterStats: JSON.stringify({...}),
  worldDescription: world.generated_details,
  worldState: chronicle.world_state,
  currentDay: chronicle.current_day || 1,
  daysSinceLastRest: 0,
  conversationMode: "narrator",
  narrativeStyle: chronicle.narrative_style || "concise",
  simpleVocabulary: chronicle.simple_vocabulary !== false  // ← ADICIONAR ESTA LINHA
})
```

---

## 5. Como Testar

### 5.1 Testar Seleção de Modelo Gemini

1. **Abrir aplicação**: `npm run dev`
2. **Navegar para Settings** de uma crônica
3. **Verificar seção "Modelo de IA"** aparece
4. **Verificar modelo padrão** selecionado (Gemini 2.0 Flash)
5. **Selecionar modelo diferente** (ex: Gemini 2.5 Pro)
6. **Salvar configurações**
7. **Recarregar página** e verificar que seleção persiste
8. **Iniciar ação no jogo**
9. **Abrir Console (F12)** e verificar logs:
   - `📖 Loading chronicle settings for model selection: [id]`
   - `🎯 Using selected model: gemini-2.5-pro`
   - `🤖 Calling gemini-2.5-pro...`

### 5.2 Testar Vocabulário Simples

1. **Ir para Settings**
2. **Ativar "Usar vocabulário simples"**
3. **Salvar**
4. **Jogar uma sessão**
5. **Verificar** que o narrador usa palavras simples e diretas
6. **Desativar** a opção
7. **Verificar** que o narrador volta a usar vocabulário mais rico

### 5.3 Testar Persistência

1. **Configurar** modelo e vocabulário
2. **Salvar**
3. **Sair da aplicação**
4. **Reabrir**
5. **Verificar** que configurações foram mantidas

---

## 📝 Resumo das Mudanças

### Arquivos Modificados:

1. ✅ `src/pages/Settings.jsx`
   - Constante GEMINI_MODELS
   - State geminiModel
   - UI para seleção de modelo
   - Lógica de save/load

2. ✅ `src/api/base44Client.js`
   - Parâmetro model em InvokeLLM
   - Lógica de carregamento do chronicle
   - Passagem do modelo selecionado

3. ✅ `src/prompts/narrator-agent.txt`
   - Regras de vocabulário simples

4. ✅ `src/components/play/StoryChat.jsx`
   - Passagem de simpleVocabulary na mensagem inicial

### Features Implementadas:

- ✅ Seleção de modelo Gemini com 5 opções
- ✅ Exibição de custos por modelo
- ✅ Persistência da seleção
- ✅ Uso do modelo selecionado nas chamadas de IA
- ✅ Vocabulário simples configurável
- ✅ Fallbacks para valores padrão

---

## ⚠️ Notas Importantes

1. **Ordem de implementação**: Faça as mudanças na ordem apresentada
2. **Teste após cada arquivo**: Verifique que não há erros de sintaxe
3. **Console logs**: Use os logs para debugar e confirmar funcionamento
4. **Backup**: Considere fazer commit após cada arquivo modificado
5. **Custos**: Lembre-se que modelos Pro custam ~10x mais que Flash
