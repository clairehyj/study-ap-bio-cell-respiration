// Enhanced Study Guide with AI-powered topic recommendations
class StudyGuideAI {
    constructor() {
        this.aiService = null;
    }
    
    initializeAIService() {
        if (typeof AIService !== 'undefined') {
            this.aiService = new AIService();
        }
    }
    
    // Generate specific study topics based on wrong answers
    async generateStudyTopics(wrongAnswers) {
        const topics = new Map();
        
        for (const wrongAnswer of wrongAnswers) {
            const questionText = wrongAnswer.question;
            const explanation = wrongAnswer.explanation;
            
            // Extract key concepts from question and explanation
            const concepts = this.extractConceptsFromQuestion(questionText, explanation);
            
            concepts.forEach(concept => {
                if (!topics.has(concept)) {
                    topics.set(concept, []);
                }
                topics.get(concept).push(wrongAnswer);
            });
        }
        
        // If AI is available, get more specific recommendations
        if (this.aiService && this.aiService.isConfigured() && wrongAnswers.length > 0) {
            try {
                const aiTopics = await this.getAIStudyRecommendations(wrongAnswers);
                return aiTopics;
            } catch (error) {
                console.log('AI not available, using rule-based recommendations');
            }
        }
        
        return this.formatStudyRecommendations(topics);
    }
    
    // Extract concepts from question text
    extractConceptsFromQuestion(questionText, explanation) {
        const concepts = [];
        const text = (questionText + ' ' + explanation).toLowerCase();
        
        // Define concept mapping
        const conceptMap = {
            'Glycolysis': [
                'glycolysis', 'glucose', 'pyruvate molecules', 'phosphofructokinase',
                'pfk-1', 'hexokinase', 'phosphoglycerate', 'investment phase', 'payoff phase'
            ],
            'Pyruvate Oxidation': [
                'pyruvate oxidation', 'pyruvate dehydrogenase', 'acetyl-coa', 
                'transition reaction', 'pyruvate enters mitochondria'
            ],
            'Citric Acid Cycle': [
                'citric acid cycle', 'krebs cycle', 'tca cycle', 'isocitrate',
                'α-ketoglutarate', 'succinate', 'fumarate', 'malate', 'oxaloacetate',
                'citrate synthase', 'aconitase'
            ],
            'Electron Transport Chain': [
                'electron transport', 'etc', 'complex i', 'complex ii', 'complex iii',
                'complex iv', 'cytochrome', 'ubiquinone', 'coenzyme q', 'proton pump'
            ],
            'Oxidative Phosphorylation': [
                'oxidative phosphorylation', 'atp synthase', 'proton gradient',
                'chemiosmotic', 'proton-motive force', 'inner mitochondrial membrane'
            ],
            'ATP Production': [
                'atp', 'adenosine triphosphate', 'atp yield', 'atp molecules',
                'substrate-level phosphorylation', 'net atp'
            ],
            'Electron Carriers': [
                'nadh', 'fadh2', 'fadh₂', 'nad+', 'fad', 'electron carriers',
                'reducing power', 'oxidation-reduction'
            ],
            'Fermentation': [
                'fermentation', 'lactate', 'lactic acid', 'ethanol', 'alcoholic fermentation',
                'anaerobic', 'without oxygen'
            ],
            'Mitochondria': [
                'mitochondria', 'mitochondrial matrix', 'inner membrane', 'outer membrane',
                'intermembrane space', 'cristae'
            ],
            'Regulation': [
                'regulation', 'inhibit', 'activate', 'feedback', 'allosteric',
                'competitive inhibitor', 'phosphorylation', 'dephosphorylation'
            ],
            'Metabolic Pathways': [
                'β-oxidation', 'beta-oxidation', 'fatty acid', 'amino acid',
                'gluconeogenesis', 'glycogenolysis', 'lipid metabolism'
            ]
        };
        
        // Check which concepts are mentioned
        for (const [concept, keywords] of Object.entries(conceptMap)) {
            for (const keyword of keywords) {
                if (text.includes(keyword)) {
                    if (!concepts.includes(concept)) {
                        concepts.push(concept);
                    }
                    break;
                }
            }
        }
        
        // If no specific concepts found, add general category
        if (concepts.length === 0) {
            concepts.push('General Cellular Respiration');
        }
        
        return concepts;
    }
    
