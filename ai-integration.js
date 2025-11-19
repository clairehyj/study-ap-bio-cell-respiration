// AI Integration for Quiz App
// This file extends the QuizApp with AI functionality

// Add AI methods to QuizApp prototype
if (typeof QuizApp !== 'undefined') {
    
    // Check AI availability and show ask button if configured
    QuizApp.prototype.checkAIAvailability = function() {
        if (this.aiService && this.aiService.isConfigured()) {
            const askBtn = document.getElementById('askTXTBtn');
            if (askBtn && window.app && window.app.currentQuestionIndex >= 0 && window.app.questions.length > 0) {
                askBtn.classList.remove('hidden');
                // Update button with current TXT member name
                const currentMemberIndex = window.app ? window.app.currentMemberIndex : 0;
                const currentMember = txtMembers[currentMemberIndex % txtMembers.length];
                askBtn.innerHTML = `💡 Ask ${currentMember.name}`;
            }
        }
    };
    
    // Ask TXT member for explanation about current question
    QuizApp.prototype.askTXTForHelp = async function() {
        // Use the global app instance
        const currentQuestion = window.app ? window.app.availableQuestions[window.app.currentQuestionIndex] : null;
        if (!currentQuestion) {
            console.log('No current question available');
            return;
        }
        
        // Check if AI service is configured
        this.aiService.updateApiKey();
        if (!this.aiService.isConfigured()) {
            // Get current TXT member
            const currentMemberIndex = window.app ? window.app.currentMemberIndex : 0;
            const currentMember = txtMembers[currentMemberIndex % txtMembers.length];
            
            // Show clear message about needing API key
            this.addClaireMessage(`${currentMember.name}, can you help me understand this question?`);
            
            this.addTXTMessage(
                `⚠️ I'd love to help, but I need an OpenAI API key to generate explanations!
                
                <div style="background: rgba(74, 158, 255, 0.1); padding: 15px; border-radius: 10px; margin: 10px 0;">
                    <strong>To enable AI tutoring:</strong>
                    <ol style="margin: 10px 0;">
                        <li>Click the <a href="settings.html" target="_blank" style="color: #4A9EFF; font-weight: bold;">Settings ⚙️</a> link</li>
                        <li>Add your OpenAI API key</li>
                        <li>Save it</li>
                        <li>Come back and ask me anything!</li>
                    </ol>
                </div>
                
                <a href="settings.html" target="_blank" style="display: inline-block; background: #4A9EFF; color: white; padding: 10px 20px; border-radius: 20px; text-decoration: none; margin-top: 10px;">
                    Go to Settings →
                </a>`,
                currentMember
            );
            return;
        }
        
        // Get current TXT member
        const currentMemberIndex = window.app ? window.app.currentMemberIndex : 0;
        const currentMember = txtMembers[currentMemberIndex % txtMembers.length];
        
        // Show AI modal
        this.showAIModal();
        
        // Build initial question for help
        const helpMessage = `Can you explain this question to me and help me understand the concepts?`;
        
        // Add the question to modal
        this.addModalMessage(helpMessage, 'user');
        
        // Show loading in modal
        const loadingId = 'modal-loading-' + Date.now();
        this.addModalMessage('Let me think about this...', 'assistant', loadingId);
        
        try {
            // Convert question format for AI service
            const options = {
                A: currentQuestion.options ? currentQuestion.options[0].text : currentQuestion['Option A'],
                B: currentQuestion.options ? currentQuestion.options[1].text : currentQuestion['Option B'],
                C: currentQuestion.options ? currentQuestion.options[2].text : currentQuestion['Option C'],
                D: currentQuestion.options ? currentQuestion.options[3].text : currentQuestion['Option D']
            };
            
            const questionText = currentQuestion.question || currentQuestion.Question;
            const correctAnswer = currentQuestion.answer || currentQuestion['Correct Answer'];
            const explanation = currentQuestion.explanation || currentQuestion.Explanation;
            
            const response = await this.aiService.getExplanation(
                questionText,
                options,
                correctAnswer,
                explanation,
                window.app ? window.app.selectedAnswer : null
            );
            
            // Remove loading message
            const loadingElement = document.getElementById(loadingId);
            if (loadingElement) {
                loadingElement.remove();
            }
            
            // Add AI response to modal
            this.addModalMessage(response, 'assistant');
            
            // Add a brief message in the chat
            this.addClaireMessage(`${currentMember.name}, can you help me understand this question?`);
            this.addTXTMessage(
                `I've opened a detailed explanation in the popup window! Check it out and feel free to ask me more questions there. 💬`,
                currentMember
            );
            
        } catch (error) {
            console.error('AI Error:', error);
            const loadingElement = document.getElementById(loadingId);
            if (loadingElement) {
                loadingElement.remove();
            }
            
            // Show error in modal
            this.addModalMessage(
                `⚠️ There was an error with the AI service. 
                
                Error: ${error.message}
                
                Please check your API key in Settings.`,
                'assistant'
            );
        }
    };
    
    
    // Format AI response with HTML
    QuizApp.prototype.formatAIResponse = function(response) {
        return response
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>');
    };
    
    
    // Add Claire's message to chat
    QuizApp.prototype.addClaireMessage = function(message) {
        const chatContainer = document.getElementById('chatContainer');
        if (!chatContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message claire-message';
        messageDiv.innerHTML = `
            <img src="images/claire-avatar.jpg" alt="Claire" class="member-avatar" onerror="this.src='images/default-avatar.jpg'">
            <div class="message-content">
                <span class="member-name">Claire</span>
                <div class="message-bubble">
                    <p>${message}</p>
                </div>
            </div>
        `;
        
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    };
    
    // Add TXT member's message to chat
    QuizApp.prototype.addTXTMessage = function(message, member, id = null) {
        const chatContainer = document.getElementById('chatContainer');
        if (!chatContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message txt-message';
        if (id) messageDiv.id = id;
        
        // Format the message HTML if it contains markdown
        const formattedMessage = this.formatAIResponse ? this.formatAIResponse(message) : message;
        
        messageDiv.innerHTML = `
            <img src="${member.image}" alt="${member.name}" class="member-avatar">
            <div class="message-content">
                <span class="member-name">${member.name}</span>
                <div class="message-bubble">
                    ${formattedMessage}
                </div>
            </div>
        `;
        
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    };
    
    // Show error in chat
    QuizApp.prototype.showAIErrorInChat = function(message) {
        const currentMemberIndex = window.app ? window.app.currentMemberIndex : 0;
        const currentMember = txtMembers[currentMemberIndex % txtMembers.length];
        this.addTXTMessage(`⚠️ Sorry Claire, ${message} <a href="settings.html" target="_blank">Go to Settings →</a>`, currentMember);
    };
    
    // Handle chat input submission
    QuizApp.prototype.sendChatMessage = async function() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Clear input
        chatInput.value = '';
        
        // Add Claire's message
        this.addClaireMessage(message);
        
        // Get current TXT member  
        const currentMemberIndex = window.app ? window.app.currentMemberIndex : 0;
        const currentMember = txtMembers[currentMemberIndex % txtMembers.length];
        
        // Check if we have a current question
        if (!window.app || !window.app.availableQuestions || window.app.currentQuestionIndex >= window.app.availableQuestions.length) {
            this.addTXTMessage("Let's start the quiz first! Click the Start Quiz button to begin! 📚", currentMember);
            return;
        }
        
        const currentQuestion = window.app.availableQuestions[window.app.currentQuestionIndex];
        
        // Check if AI service is configured for real AI responses
        this.aiService.updateApiKey();
        if (!this.aiService.isConfigured()) {
            // Show message about needing API key for AI responses
            this.addTXTMessage(
                `📚 To get AI-powered help, you'll need to add your OpenAI API key!
                
                <div style="margin: 10px 0;">
                    <a href="settings.html" target="_blank" style="color: #4A9EFF; font-weight: bold;">
                        Click here to add your API key in Settings →
                    </a>
                </div>
                
                In the meantime, here's the textbook explanation: 
                <div style="background: rgba(160, 132, 220, 0.1); padding: 10px; border-radius: 8px; margin-top: 10px;">
                    ${currentQuestion.explanation || 'This question tests your understanding of cellular respiration.'}
                </div>`,
                currentMember
            );
            
            // Still try to provide basic help
            this.provideHelpfulResponse(message, currentQuestion, currentMember);
        } else {
            // AI is configured - use it for real responses
            await this.sendChatMessageWithAI(message, currentQuestion, currentMember);
        }
    };
    
    // Provide helpful study tips without requiring AI
    QuizApp.prototype.provideHelpfulResponse = function(userMessage, question, member) {
        const topic = question.topic || 'General Cellular Respiration';
        const difficulty = question.difficulty || 'Medium';
        
        // Check what the user is asking about
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('hint') || lowerMessage.includes('help')) {
            this.provideHint(question, member);
        } else if (lowerMessage.includes('explain') || lowerMessage.includes('why')) {
            this.provideExplanation(question, member);
        } else if (lowerMessage.includes('confus') || lowerMessage.includes("don't understand")) {
            this.provideSimplification(question, member);
        } else {
            // Default helpful response
            this.provideTopicTips(topic, member);
        }
    };
    
    QuizApp.prototype.provideHint = function(question, member) {
        const correctAnswer = question.answer;
        const hints = {
            'A': "Think about the first option - it's often about the initial stages!",
            'B': "Consider the second option - it might be the balanced choice!",
            'C': "Look at option C - sometimes it's about cycles!",
            'D': "Check option D - it could be the most complete process!"
        };
        
        this.addTXTMessage(
            `Here's a hint: ${hints[correctAnswer]} Also remember, this question is about ${question.topic || 'cellular respiration'}! 💡`,
            member
        );
    };
    
    QuizApp.prototype.provideExplanation = function(question, member) {
        if (question.explanation) {
            this.addTXTMessage(
                `Let me explain: ${question.explanation} 📚`,
                member
            );
        } else {
            this.provideTopicTips(question.topic || 'General Cellular Respiration', member);
        }
    };
    
    QuizApp.prototype.provideSimplification = function(question, member) {
        const topic = question.topic || 'General Cellular Respiration';
        const simpleExplanations = {
            'Glycolysis': "Glycolysis is like breaking a glucose cookie into 2 smaller pieces (pyruvate), and you get 2 ATP energy coins! It happens in the cell's cytoplasm.",
            'Citric acid cycle': "The Krebs cycle is like a circular factory that takes fuel (acetyl-CoA) and produces energy carriers (NADH, FADH₂) plus some ATP!",
            'ETC': "The electron transport chain is like a water slide for electrons - as they slide down, they pump protons that power ATP production!",
            'Oxidative phosphorylation': "This is the main ATP factory! It uses the proton gradient (like water pressure) to spin ATP synthase and make lots of ATP!",
            'Fermentation': "When there's no oxygen, cells use fermentation - like making bread rise (alcohol) or your muscles getting sore (lactic acid)!"
        };
        
        const simple = simpleExplanations[topic] || "Cellular respiration is how cells convert food into usable energy (ATP)!";
        this.addTXTMessage(
            `Let me simplify this for you! ${simple} 🎯`,
            member
        );
    };
    
    QuizApp.prototype.provideTopicTips = function(topic, member) {
        const topicTips = {
            'Glycolysis': [
                "Remember: Glycolysis happens in the cytoplasm!",
                "Net gain: 2 ATP and 2 NADH per glucose",
                "No oxygen needed for this process!"
            ],
            'Citric acid cycle': [
                "Happens in the mitochondrial matrix",
                "Produces 3 NADH, 1 FADH₂, and 1 ATP per turn",
                "Remember: 2 turns per glucose (2 pyruvates)!"
            ],
            'ETC': [
                "Located in the inner mitochondrial membrane",
                "NADH enters at Complex I, FADH₂ at Complex II",
                "Oxygen is the final electron acceptor!"
            ],
            'Oxidative phosphorylation': [
                "ATP synthase uses the proton gradient",
                "Most ATP is made here (~26-28 ATP)",
                "Requires oxygen to work!"
            ]
        };
        
        const tips = topicTips[topic] || [
            "Cellular respiration has 4 main stages",
            "Total yield: ~30-32 ATP per glucose",
            "Remember: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP"
        ];
        
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        this.addTXTMessage(
            `Here's a tip about ${topic}: ${randomTip} Hope this helps! 🌟`,
            member
        );
    };
    
    // Send message with AI when configured
    QuizApp.prototype.sendChatMessageWithAI = async function(message, currentQuestion, currentMember) {
        // Show AI response in modal
        this.showAIModal();
        
        // Add user message to modal
        this.addModalMessage(message, 'user');
        
        // Show loading in modal
        const loadingId = 'modal-loading-' + Date.now();
        this.addModalMessage('Thinking...', 'assistant', loadingId);
        
        try {
            // Get AI response about the current question
            const response = await this.aiService.getChatResponse(
                message,
                currentQuestion.question,
                {
                    A: currentQuestion.options[0].text,
                    B: currentQuestion.options[1].text,
                    C: currentQuestion.options[2].text,
                    D: currentQuestion.options[3].text
                },
                currentQuestion.answer,
                currentQuestion.explanation
            );
            
            // Remove loading message
            const loadingElement = document.getElementById(loadingId);
            if (loadingElement) {
                loadingElement.remove();
            }
            
            // Add AI response to modal
            this.addModalMessage(response, 'assistant');
            
            // Also add a brief message in the chat
            this.addTXTMessage(
                `I've provided a detailed answer in the popup window! Feel free to ask more questions there. 💬`,
                currentMember
            );
            
        } catch (error) {
            console.error('AI Error:', error);
            const loadingElement = document.getElementById(loadingId);
            if (loadingElement) {
                loadingElement.remove();
            }
            
            // Show error in modal
            this.addModalMessage(
                `⚠️ There was an error with the AI service. 
                
                Please check:
                1. Your API key is valid
                2. You have credits in your OpenAI account
                3. Your internet connection is working
                
                Error: ${error.message}`,
                'assistant'
            );
        }
    };
    
    // Show the AI response modal
    QuizApp.prototype.showAIModal = function() {
        const modal = document.getElementById('aiResponseModal');
        const container = document.getElementById('aiResponseContainer');
        
        // Clear previous messages
        container.innerHTML = '';
        
        // Show modal
        modal.classList.remove('hidden');
        
        // Focus on input
        const input = document.getElementById('aiModalInput');
        if (input) {
            input.focus();
        }
    };
    
    // Add message to modal
    QuizApp.prototype.addModalMessage = function(message, type, id) {
        const container = document.getElementById('aiResponseContainer');
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-response-message ${type}`;
        if (id) {
            messageDiv.id = id;
        }
        
        // Convert markdown-style formatting to HTML
        const formattedMessage = message
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        messageDiv.innerHTML = formattedMessage;
        container.appendChild(messageDiv);
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    };
    
    // Override restartQuiz to clear AI state
    const originalRestartQuiz = QuizApp.prototype.restartQuiz;
    QuizApp.prototype.restartQuiz = function() {
        originalRestartQuiz.call(this);
        
        // Clear AI conversation
        if (this.aiService) {
            this.aiService.clearConversationHistory();
        }
        
        // Hide chat input
        const inputContainer = document.getElementById('chatInputContainer');
        if (inputContainer) {
            inputContainer.classList.add('hidden');
        }
        
        // Hide ask button
        const askBtn = document.getElementById('askTXTBtn');
        if (askBtn) {
            askBtn.classList.add('hidden');
        }
    };
    
    // Override showQuestion to update AI availability
    const originalShowQuestion = QuizApp.prototype.showQuestion;
    QuizApp.prototype.showQuestion = function() {
        originalShowQuestion.call(this);
        
        // Check AI availability for the new question
        this.checkAIAvailability();
        
        // Clear AI conversation history for new question
        if (this.aiService) {
            this.aiService.clearConversationHistory();
        }
    };
    
    // Initialize modal event listeners
    QuizApp.prototype.initAIModalListeners = function() {
        // Close modal button
        const closeBtn = document.getElementById('closeAIModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('aiResponseModal').classList.add('hidden');
            });
        }
        
        // Send button in modal
        const sendBtn = document.getElementById('aiModalSendBtn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendModalMessage());
        }
        
        // Enter key in modal input
        const input = document.getElementById('aiModalInput');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendModalMessage();
                }
            });
        }
        
        // Click outside modal to close
        const modal = document.getElementById('aiResponseModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        }
    };
    
    // Send message from modal
    QuizApp.prototype.sendModalMessage = async function() {
        const input = document.getElementById('aiModalInput');
        const message = input.value.trim();
        if (!message) return;
        
        // Clear input
        input.value = '';
        
        // Get current question context
        const currentQuestion = window.app && window.app.availableQuestions ? 
            window.app.availableQuestions[window.app.currentQuestionIndex] : null;
            
        if (!currentQuestion) {
            this.addModalMessage('Please start a quiz first!', 'assistant');
            return;
        }
        
        // Add user message
        this.addModalMessage(message, 'user');
        
        // Show loading
        const loadingId = 'modal-loading-' + Date.now();
        this.addModalMessage('Thinking...', 'assistant', loadingId);
        
        try {
            // Get AI response
            const response = await this.aiService.getChatResponse(
                message,
                currentQuestion.question,
                {
                    A: currentQuestion.options[0].text,
                    B: currentQuestion.options[1].text,
                    C: currentQuestion.options[2].text,
                    D: currentQuestion.options[3].text
                },
                currentQuestion.answer,
                currentQuestion.explanation
            );
            
            // Remove loading
            const loadingElement = document.getElementById(loadingId);
            if (loadingElement) {
                loadingElement.remove();
            }
            
            // Add response
            this.addModalMessage(response, 'assistant');
            
        } catch (error) {
            console.error('AI Error:', error);
            const loadingElement = document.getElementById(loadingId);
            if (loadingElement) {
                loadingElement.remove();
            }
            
            this.addModalMessage(
                `Error: ${error.message}. Please check your API key and try again.`,
                'assistant'
            );
        }
    };
    
    // Call this when app initializes
    const originalInit = QuizApp.prototype.initializeElements;
    QuizApp.prototype.initializeElements = function() {
        originalInit.call(this);
        this.initAIModalListeners();
    };
}