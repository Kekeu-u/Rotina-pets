import { NextRequest, NextResponse } from 'next/server';
import { generateText, isConfigured } from '@/lib/pollinations';

export async function POST(request: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json({ error: 'API not configured' }, { status: 503 });
  }

  try {
    const {
      petName,
      petBreed,
      happiness,
      completedTasks,
      pendingTasks,
      streak,
      points,
      notes
    } = await request.json();

    const completedList = completedTasks?.length > 0
      ? completedTasks.join(', ')
      : 'Nenhuma tarefa concluída ainda';

    const pendingList = pendingTasks?.length > 0
      ? pendingTasks.join(', ')
      : 'Todas as tarefas foram concluídas!';

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
Tarefas pendentes: ${pendingList}${notesSection}

Faça uma análise breve e carinhosa do dia do pet em 3-4 parágrafos curtos:
1. Como foi o dia do ${petName} baseado nas tarefas realizadas
2. Observações sobre a rotina e bem-estar
3. Uma dica ou sugestão para o tutor

Use linguagem amigável e empática. Seja específico sobre as tarefas mencionadas.
Responda apenas em português brasileiro. Não use emojis excessivos.`;

    const response = await generateText(prompt);

    return NextResponse.json({ report: response });
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Falha ao gerar relatório' },
      { status: 500 }
    );
  }
}