    // Get AI-powered study recommendations
    async getAIStudyRecommendations(wrongAnswers) {
        const prompt = `As an AP Biology tutor, analyze these incorrectly answered questions and provide specific study recommendations.

Questions the student got wrong:
${wrongAnswers.map((item, index) => `
${index + 1}. Question: ${item.question}
   Student's Answer: ${item.yourAnswer}
   Correct Answer: ${item.correctAnswer}
   Explanation: ${item.explanation}
`).join('\n')}

Based on these wrong answers, provide:
1. A list of SPECIFIC topics the student should review (be precise - don't just say "cellular respiration")
2. Key concepts they seem to be struggling with
3. The order in which they should study these topics (from foundational to advanced)

Format your response as a structured list of topics with brief explanations of what to focus on for each topic.`;
        
        try {
            const response = await this.aiService.makeAPICall([
                { 
                    role: 'system', 
                    content: 'You are an AP Biology expert helping students identify exactly what topics they need to review based on their incorrect answers. Be specific and precise in your recommendations.'
                },
                { role: 'user', content: prompt }
            ]);
            
            return this.parseAIResponse(response, wrongAnswers);
        } catch (error) {
            console.error('Error getting AI recommendations:', error);
            throw error;
        }
    }
    
    // Parse AI response into structured format
    parseAIResponse(aiResponse, wrongAnswers) {
        return {
            aiGenerated: true,
            recommendations: aiResponse,
            questionCount: wrongAnswers.length,
            questions: wrongAnswers
        };
    }
    
    // Format study recommendations for display
    formatStudyRecommendations(topicsMap) {
        const recommendations = [];
        
        for (const [topic, questions] of topicsMap) {
            recommendations.push({
                topic: topic,
                questions: questions,
                studyPoints: this.getStudyPointsForTopic(topic)
            });
        }
        
        return {
            aiGenerated: false,
            recommendations: recommendations
        };
    }
    
    // Get specific study points for each topic
    getStudyPointsForTopic(topic) {
        const studyPoints = {
            'Glycolysis': [
                'Review the 10 steps of glycolysis',
                'Understand energy investment vs. payoff phases',
                'Know which steps produce ATP and NADH',
                'Study regulation by PFK-1'
            ],
            'Pyruvate Oxidation': [
                'Review how pyruvate enters the mitochondria',
                'Understand the pyruvate dehydrogenase complex',
                'Know the products: Acetyl-CoA, CO₂, and NADH'
            ],
            'Citric Acid Cycle': [
                'Memorize the 8 steps and their products',
                'Understand which steps produce NADH, FADH₂, and GTP/ATP',
                'Review regulation points (isocitrate and α-ketoglutarate dehydrogenases)'
            ],
            'Electron Transport Chain': [
                'Review the four complexes and their functions',
                'Understand how NADH and FADH₂ donate electrons differently',
                'Know how the proton gradient is established'
            ],
            'Oxidative Phosphorylation': [
                'Understand chemiosmotic coupling',
                'Review how ATP synthase works',
                'Know why actual ATP yield varies (30-32 ATP per glucose)'
            ],
            'ATP Production': [
                'Review substrate-level vs. oxidative phosphorylation',
                'Understand ATP yield from each stage',
                'Know the difference between theoretical and actual yields'
            ],
            'Electron Carriers': [
                'Understand the role of NAD+ and FAD',
                'Review how they are reduced and oxidized',
                'Know why NADH yields more ATP than FADH₂'
            ],
            'Fermentation': [
                'Compare lactic acid vs. alcoholic fermentation',
                'Understand why fermentation regenerates NAD+',
                'Know when and why cells use fermentation'
            ],
            'Mitochondria': [
                'Review mitochondrial structure and compartments',
                'Understand what happens in each compartment',
                'Know transport mechanisms across membranes'
            ],
            'Regulation': [
                'Review feedback inhibition',
                'Understand allosteric regulation',
                'Know key regulatory enzymes and their effectors'
            ],
            'Metabolic Pathways': [
                'Review how fats and proteins enter cellular respiration',
                'Understand the Cori cycle',
                'Know anaplerotic reactions'
            ],
            'General Cellular Respiration': [
                'Review the overall equation and purpose',
                'Understand the relationship between all stages',
                'Practice calculating ATP yields'
            ]
        };
        
        return studyPoints[topic] || ['Review this topic in your textbook', 'Watch related Khan Academy videos'];
    }
}

// Export for use
window.StudyGuideAI = StudyGuideAI;