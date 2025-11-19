// OpenAI Service for AI-powered explanations
class AIService {
    constructor() {
        this.apiKey = localStorage.getItem('openai_api_key');
        this.isEnabled = localStorage.getItem('enable_ai') !== 'false';
        this.baseURL = 'https://api.openai.com/v1';
        this.model = 'gpt-4o-mini'; // Using GPT-4o-mini for cost efficiency
        this.conversationHistory = [];
    }
    
    updateApiKey() {
        this.apiKey = localStorage.getItem('openai_api_key');
    }
    
    isConfigured() {
        return this.apiKey && this.apiKey.trim().length > 0 && this.isEnabled;
    }
    
    async getExplanation(question, options, correctAnswer, explanation, userAnswer = null) {
        if (!this.isConfigured()) {
            throw new Error('AI service not configured. Please add your OpenAI API key in settings.');
        }
        
        const prompt = this.buildExplanationPrompt(question, options, correctAnswer, explanation, userAnswer);
        
        try {
            const response = await this.makeAPICall([
                { role: 'system', content: this.getSystemPrompt() },
                { role: 'user', content: prompt }
            ]);
            
            return response;
        } catch (error) {
            console.error('Error getting AI explanation:', error);
            throw error;
        }
    }
    
    async askFollowUpQuestion(question, context) {
        if (!this.isConfigured()) {
            throw new Error('AI service not configured. Please add your OpenAI API key in settings.');
        }
        
        // Add context if this is the first follow-up
        if (this.conversationHistory.length === 0 && context) {
            this.conversationHistory.push({
                role: 'system',
                content: this.getSystemPrompt()
            });
            this.conversationHistory.push({
                role: 'assistant',
                content: `Let me help you understand this question about cellular respiration:\n\n**Question:** ${context.question}\n**Correct Answer:** ${context.correctAnswer}\n**Explanation:** ${context.explanation}`
            });
        }
        
        this.conversationHistory.push({ role: 'user', content: question });
        
        try {
            const response = await this.makeAPICall(this.conversationHistory);
            this.conversationHistory.push({ role: 'assistant', content: response });
            
            // Keep conversation history manageable (last 10 exchanges)
            if (this.conversationHistory.length > 20) {
                this.conversationHistory = [
                    this.conversationHistory[0], // Keep system prompt
                    ...this.conversationHistory.slice(-19)
                ];
            }
            
            return response;
        } catch (error) {
            console.error('Error asking follow-up question:', error);
            throw error;
        }
    }
    
    clearConversationHistory() {
        this.conversationHistory = [];
    }
    
    getSystemPrompt() {
        // Randomly select a TXT member to be the tutor for this session
        const members = ['Soobin', 'Yeonjun', 'Beomgyu', 'Taehyun', 'Hueningkai'];
        const selectedMember = members[Math.floor(Math.random() * members.length)];
        this.currentTutor = selectedMember;
        
        const memberPersonalities = {
            'Soobin': 'You are Soobin from TXT! You\'re the caring leader who is patient, encouraging, and always supportive. You use Korean phrases occasionally like "화이팅!" and "대박!"',
            'Yeonjun': 'You are Yeonjun from TXT! You\'re confident and charismatic, making learning fun and exciting. You say things like "That\'s my smart MOA!" and use fire emojis 🔥',
            'Beomgyu': 'You are Beomgyu from TXT! You\'re playful and energetic, using lots of excitement and encouragement. You love using bear emojis 🐻 and rainbow emojis 🌈',
            'Taehyun': 'You are Taehyun from TXT! You\'re the intelligent one who explains things clearly and logically. You\'re studious and use book emojis 📚 and lightbulb emojis 💡',
            'Hueningkai': 'You are Hueningkai from TXT! You\'re sweet and encouraging, using lots of hearts 💖 and unicorn emojis 🦄. You\'re always positive and supportive!'
        };
        
        return `You are ${selectedMember} from the K-pop group TOMORROW X TOGETHER (TXT), helping your fan Claire study for her AP Biology test on cellular respiration!

${memberPersonalities[selectedMember]}

Important context:
- Claire is a high school student and a MOA (TXT fan) who asked YOU specifically for help
- Address her as Claire and be personal in your responses
- Stay in character as ${selectedMember} throughout the conversation
- You're helping her because she's studying with her friends Lilly, Anya, and Sophia

Your teaching style as ${selectedMember}:
- Be encouraging and supportive in your unique personality style
- Use simple language that a high school student can understand
- Break down complex concepts into simpler parts
- Use analogies that relate to music, performance, or everyday life
- Include your signature phrases and emojis based on your personality
- Make learning fun and engaging!

When explaining answers:
- Start with "Claire!" or "Hey Claire!" to make it personal
- First acknowledge if she got it right or wrong with your personality style
- Explain WHY the correct answer is right in a way that's easy to remember
- If she got it wrong, be extra encouraging and help her understand
- End with encouragement using your character's style
- Use Korean phrases if you're Soobin or occasionally as other members

Remember: You're not just a tutor, you're ${selectedMember} from TXT helping your fan Claire succeed! Keep it authentic to your K-pop idol personality while being educational.`;
    }
    
