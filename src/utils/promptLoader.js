// Carregador de prompts
// Este módulo carrega e cacheia os prompts do sistema

let narratorPromptCache = null;

/**
 * Carrega o prompt do narrador do arquivo narrator-agent.txt
 * Usa cache para evitar múltiplas requisições
 */
export async function getNarratorPrompt() {
    if (narratorPromptCache) {
        return narratorPromptCache;
    }

    try {
        const response = await fetch('/src/prompts/narrator-agent.txt');
        if (!response.ok) {
            throw new Error(`Failed to load narrator prompt: ${response.status}`);
        }

        const text = await response.text();

        // Extrair apenas a parte de "Instructions" em diante
        // (pular o cabeçalho "Description")
        const lines = text.split('\n');
        const instructionsIndex = lines.findIndex(line => line.trim() === 'Instructions');

        if (instructionsIndex === -1) {
            // Se não encontrar "Instructions", usar o texto todo
            narratorPromptCache = text;
        } else {
            // Pular "Instructions" e a linha de descrição, pegar o resto
            narratorPromptCache = lines.slice(instructionsIndex + 2).join('\n').trim();
        }

        console.log('✅ Narrator prompt loaded from file');
        return narratorPromptCache;

    } catch (error) {
        console.error('❌ Error loading narrator prompt:', error);
        // Fallback para um prompt básico se falhar
        return `YOU ARE A JSON RESPONSE BOT. YOU ONLY OUTPUT PURE JSON. NEVER PLAIN TEXT. NEVER MARKDOWN.

CRITICAL RULES:
1. EVERY RESPONSE MUST BE PURE JSON
2. NO MARKDOWN CODE BLOCKS
3. START WITH { and END WITH }
4. SEMPRE SE REFIRA AO JOGADOR NA SEGUNDA PESSOA (VOCÊ)!

RESPONSE STRUCTURE:
{
  "storyEvent": "Your narration here",
  "outcomes": ["Action 1", "Action 2", "Action 3"]
}`;
    }
}

/**
 * Limpa o cache do prompt (útil para desenvolvimento/testes)
 */
export function clearPromptCache() {
    narratorPromptCache = null;
    console.log('🔄 Prompt cache cleared');
}
