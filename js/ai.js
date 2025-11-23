/**
 * PetCare AI Module - Gemini Integration
 * Provides intelligent pet reactions, tips, and image generation (Nano Banana)
 */

const AI = {
    apiKey: null,
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    imageUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent',

    // Initialize with API key
    init(key) {
        this.apiKey = key;
        localStorage.setItem('petcare_gemini_key', key);
    },

    // Load saved API key
    load() {
        this.apiKey = localStorage.getItem('petcare_gemini_key');
        return !!this.apiKey;
    },

    // Check if configured
    isConfigured() {
        return !!this.apiKey;
    },

    // Clear API key
    clear() {
        this.apiKey = null;
        localStorage.removeItem('petcare_gemini_key');
    },

    // Make text API request
    async request(prompt) {
        if (!this.apiKey) {
            throw new Error('API key not configured');
        }

        try {
            const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.8,
                        maxOutputTokens: 150,
                    }
                })
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
        } catch (error) {
            console.error('AI Error:', error);
            return null;
        }
    },

    // Generate image with Nano Banana (Gemini 2.0 Flash Image)
    async generateImage(prompt) {
        if (!this.apiKey) {
            throw new Error('API key not configured');
        }

        console.log('🎨 Gerando imagem com Nano Banana...');
        console.log('📝 Prompt:', prompt);

        try {
            const response = await fetch(`${this.imageUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        responseModalities: ["TEXT", "IMAGE"]
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            console.log('🎨 Resposta recebida:', data);

            // Extract image from response
            const parts = data.candidates?.[0]?.content?.parts || [];
            for (const part of parts) {
                if (part.inlineData?.mimeType?.startsWith('image/')) {
                    const base64 = part.inlineData.data;
                    const mimeType = part.inlineData.mimeType;
                    return `data:${mimeType};base64,${base64}`;
                }
            }

            // If no image found, return null
            console.log('⚠️ Nenhuma imagem na resposta');
            return null;

        } catch (error) {
            console.error('🎨 Image Generation Error:', error);
            throw error;
        }
    },

    // Generate pet with product image
    async generatePetWithProduct(petName, petBreed, productName, productDescription) {
        const prompt = `Generate a cute, photorealistic image of a ${petBreed} dog named ${petName} happily playing with a ${productName} (${productDescription}). The dog should look happy and engaged with the toy. Bright, cheerful lighting. High quality pet photography style.`;

        return await this.generateImage(prompt);
    },

    // Generate pet reaction when completing a task
    async getPetReaction(petName, petBreed, petAge, taskName, happiness) {
        const prompt = `Você é um cachorro chamado ${petName}, da raça ${petBreed}, com ${petAge}.
Seu dono acabou de completar a tarefa: "${taskName}".
Seu nível de felicidade atual é ${happiness}%.

Responda em primeira pessoa como se fosse o cachorro, em 1-2 frases curtas e fofas, mostrando sua reação a essa ação do dono.
Use linguagem simples e carinhosa. Seja expressivo mas breve.
Não use hashtags. Responda apenas em português brasileiro.`;

        return await this.request(prompt);
    },

    // Generate daily tip based on pet profile
    async getDailyTip(petName, petBreed, petAge, personality) {
        const prompt = `Dê uma dica rápida e útil de cuidados para um cachorro com as seguintes características:
- Nome: ${petName}
- Raça: ${petBreed}
- Idade: ${petAge}
${personality ? `- Personalidade: ${personality}` : ''}

A dica deve ser específica para essa raça/idade.
Responda em 1-2 frases apenas, de forma direta e prática.
Responda apenas em português brasileiro.`;

        return await this.request(prompt);
    },

    // Generate end of day summary
    async getDaySummary(petName, completedTasks, totalTasks, happiness, activities) {
        const activityList = activities.slice(-5).map(a => a.name).join(', ');
        const prompt = `Faça um resumo carinhoso do dia do cachorro ${petName}:
- Tasks completadas: ${completedTasks}/${totalTasks}
- Felicidade: ${happiness}%
- Últimas atividades: ${activityList || 'nenhuma ainda'}

Escreva 2-3 frases como se fosse um narrador carinhoso contando como foi o dia do pet.
Seja positivo e encorajador. Responda apenas em português brasileiro.`;

        return await this.request(prompt);
    },

    // Generate motivational message
    async getMotivation(petName, streak, happiness) {
        const prompt = `Crie uma mensagem motivacional curta para o dono do cachorro ${petName}.
- Streak atual: ${streak} dias
- Felicidade do pet: ${happiness}%

Seja encorajador em 1 frase. Se o streak for alto, parabenize. Se a felicidade estiver baixa, incentive.
Responda apenas em português brasileiro.`;

        return await this.request(prompt);
    },

    // Generate pet thought based on context
    async getPetThought(petName, petBreed, happiness, hour, pendingTasks, completedTasks) {
        const timeOfDay = hour < 12 ? 'manhã' : hour < 18 ? 'tarde' : 'noite';
        const mood = happiness >= 70 ? 'muito feliz' : happiness >= 40 ? 'tranquilo' : 'carente';

        const prompt = `Você é ${petName}, um ${petBreed}. Gere UM pensamento curto (máximo 8 palavras) baseado no contexto:
- Hora: ${timeOfDay}
- Humor: ${mood} (${happiness}% felicidade)
- Tasks feitas: ${completedTasks}
- Tasks pendentes: ${pendingTasks}

Exemplos de formato:
- "Hora do passeio?"
- "Tô com fome..."
- "Amo meu dono!"
- "Bora brincar?"

Responda APENAS o pensamento, sem aspas, sem explicação.`;

        return await this.request(prompt);
    }
};

// Export for use
window.AI = AI;
