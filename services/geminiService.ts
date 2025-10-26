import { GoogleGenerativeAI, ModelParams } from '@google/generative-ai';
import { GroundingChunk } from '../types';

// FIX: Initialize the GoogleGenAI client.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenerativeAI(API_KEY);

/**
 * Generates a Japanese lesson for a given word using Gemini.
 * It also provides image prompts and web sources for grounding.
 */
export const generateLesson = async (word: string): Promise<{ lesson: string; prompts: string[]; sources: GroundingChunk[] }> => {
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `
    Tu rol es "Nihongo Sensei AI". Tu misión es crear una lección educativa y visualmente estructurada sobre la palabra japonesa: "${word}".

    REGLAS CRÍTICAS:
    1.  **SIN SALUDOS:** NO incluyas NINGÚN saludo o introducción. Ve directamente al grano, empezando la lección con la sección "### Palabra a estudiar:".
    2.  **IDIOMA:** La lección debe ser COMPLETAMENTE EN ESPAÑOL.
    3.  **FORMATO DE EJEMPLOS ESTRICTO:** En la sección de ejemplos, CADA ejemplo DEBE consistir en TRES items de lista de Markdown consecutivos y separados (Japonés, Romaji, Traducción). DEBE haber una línea en blanco entre cada grupo de tres. NO uses etiquetas.

    ### Estructura de la Lección (Usa Markdown Enriquecido):
    Usa el siguiente formato EXACTO para la lección, con títulos, separadores, negritas y citas.

    ---

    ### Palabra a estudiar:
    **[PALABRA_JAPONESA]** (escribe la palabra en romaji, hiragana/kanji si aplica, y traducción).

    ---

    ### Significado y Contextos de Uso:
    Explica el significado principal. Describe 2-3 contextos de uso. Usa **negritas** para resaltar la palabra.
    > **¡Dato Curioso!** Incluye una anécdota cultural/histórica interesante.

    ---

    ### Ejemplos Simples para Practicar:
    Proporciona 3 frases de ejemplo con el formato estricto de tres líneas de lista separadas y una línea en blanco entre cada ejemplo.
    *   [Frase 1 en Japonés]
    *   [Frase 1 en Romaji]
    *   [Frase 1 en Español]

    *   [Frase 2 en Japonés]
    *   [Frase 2 en Romaji]
    *   [Frase 2 en Español]

    *   [Frase 3 en Japonés]
    *   [Frase 3 en Romaji]
    *   [Frase 3 en Español]

    ---

    ### Desglose de Kanjis:
    Si la palabra tiene kanjis, explícalos uno por uno. Para cada kanji:
    *   **Kanji 1: [carácter]** ([lectura])
    *   **Significado:** [significado del kanji]
    *   **Otras palabras con [carácter]:** [2-3 ejemplos de otras palabras con el mismo kanji, con su lectura y significado breve]

    ---
    
    ### Formato de Salida Obligatorio para Prompts:
    **MUY IMPORTANTE**: Después de TODA la lección, añade la sección de prompts. DEBE empezar con la línea exacta '--- PROMPTS ---'. Después de esa línea, lista los 3 prompts, cada uno en una línea nueva, comenzando con 'PROMPT:'.
    Los prompts deben ser en INGLÉS. CADA prompt debe instruir que se muestre visiblemente la palabra en Kanji, su Hiragana y su traducción al español.

    **Tipos de Prompts:**
    1.  **Contexto Real:** Basado en la PRIMERA frase de ejemplo, mostrando la acción.
    2.  **Desglose de Kanjis:** Una infografía o mapa mental educativo. Las etiquetas deben estar en español (ej. "Componentes").
    3.  **Contexto Real 2:** Basado en la SEGUNDA frase de ejemplo, mostrando una situación diferente.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const textResponse = response.text();
    
    const separator = '--- PROMPTS ---';
    const parts = textResponse.split(separator);

    if (parts.length < 2) {
        throw new Error('No se pudo encontrar el separador de prompts en la respuesta de la IA. Respuesta: ' + textResponse);
    }

const lesson = parts[0].trim();
const promptsText = parts[1].trim();

// 1. Separamos el texto de los prompts en un array
const promptsArray = promptsText.split('\n');

// 2. Limpiamos cada línea del array
const cleanedPrompts = promptsArray
    .map(line => line.replace(/^PROMPT:\s*/, '').trim())
    .filter(line => line.length > 0);

const sources: GroundingChunk[] = [];

// 3. Devolvemos todo junto y corregido
return { lesson, prompts: cleanedPrompts, sources };