    buildExplanationPrompt(question, options, correctAnswer, explanation, userAnswer) {
        let prompt = `A student is working on this AP Biology question about cellular respiration:\n\n`;
        prompt += `**Question:** ${question}\n\n`;
        prompt += `**Options:**\n`;
        prompt += `A) ${options.A}\n`;
        prompt += `B) ${options.B}\n`;
        prompt += `C) ${options.C}\n`;
        prompt += `D) ${options.D}\n\n`;
        prompt += `**Correct Answer:** ${correctAnswer}\n`;
        prompt += `**Basic Explanation:** ${explanation}\n\n`;
        
        if (userAnswer) {
            if (userAnswer === correctAnswer) {
                prompt += `The student correctly chose answer ${userAnswer}! Please:\n`;
                prompt += `1. Congratulate them\n`;
                prompt += `2. Reinforce why this answer is correct\n`;
                prompt += `3. Add an interesting fact or deeper insight about this concept\n`;
                prompt += `4. Suggest what related concept they might want to review next`;
            } else {
                prompt += `The student chose answer ${userAnswer}, but the correct answer is ${correctAnswer}. Please:\n`;
                prompt += `1. Be encouraging and supportive\n`;
                prompt += `2. Explain why their answer seemed reasonable but isn't quite right\n`;
                prompt += `3. Clearly explain why the correct answer is right\n`;
                prompt += `4. Provide a helpful tip or memory trick to remember this concept`;
            }
        } else {
            prompt += `Please provide a detailed explanation that:\n`;
            prompt += `1. Breaks down why the correct answer is right\n`;
            prompt += `2. Explains why each incorrect option is wrong\n`;
            prompt += `3. Provides helpful context or analogies\n`;
            prompt += `4. Gives study tips for remembering this concept`;
        }
        
        return prompt;
    }
    
    async makeAPICall(messages, temperature = 0.7) {
        const response = await fetch(`${this.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.model,
                messages: messages,
                temperature: temperature,
                max_tokens: 500,
                presence_penalty: 0.1,
                frequency_penalty: 0.1
            })
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || 'API call failed');
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    async getChatResponse(userMessage, questionText, options, correctAnswer, explanation) {
        if (!this.apiKey) {
            throw new Error('OpenAI API key not configured');
        }

        try {
            const systemPrompt = this.getSystemPrompt();
            const userPrompt = `
Context: Claire is asking about this AP Biology question:
Question: ${questionText}
Options: A) ${options.A}, B) ${options.B}, C) ${options.C}, D) ${options.D}
Correct Answer: ${correctAnswer}
Explanation: ${explanation}

Claire's question: "${userMessage}"

Please respond as the TXT member helping Claire understand this concept. Be encouraging, educational, and maintain your K-pop idol personality!`;

            const messages = [
                { role: 'system', content: systemPrompt },
                ...this.conversationHistory,
                { role: 'user', content: userPrompt }
            ];
            
            const aiResponse = await this.makeAPICall(messages, 0.8);

            // Update conversation history
            this.conversationHistory.push(
                { role: 'user', content: userMessage },
                { role: 'assistant', content: aiResponse }
            );

            // Keep conversation history limited
            if (this.conversationHistory.length > 10) {
                this.conversationHistory = this.conversationHistory.slice(-10);
            }

            return aiResponse;
        } catch (error) {
            console.error('OpenAI API Error:', error);
            throw error;
        }
    }
}

// Export for use in main script
window.AIService = AIService;