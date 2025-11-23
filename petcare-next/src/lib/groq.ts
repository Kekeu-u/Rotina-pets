// Groq API - API gratuita e muito rápida para LLMs
// Modelos disponíveis: llama-3.3-70b-versatile, llama-3.1-8b-instant, mixtral-8x7b-32768

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqOptions {
  model?: 'llama-3.3-70b-versatile' | 'llama-3.1-8b-instant' | 'mixtral-8x7b-32768';
  temperature?: number;
  maxTokens?: number;
}

/**
 * Verifica se a API do Groq está configurada
 */
export function isConfigured(): boolean {
  return !!process.env.GROQ_API_KEY;
}

/**
 * Gera texto usando a API do Groq
 */
export async function generateText(
  prompt: string,
  options: GroqOptions = {}
): Promise<string | null> {
  if (!isConfigured()) {
    console.log('Groq API not configured, falling back to Pollinations');
    return null;
  }

  const {
    model = 'llama-3.3-70b-versatile',
    temperature = 0.7,
    maxTokens = 1500,
  } = options;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Groq API error:', error);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('Groq generation error:', error);
    return null;
  }
}

/**
 * Gera texto com mensagens de sistema e usuário
 */
export async function generateChatCompletion(
  messages: GroqMessage[],
  options: GroqOptions = {}
): Promise<string | null> {
  if (!isConfigured()) {
    return null;
  }

  const {
    model = 'llama-3.3-70b-versatile',
    temperature = 0.7,
    maxTokens = 1500,
  } = options;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Groq API error:', error);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('Groq generation error:', error);
    return null;
  }
}

/**
 * Analisa dados do pet e gera um relatório detalhado
 */
export async function analyzePetData(data: {
  petName: string;
  petBreed: string;
  happiness: number;
  points: number;
  streak: number;
  completedTasks: string[];
  pendingTasks: string[];
  history: Array<{ name: string; pts: number; time: string; note?: string }>;
  notes: string;
  totalDaysTracked?: number;
  averageHappiness?: number;
  mostCompletedTask?: string;
  leastCompletedTask?: string;
}): Promise<{
  summary: string;
  insights: string[];
  recommendations: string[];
  healthScore: number;
  mood: string;
} | null> {
  if (!isConfigured()) {
    return null;
  }

  const systemPrompt = `Você é um assistente veterinário virtual especializado em análise comportamental de pets.
Sua função é analisar dados de rotina de cuidados e gerar insights valiosos para os tutores.
Sempre responda em português brasileiro de forma carinhosa mas profissional.
Forneça análises baseadas em dados, não em suposições.`;

  const userPrompt = `Analise os seguintes dados do pet e gere um relatório estruturado:

## Informações do Pet
- Nome: ${data.petName}
- Raça: ${data.petBreed}
- Nível de felicidade atual: ${data.happiness}%
- Pontos acumulados: ${data.points}
- Dias consecutivos de cuidado (streak): ${data.streak}

## Tarefas de Hoje
- Concluídas: ${data.completedTasks.length > 0 ? data.completedTasks.join(', ') : 'Nenhuma'}
- Pendentes: ${data.pendingTasks.length > 0 ? data.pendingTasks.join(', ') : 'Todas concluídas!'}

## Histórico de Atividades de Hoje
${data.history.length > 0 ? data.history.map(h => `- ${h.time}: ${h.name} (+${h.pts}pts)${h.note ? ` - Obs: ${h.note}` : ''}`).join('\n') : 'Nenhuma atividade registrada'}

## Anotações do Tutor
${data.notes || 'Nenhuma anotação'}

${data.averageHappiness !== undefined ? `## Estatísticas Históricas
- Média de felicidade: ${data.averageHappiness}%
- Total de dias acompanhados: ${data.totalDaysTracked || 0}
- Tarefa mais completada: ${data.mostCompletedTask || 'N/A'}
- Tarefa menos completada: ${data.leastCompletedTask || 'N/A'}` : ''}

Por favor, retorne sua análise no seguinte formato JSON:
{
  "summary": "Resumo geral do dia do pet em 2-3 frases",
  "insights": ["insight 1 baseado nos dados", "insight 2", "insight 3"],
  "recommendations": ["recomendação 1 específica", "recomendação 2", "recomendação 3"],
  "healthScore": 85,
  "mood": "emoji que representa o humor do pet"
}

Baseie o healthScore (0-100) na análise dos dados. Seja específico nas recomendações baseado na raça ${data.petBreed}.`;

  try {
    const response = await generateChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], {
      model: 'llama-3.3-70b-versatile',
      temperature: 0.6,
      maxTokens: 1000,
    });

    if (!response) return null;

    // Tentar extrair JSON da resposta
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        console.error('Failed to parse Groq response as JSON');
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error('Groq analysis error:', error);
    return null;
  }
}
