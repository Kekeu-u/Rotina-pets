import { NextRequest, NextResponse } from 'next/server';
import { generateText as generateTextPollinations, isConfigured as isPollinationsConfigured } from '@/lib/pollinations';
import { analyzePetData, generateText as generateTextGroq, isConfigured as isGroqConfigured } from '@/lib/groq';

export interface ReportRequest {
  petName: string;
  petBreed: string;
  happiness: number;
  completedTasks: string[];
  pendingTasks: string[];
  streak: number;
  points: number;
  notes: string;
  history?: Array<{ name: string; pts: number; time: string; note?: string }>;
  // Dados históricos opcionais para análise mais profunda
  historicalData?: {
    totalDaysTracked: number;
    averageHappiness: number;
    mostCompletedTask: string;
    leastCompletedTask: string;
  };
}

export interface ReportResponse {
  report: string;
  analysis?: {
    summary: string;
    insights: string[];
    recommendations: string[];
    healthScore: number;
    mood: string;
  };
  provider: 'groq' | 'pollinations';
}

export async function POST(request: NextRequest) {
  try {
    const data: ReportRequest = await request.json();
    const {
      petName,
      petBreed,
      happiness,
      completedTasks,
      pendingTasks,
      streak,
      points,
      notes,
      history = [],
      historicalData,
    } = data;

    // Tentar usar Groq primeiro (mais rápido e inteligente)
    if (isGroqConfigured()) {
      console.log('Using Groq API for report generation');

      const analysis = await analyzePetData({
        petName,
        petBreed,
        happiness,
        points,
        streak,
        completedTasks,
        pendingTasks,
        history,
        notes,
        totalDaysTracked: historicalData?.totalDaysTracked,
        averageHappiness: historicalData?.averageHappiness,
        mostCompletedTask: historicalData?.mostCompletedTask,
        leastCompletedTask: historicalData?.leastCompletedTask,
      });

      if (analysis) {
        // Construir relatório formatado a partir da análise estruturada
        const report = buildFormattedReport(analysis, petName);

        return NextResponse.json({
          report,
          analysis,
          provider: 'groq',
        } as ReportResponse);
      }

      console.log('Groq analysis failed, falling back to text generation');

      // Fallback: usar geração de texto simples do Groq
      const groqTextReport = await generateGroqTextReport(data);
      if (groqTextReport) {
        return NextResponse.json({
          report: groqTextReport,
          provider: 'groq',
        } as ReportResponse);
      }
    }

    // Fallback para Pollinations (sempre disponível)
    if (!isPollinationsConfigured()) {
      return NextResponse.json({ error: 'Nenhuma API de IA configurada' }, { status: 503 });
    }

    console.log('Using Pollinations API for report generation');
    const pollinationsReport = await generatePollinationsReport(data);

    return NextResponse.json({
      report: pollinationsReport,
      provider: 'pollinations',
    } as ReportResponse);

  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Falha ao gerar relatório' },
      { status: 500 }
    );
  }
}

function buildFormattedReport(
  analysis: {
    summary: string;
    insights: string[];
    recommendations: string[];
    healthScore: number;
    mood: string;
  },
  petName: string
): string {
  const sections = [];

  // Resumo
  sections.push(analysis.summary);

  // Insights
  if (analysis.insights.length > 0) {
    sections.push(`\n📊 Insights:\n${analysis.insights.map(i => `• ${i}`).join('\n')}`);
  }

  // Recomendações
  if (analysis.recommendations.length > 0) {
    sections.push(`\n💡 Recomendações:\n${analysis.recommendations.map(r => `• ${r}`).join('\n')}`);
  }

  // Score de saúde
  const healthEmoji = analysis.healthScore >= 80 ? '🌟' : analysis.healthScore >= 60 ? '👍' : analysis.healthScore >= 40 ? '⚠️' : '❗';
  sections.push(`\n${healthEmoji} Pontuação de bem-estar: ${analysis.healthScore}/100`);

  return sections.join('\n');
}

async function generateGroqTextReport(data: ReportRequest): Promise<string | null> {
  const {
    petName,
    petBreed,
    happiness,
    completedTasks,
    pendingTasks,
    streak,
    points,
    notes,
    history = [],
  } = data;

  const completedList = completedTasks?.length > 0
    ? completedTasks.join(', ')
    : 'Nenhuma tarefa concluída ainda';

  const pendingList = pendingTasks?.length > 0
    ? pendingTasks.join(', ')
    : 'Todas as tarefas foram concluídas!';

  const historySection = history.length > 0
    ? `\nHistórico de atividades:\n${history.map(h => `- ${h.time}: ${h.name} (+${h.pts}pts)${h.note ? ` - ${h.note}` : ''}`).join('\n')}`
    : '';

  const notesSection = notes
    ? `\nAnotações do tutor: ${notes}`
    : '';

  const prompt = `Você é um assistente veterinário virtual carinhoso analisando o dia de um pet.

Informações do pet:
- Nome: ${petName}
- Raça: ${petBreed}
- Nível de felicidade: ${happiness}%
- Pontos acumulados: ${points}
- Dias consecutivos de cuidado: ${streak}

Tarefas concluídas hoje: ${completedList}
Tarefas pendentes: ${pendingList}${historySection}${notesSection}

Gere uma análise completa e carinhosa do dia do ${petName} em português brasileiro.
Inclua:
1. Como foi o dia baseado nas tarefas e atividades
2. 2-3 insights específicos sobre a rotina e bem-estar
3. 2-3 recomendações práticas para o tutor, considerando que ${petName} é um(a) ${petBreed}
4. Uma pontuação geral de bem-estar (0-100)

Seja específico e baseie suas análises nos dados fornecidos. Use formatação clara com seções.`;

  return generateTextGroq(prompt, {
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    maxTokens: 1200,
  });
}

async function generatePollinationsReport(data: ReportRequest): Promise<string> {
  const {
    petName,
    petBreed,
    happiness,
    completedTasks,
    pendingTasks,
    streak,
    points,
    notes,
    history = [],
  } = data;

  const completedList = completedTasks?.length > 0
    ? completedTasks.join(', ')
    : 'Nenhuma tarefa concluída ainda';

  const pendingList = pendingTasks?.length > 0
    ? pendingTasks.join(', ')
    : 'Todas as tarefas foram concluídas!';

  const historySection = history.length > 0
    ? `\nHistórico de atividades hoje:\n${history.slice(-5).map(h => `- ${h.time}: ${h.name}`).join('\n')}`
    : '';

  const notesSection = notes
    ? `\nAnotações do tutor: ${notes}`
    : '';

  const prompt = `Você é um assistente veterinário virtual analisando o dia de um pet.

Informações do pet:
- Nome: ${petName}
- Raça: ${petBreed}
- Nível de felicidade: ${happiness}%
- Pontos acumulados: ${points}
- Dias consecutivos de cuidado: ${streak}

Tarefas concluídas hoje: ${completedList}
Tarefas pendentes: ${pendingList}${historySection}${notesSection}

Faça uma análise breve e carinhosa do dia do pet em 3-4 parágrafos curtos:
1. Como foi o dia do ${petName} baseado nas tarefas realizadas
2. Observações sobre a rotina e bem-estar
3. Uma dica ou sugestão para o tutor baseada na raça ${petBreed}

Use linguagem amigável e empática. Seja específico sobre as tarefas mencionadas.
Responda apenas em português brasileiro. Não use emojis excessivos.`;

  const response = await generateTextPollinations(prompt);
  return response || 'Não foi possível gerar o relatório. Tente novamente mais tarde.';
}
