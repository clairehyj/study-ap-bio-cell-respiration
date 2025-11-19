// TXT Members Configuration
const txtMembers = [
    { name: 'Soobin', image: 'images/26-Kpop-TXT-Members-SOOBIN-Profile.jpg', color: '#4A9EFF' },
    { name: 'Yeonjun', image: 'images/yeonjun-of-txt.webp', color: '#A084DC' },
    { name: 'Beomgyu', image: 'images/beomgyu.jpg.webp', color: '#FFB4E6' },
    { name: 'Taehyun', image: 'images/Kang_Taehyun_at_a_Dior_event,_April_18,_2025.png', color: '#FF9F40' },
    { name: 'Hueningkai', image: 'images/250904-HUENING-KAI-AT-FANSIGN-EVENT-documents-1.jpeg', color: '#FFE066' }
];

// Messages storage (will be loaded from CSV)
let encouragingMessages = {
    correct: [],
    incorrect: [],
    welcome: [],
    complete_high: [],
    complete_medium: [],
    complete_low: []
};

// Quiz State Management
class QuizApp {
    constructor() {
        this.questions = [];
        this.availableQuestions = []; // Pool of questions that haven't been solved
        this.solvedQuestions = this.loadSolvedQuestions(); // Load previously solved questions
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.selectedAnswer = null;
        this.isAnswerSubmitted = false;
        this.currentMemberIndex = 0;
        this.wrongAnswers = []; // Track questions answered incorrectly
        
        // Progressive difficulty tracking
        this.topicPerformance = this.loadTopicPerformance(); // Load saved topic performance
        this.difficultyLevels = ['Easy', 'Medium', 'Hard'];
        this.progressionThreshold = 0.75; // 75% correct to advance difficulty
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadData();
    }

    initializeElements() {
        // Chat and display elements
        this.chatContainer = document.getElementById('chatContainer');
        
        // Control buttons
        this.startBtn = document.getElementById('startBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.restartBtn = document.getElementById('restartBtn');
        
        // Disable start button until data loads
        this.startBtn.disabled = true;
        this.startBtn.innerHTML = '<span>Loading questions...</span>';
        
        // Answer section
        this.answerSection = document.getElementById('answerSection');
        this.answerOptions = document.getElementById('answerOptions');
        
        // Progress elements
        this.questionNumber = document.getElementById('questionNumber');
        this.scoreDisplay = document.getElementById('score');
        this.progressFill = document.getElementById('progressFill');
        
        // Modal elements
        this.resultsModal = document.getElementById('resultsModal');
        this.closeModal = document.getElementById('closeModal');
        this.scoreCircle = document.getElementById('scoreCircle');
        this.resultsMessage = document.getElementById('resultsMessage');
        this.txtReactions = document.getElementById('txtReactions');
        
        // Loading indicator
        this.loadingIndicator = document.getElementById('loadingIndicator');
        
        // AI Assistant elements
        this.aiAssistant = document.getElementById('aiAssistant');
        this.askAIBtn = document.getElementById('askAIBtn');
        this.aiResponse = document.getElementById('aiResponse');
        this.aiChat = document.getElementById('aiChat');
        this.aiChatInput = document.getElementById('aiChatInput');
        this.aiChatSend = document.getElementById('aiChatSend');
        
        // Initialize AI service
        this.aiService = new AIService();
        
        // Initialize Study Guide AI
        this.studyGuideAI = new StudyGuideAI();
        this.studyGuideAI.initializeAIService();
    }

    attachEventListeners() {
        this.startBtn.addEventListener('click', () => this.startQuiz());
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
        this.restartBtn.addEventListener('click', () => this.restartQuiz());
        this.closeModal.addEventListener('click', () => this.closeResults());
        
        // New chat-based AI help
        const askTXTBtn = document.getElementById('askTXTBtn');
        if (askTXTBtn) {
            askTXTBtn.addEventListener('click', () => this.askTXTForHelp());
        }
        
        const sendChatBtn = document.getElementById('sendChatBtn');
        if (sendChatBtn) {
            sendChatBtn.addEventListener('click', () => this.sendChatMessage());
        }
        
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage();
                }
            });
        }
    }

    async loadData() {
        this.loadingIndicator.classList.remove('hidden');
        
        try {
            // Check if we're running from file:// protocol
            if (window.location.protocol === 'file:') {
                console.warn('Running from file:// protocol. CSV loading may fail due to CORS.');
                console.log('To fix this, either:');
                console.log('1. Run: python3 start-server.py');
                console.log('2. Or use the fallback data below');
                
                // Try to load anyway, but provide fallback
                try {
                    const [questionsResponse, messagesResponse] = await Promise.all([
                        fetch('questions.csv'),
                        fetch('messages.csv')
                    ]);
                    
                    const questionsText = await questionsResponse.text();
                    const messagesText = await messagesResponse.text();
                    
                    this.questions = this.parseQuestionsCSV(questionsText);
                    this.parseMessagesCSV(messagesText);
                } catch (fetchError) {
                    console.log('Fetch failed, using fallback data');
                    this.loadFallbackData();
                }
            } else {
                // Normal loading for http:// or https://
                const [questionsResponse, messagesResponse] = await Promise.all([
                    fetch('questions.csv'),
                    fetch('messages.csv')
                ]);
                
                if (!questionsResponse.ok || !messagesResponse.ok) {
                    throw new Error('Failed to load CSV files');
                }
                
                const questionsText = await questionsResponse.text();
                const messagesText = await messagesResponse.text();
                
                console.log('Questions CSV loaded, length:', questionsText.length);
                console.log('Messages CSV loaded, length:', messagesText.length);
                
                this.questions = this.parseQuestionsCSV(questionsText);
                this.parseMessagesCSV(messagesText);
            }
            
            console.log('Parsed questions:', this.questions.length);
            console.log('Parsed message types:', Object.keys(encouragingMessages));
            
            this.loadingIndicator.classList.add('hidden');
            
            // Enable start button only after data is loaded
            if (this.questions.length > 0) {
                this.startBtn.disabled = false;
                this.startBtn.innerHTML = '<span>Start Quiz</span><span class="btn-sparkle">✨</span>';
            } else {
                this.startBtn.innerHTML = '<span>No questions loaded</span>';
            }
        } catch (error) {
            console.error('Error loading data:', error);
            
            // Try fallback data
            this.loadFallbackData();
            
            if (this.questions.length > 0) {
                // Fallback data loaded successfully
                this.loadingIndicator.classList.add('hidden');
                this.startBtn.disabled = false;
                this.startBtn.innerHTML = '<span>Start Quiz</span><span class="btn-sparkle">✨</span>';
                console.log('Using fallback data - quiz ready!');
            } else {
                this.loadingIndicator.classList.add('hidden');
                this.addChatMessage('Soobin', 'Having trouble loading the quiz. Try running: python3 start-server.py 🖥️');
                this.startBtn.innerHTML = '<span>Error loading quiz</span>';
            }
        }
    }

    loadFallbackData() {
        // Fallback questions if CSV fails to load
        this.questions = [
            {
                question: "Which stage of cellular respiration produces the most ATP?",
                options: [
                    { label: 'A', text: 'Glycolysis' },
                    { label: 'B', text: 'Pyruvate oxidation' },
                    { label: 'C', text: 'Citric acid cycle (Krebs cycle)' },
                    { label: 'D', text: 'Oxidative phosphorylation (Electron Transport Chain + ATP synthase)' }
                ],
                answer: 'D',
                explanation: 'Oxidative phosphorylation produces ~26-28 ATP per glucose, while glycolysis produces 2 ATP, and the citric acid cycle produces 2 ATP.'
            },
            {
                question: "Where does glycolysis occur in the cell?",
                options: [
                    { label: 'A', text: 'Mitochondrial matrix' },
                    { label: 'B', text: 'Inner mitochondrial membrane' },
                    { label: 'C', text: 'Cytoplasm' },
                    { label: 'D', text: 'Outer mitochondrial membrane' }
                ],
                answer: 'C',
                explanation: 'Glycolysis occurs in the cytoplasm of all cells. It doesn\'t require oxygen and is the most ancient metabolic pathway.'
            },
            {
                question: "What is the net ATP gain from glycolysis per glucose molecule?",
                options: [
                    { label: 'A', text: '1 ATP' },
                    { label: 'B', text: '2 ATP' },
                    { label: 'C', text: '4 ATP' },
                    { label: 'D', text: '6 ATP' }
                ],
                answer: 'B',
                explanation: 'Glycolysis uses 2 ATP in the investment phase and produces 4 ATP in the payoff phase, resulting in a net gain of 2 ATP.'
            },
            {
                question: "Which molecule is the final electron acceptor in aerobic respiration?",
                options: [
                    { label: 'A', text: 'NAD+' },
                    { label: 'B', text: 'FADH₂' },
                    { label: 'C', text: 'Oxygen' },
                    { label: 'D', text: 'Carbon dioxide' }
                ],
                answer: 'C',
                explanation: 'Oxygen is the final electron acceptor in the electron transport chain. It accepts electrons and combines with protons to form water.'
            },
            {
                question: "What is produced when pyruvate enters the mitochondria?",
                options: [
                    { label: 'A', text: 'Glucose' },
                    { label: 'B', text: 'Acetyl-CoA' },
                    { label: 'C', text: 'Lactate' },
                    { label: 'D', text: 'Ethanol' }
                ],
                answer: 'B',
                explanation: 'Pyruvate is converted to acetyl-CoA by pyruvate dehydrogenase complex. This process also produces CO₂ and NADH.'
            }
        ];
        
        // Fallback messages
        encouragingMessages.correct = [
            { member: 'Soobin', message: 'Amazing job! You got it right! 🌟' },
            { member: 'Yeonjun', message: 'Perfect! Keep going! 💪' },
            { member: 'Beomgyu', message: 'Wow! You\'re so smart! 🎉' },
            { member: 'Taehyun', message: 'Excellent work! 📚' },
            { member: 'Hueningkai', message: 'You\'re doing great! 🏆' }
        ];
        
        encouragingMessages.incorrect = [
            { member: 'Soobin', message: 'It\'s okay! Let\'s learn from this! 💙' },
            { member: 'Yeonjun', message: 'Don\'t worry! You\'ll get the next one! 🤗' },
            { member: 'Beomgyu', message: 'Keep trying! You can do it! 💪' },
            { member: 'Taehyun', message: 'Good effort! Let me explain... 📖' },
            { member: 'Hueningkai', message: 'Don\'t give up! You\'re learning! 🌈' }
        ];
        
        encouragingMessages.welcome = [
            { member: 'Soobin', message: 'Let\'s start studying together! 📚' }
        ];
        
        encouragingMessages.complete_high = [
            { member: 'Soobin', message: 'Outstanding! You\'re a cellular respiration expert! 🌟🏆' }
        ];
        
        encouragingMessages.complete_medium = [
            { member: 'Yeonjun', message: 'Great job! You\'re well prepared for your test! 💪📚' }
        ];
        
        encouragingMessages.complete_low = [
            { member: 'Hueningkai', message: 'Good effort! Keep studying and you\'ll master this! 🌈💙' }
        ];
        
        console.log('Loaded fallback data with', this.questions.length, 'questions');
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    parseQuestionsCSV(csv) {
        const lines = csv.split('\n').filter(line => line.trim());
        console.log('Total lines in CSV:', lines.length);
        
        if (lines.length === 0) {
            console.error('CSV file is empty');
            return [];
        }
        
        const headers = this.parseCSVLine(lines[0]);
        console.log('Headers:', headers);
        
        const questions = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            console.log(`Line ${i} values:`, values.length, 'fields');
            
            if (values.length >= 7) {
                questions.push({
                    question: values[0],
                    options: [
                        { label: 'A', text: values[1] },
                        { label: 'B', text: values[2] },
                        { label: 'C', text: values[3] },
                        { label: 'D', text: values[4] }
                    ],
                    answer: values[5],
                    explanation: values[6],
                    difficulty: values[7] || 'Medium', // Default to Medium if not specified
                    topic: values[8] || 'General Cellular Respiration' // Default topic if not specified
                });
            } else {
                console.warn(`Line ${i} has insufficient values:`, values);
            }
        }
        
        console.log('Total questions parsed:', questions.length);
        return questions;
    }

    parseMessagesCSV(csv) {
        const lines = csv.split('\n').filter(line => line.trim());
        const headers = this.parseCSVLine(lines[0]);
        
        // Clear existing messages
        encouragingMessages = {
            correct: [],
            incorrect: [],
            welcome: [],
            complete_high: [],
            complete_medium: [],
            complete_low: []
        };
        
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            
            if (values.length >= 3) {
                const member = values[0];
                const type = values[1];
                const message = values[2];
                
                if (encouragingMessages[type]) {
                    encouragingMessages[type].push({ member, message });
                }
            }
        }
    }


    startQuiz() {
        // Optimal quiz length for engagement (game theory)
        const OPTIMAL_QUIZ_LENGTH = 6; // Sweet spot between 5-7 questions
        
        // Build the quiz pool with progressive difficulty
        this.availableQuestions = this.selectQuestionsWithProgression(OPTIMAL_QUIZ_LENGTH);
        
        // Check if questions are loaded
        if (!this.availableQuestions || this.availableQuestions.length === 0) {
            this.addChatMessage('Soobin', 'No questions available to practice! 📚');
            return;
        }
        
        this.startBtn.classList.add('hidden');
        this.answerSection.classList.remove('hidden');
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.wrongAnswers = []; // Reset wrong answers
        
        // Add a welcome message if available
        if (encouragingMessages.welcome && encouragingMessages.welcome.length > 0) {
            const welcomeMsg = encouragingMessages.welcome[Math.floor(Math.random() * encouragingMessages.welcome.length)];
            this.addChatMessage(welcomeMsg.member, welcomeMsg.message);
        }
        
        // Show quiz composition with difficulty info
        const difficultyComposition = this.getDifficultyComposition();
        this.addChatMessage('Taehyun', 
            `Ready for ${this.availableQuestions.length} questions! ${difficultyComposition} Let's level up! 💪`
        );
        
        this.updateProgress();
        this.showQuestion();
    }

    showQuestion() {
        if (this.currentQuestionIndex >= this.availableQuestions.length) {
            this.showResults();
            return;
        }

        const question = this.availableQuestions[this.currentQuestionIndex];
        const member = txtMembers[this.currentMemberIndex % txtMembers.length];
        
        // Clear previous answers
        this.selectedAnswer = null;
        this.isAnswerSubmitted = false;
        this.nextBtn.classList.add('hidden');
        
        // Update chat input placeholder with current member name
        const chatInputContainer = document.getElementById('chatInputContainer');
        const chatInput = document.getElementById('chatInput');
        if (chatInputContainer && chatInput) {
            chatInputContainer.classList.remove('hidden');
            chatInput.placeholder = `Ask ${member.name} about this question...`;
        }
        
        // Add TXT member asking the question in chat
        this.addChatMessage(
            member.name,
            `Let's look at question ${this.currentQuestionIndex + 1}! 📝`,
            true
        );
        
        // Display question in the quiz panel
        const questionDisplay = document.getElementById('questionDisplay');
        const currentQuestionElement = document.getElementById('currentQuestion');
        if (questionDisplay && currentQuestionElement) {
            questionDisplay.classList.remove('hidden');
            currentQuestionElement.textContent = question.question;
        }
        
        // Randomize answer options while preserving correct answer mapping
        const shuffledOptions = this.shuffleAnswerOptions(question.options, question.answer);
        
        // Display randomized answer options
        this.displayAnswerOptions(shuffledOptions.options);
        
        // Store the mapping for checking correct answer
        this.answerMapping = shuffledOptions.mapping;
        
        // Rotate to next member for next question
        this.currentMemberIndex++;
    }

    shuffleAnswerOptions(originalOptions, correctAnswer) {
        // Create a copy of the options array
        const options = [...originalOptions];
        
        // Find the index of the correct answer
        const correctIndex = options.findIndex(opt => opt.label === correctAnswer);
        const correctOption = options[correctIndex];
        
        // Shuffle the options array using Fisher-Yates algorithm
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        
        // Create mapping from new labels to original labels
        const mapping = {};
        const newLabels = ['A', 'B', 'C', 'D'];
        
        // Create new options with reassigned labels
        const shuffledOptions = options.map((option, index) => {
            const newLabel = newLabels[index];
            mapping[newLabel] = option.label;
            return {
                ...option,
                originalLabel: option.label,
                label: newLabel
            };
        });
        
        // Find the new label for the correct answer
        const newCorrectLabel = shuffledOptions.find(opt => opt.originalLabel === correctAnswer).label;
        
        return {
            options: shuffledOptions,
            mapping: mapping,
            correctAnswer: newCorrectLabel
        };
    }

    displayAnswerOptions(options) {
        this.answerOptions.innerHTML = '';
        
        options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'answer-option fade-in';
            optionDiv.style.animationDelay = `${index * 0.1}s`;
            
            optionDiv.innerHTML = `
                <span class="option-label">${option.label})</span>
                <span>${option.text}</span>
            `;
            
            optionDiv.addEventListener('click', () => this.selectAnswer(option.label, optionDiv));
            this.answerOptions.appendChild(optionDiv);
        });
    }

    selectAnswer(answer, element) {
        if (this.isAnswerSubmitted) return;
        
        // Remove previous selection
        document.querySelectorAll('.answer-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Mark new selection
        element.classList.add('selected');
        this.selectedAnswer = answer;
        
        // Automatically submit the answer when selected
        this.submitAnswer();
    }

    submitAnswer() {
        if (!this.selectedAnswer || this.isAnswerSubmitted) return;
        
        this.isAnswerSubmitted = true;
        
        const question = this.availableQuestions[this.currentQuestionIndex];
        
        // Check if the selected answer is correct using the mapping
        const originalLabel = this.answerMapping ? this.answerMapping[this.selectedAnswer] : this.selectedAnswer;
        const isCorrect = originalLabel === question.answer;
        
        // Update topic performance for progressive difficulty
        const topic = question.topic || 'General Cellular Respiration';
        const difficulty = question.difficulty || 'Medium';
        this.updateTopicPerformance(topic, difficulty, isCorrect);
        
        // Mark question as solved if answered correctly
        if (isCorrect) {
            const questionId = this.getQuestionId(question);
            if (!this.solvedQuestions.includes(questionId)) {
                this.solvedQuestions.push(questionId);
                this.saveSolvedQuestions();
            }
        }
        
        if (isCorrect) {
            this.score++;
        } else {
            // Track wrong answers for study guide
            // Find what the correct answer was displayed as
            let displayedCorrectAnswer = question.answer;
            if (this.answerMapping) {
                for (let [displayLabel, originalLabel] of Object.entries(this.answerMapping)) {
                    if (originalLabel === question.answer) {
                        displayedCorrectAnswer = displayLabel;
                        break;
                    }
                }
            }
            
            this.wrongAnswers.push({
                questionNumber: this.currentQuestionIndex + 1,
                question: question.question,
                yourAnswer: this.selectedAnswer,
                correctAnswer: displayedCorrectAnswer,
                explanation: question.explanation
            });
        }
        
        // Mark answers as correct or incorrect
        document.querySelectorAll('.answer-option').forEach(opt => {
            const optionLabel = opt.querySelector('.option-label').textContent.replace(')', '');
            const originalLabel = this.answerMapping ? this.answerMapping[optionLabel] : optionLabel;
            
            if (originalLabel === question.answer) {
                opt.classList.add('correct');
            } else if (optionLabel === this.selectedAnswer && !isCorrect) {
                opt.classList.add('incorrect');
            }
        });
        
        // Add TXT member reaction
        const messageType = isCorrect ? 'correct' : 'incorrect';
        const messages = encouragingMessages[messageType];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        setTimeout(() => {
            this.addChatMessage(randomMessage.member, randomMessage.message);
            
            // Show explanation if incorrect
            if (!isCorrect && question.explanation) {
                setTimeout(() => {
                    const explanationMember = txtMembers[Math.floor(Math.random() * txtMembers.length)];
                    this.addChatMessage(
                        explanationMember.name,
                        `Here's the explanation: ${question.explanation}`
                    );
                    
                    // Add button to ask for more help
                    if (this.aiService && this.aiService.isConfigured()) {
                        // Get the topic for this question
                        const questionTopic = this.getQuestionTopic(question.question);
                        this.addAskForHelpButton(explanationMember, questionTopic);
                    }
                }, 1000);
            }
            
            this.nextBtn.classList.remove('hidden');
        }, 500);
        
        this.updateProgress();
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        
        // Clear answer mapping for new question
        this.answerMapping = null;
        
        // Clear chat for new question (keep welcome message)
        const messages = this.chatContainer.querySelectorAll('.chat-message');
        if (messages.length > 1) {
            for (let i = messages.length - 1; i > 0; i--) {
                messages[i].remove();
            }
        }
        
        this.showQuestion();
    }

    addChatMessage(memberName, message, isQuestion = false) {
        const member = txtMembers.find(m => m.name === memberName) || txtMembers[0];
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message txt-message';
        
        messageDiv.innerHTML = `
            <img src="${member.image}" alt="${member.name}" class="member-avatar" 
                 onerror="this.style.background='linear-gradient(135deg, ${member.color}, #A084DC)'"
                 style="background: linear-gradient(135deg, ${member.color}, #A084DC)">
            <div class="message-content">
                <span class="member-name" style="color: ${member.color}">${member.name}</span>
                <div class="message-bubble">
                    ${isQuestion ? `<div class="quiz-question"><p>${message}</p></div>` : `<p>${message}</p>`}
                </div>
            </div>
        `;
        
        this.chatContainer.appendChild(messageDiv);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    provideTopicHelp(topic, member) {
        const topicHelp = {
            'Glycolysis': "Glycolysis happens in the cytoplasm! It breaks down glucose into 2 pyruvate molecules, producing a net gain of 2 ATP and 2 NADH. No oxygen needed! 🧬",
            'Citric acid cycle': "The Krebs cycle occurs in the mitochondrial matrix. Each turn produces 3 NADH, 1 FADH₂, and 1 ATP. Remember: 2 turns per glucose! 🔄",
            'ETC': "The electron transport chain is in the inner mitochondrial membrane. NADH and FADH₂ donate electrons, which pump protons to create a gradient! ⚡",
            'Oxidative phosphorylation': "ATP synthase uses the proton gradient like a waterwheel to produce most of our ATP (~26-28 per glucose)! 💪",
            'Fermentation': "When oxygen is absent, cells use fermentation to regenerate NAD+ so glycolysis can continue. Lactic acid in muscles, ethanol in yeast! 🍞"
        };
        
        const help = topicHelp[topic] || "Cellular respiration converts glucose and oxygen into CO₂, water, and ~30-32 ATP! It's how cells get energy! 🔋";
        
        this.addChatMessage(
            member.name,
            `Let me help you understand ${topic || 'cellular respiration'}! ${help}`
        );
    }
    
    addAskForHelpButton(member, topic = null) {
        // Create a button to ask for more help
        const buttonDiv = document.createElement('div');
        buttonDiv.className = 'chat-help-button-container';
        
        // Create button text with topic if provided
        const buttonText = topic ? 
            `💡 Ask ${member.name} to explain more about ${topic}` :
            `💡 Ask ${member.name} to explain more`;
        
        buttonDiv.innerHTML = `
            <button class="btn btn-ask-help" style="background: linear-gradient(135deg, ${member.color}, #A084DC)">
                ${buttonText}
            </button>
        `;
        
        const button = buttonDiv.querySelector('.btn-ask-help');
        button.addEventListener('click', () => {
            // Get current question
            const currentQuestion = this.availableQuestions[this.currentQuestionIndex];
            
            // Check if AI is configured
            if (this.aiService && this.aiService.isConfigured()) {
                // Use real AI if available
                if (this.askTXTForHelp) {
                    this.askTXTForHelp();
                }
            } else {
                // Fallback: Show API key message and basic help
                this.addClaireMessage(`Can you explain more about ${topic || 'this question'}?`);
                
                // Show that API key is needed for AI responses
                this.addChatMessage(
                    member.name,
                    `💡 For AI-generated explanations, you'll need to add an OpenAI API key in Settings.
                    
                    But here's what I can tell you from the textbook: ${currentQuestion.explanation || 'This is a key concept in cellular respiration!'}
                    
                    Want personalized help? <a href="settings.html" target="_blank" style="color: #4A9EFF;">Add your API key here →</a>`
                );
                
                // Still provide basic help
                if (topic && currentQuestion.topic) {
                    setTimeout(() => {
                        this.provideTopicHelp(topic || currentQuestion.topic, member);
                    }, 1000);
                }
            }
            
            // Show the chat input for follow-up questions
            const chatInputContainer = document.getElementById('chatInputContainer');
            const chatInput = document.getElementById('chatInput');
            
            if (chatInputContainer) {
                chatInputContainer.classList.remove('hidden');
                if (chatInput) {
                    chatInput.placeholder = `Ask ${member.name} another question...`;
                    chatInput.focus();
                }
            }
            
            // Hide the button after clicking
            buttonDiv.remove();
        });
        
        this.chatContainer.appendChild(buttonDiv);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    updateProgress() {
        const progress = ((this.currentQuestionIndex + 1) / this.availableQuestions.length) * 100;
        this.progressFill.style.width = `${progress}%`;
        
        this.questionNumber.textContent = `Question ${this.currentQuestionIndex + 1} of ${this.availableQuestions.length}`;
        this.scoreDisplay.textContent = `Score: ${this.score}`;
    }

    showResults() {
        // Save wrong questions for future practice
        this.saveWrongQuestions();
        
        // Handle case where no questions were answered
        if (!this.availableQuestions || this.availableQuestions.length === 0) {
            this.scoreCircle.querySelector('.score-percent').textContent = '0%';
            this.resultsMessage.textContent = 'No questions available. Please refresh and try again!';
            this.resultsModal.classList.remove('hidden');
            return;
        }
        
        const percentage = Math.round((this.score / this.availableQuestions.length) * 100);
        
        // Update score display
        this.scoreCircle.querySelector('.score-percent').textContent = `${percentage}%`;
        
        // Determine message category based on score
        let messageCategory;
        if (percentage >= 90) {
            messageCategory = 'complete_high';
        } else if (percentage >= 70) {
            messageCategory = 'complete_medium';
        } else {
            messageCategory = 'complete_low';
        }
        
        // Get random message from the appropriate category
        const messages = encouragingMessages[messageCategory];
        const randomMessage = messages.length > 0 
            ? messages[Math.floor(Math.random() * messages.length)].message
            : 'Great job completing the quiz! 🎉';
        
        this.resultsMessage.textContent = randomMessage;
        
        // Add TXT member reactions
        this.txtReactions.innerHTML = '';
        txtMembers.forEach(member => {
            const img = document.createElement('img');
            img.src = member.image;
            img.alt = member.name;
            img.style.background = `linear-gradient(135deg, ${member.color}, #A084DC)`;
            img.onerror = function() {
                this.style.opacity = '0.8';
            };
            this.txtReactions.appendChild(img);
        });
        
        // Create study guide if there were wrong answers
        this.createStudyGuide();
        
        // Show modal
        this.resultsModal.classList.remove('hidden');
        
        // Hide quiz controls
        this.answerSection.classList.add('hidden');
        this.nextBtn.classList.add('hidden');
    }

    async createStudyGuide() {
        const studyGuideDiv = document.getElementById('studyGuide');
        const studyTopicsDiv = document.getElementById('studyTopics');
        const wrongQuestionsDiv = document.getElementById('wrongQuestionsList');
        
        if (this.wrongAnswers.length === 0) {
            // Perfect score - no study guide needed
            studyGuideDiv.classList.add('hidden');
            return;
        }
        
        // Show study guide
        studyGuideDiv.classList.remove('hidden');
        
        // Show loading indicator for AI recommendations
        studyTopicsDiv.innerHTML = `
            <div class="study-loading">
                <div class="loading-spinner-small"></div>
                <p>Analyzing your answers and generating personalized study recommendations...</p>
            </div>
        `;
        wrongQuestionsDiv.innerHTML = '';
        
        // Generate study recommendations
        try {
            const studyData = await this.studyGuideAI.generateStudyTopics(this.wrongAnswers);
            
            if (studyData.aiGenerated) {
                // AI-generated recommendations
                this.displayAIStudyRecommendations(studyData, studyTopicsDiv, wrongQuestionsDiv);
            } else {
                // Fallback to rule-based recommendations
                this.displayRuleBasedRecommendations(studyData, studyTopicsDiv, wrongQuestionsDiv);
            }
        } catch (error) {
            console.error('Error generating study guide:', error);
            // Fallback to basic recommendations
            this.displayBasicStudyGuide(studyTopicsDiv, wrongQuestionsDiv);
        }
    }
    
    displayAIStudyRecommendations(studyData, topicsDiv, questionsDiv) {
        // Display AI-generated study recommendations
        topicsDiv.innerHTML = `
            <div class="ai-study-recommendations">
                ${this.formatAIResponse(studyData.recommendations)}
            </div>
        `;
        
        // Display wrong questions list
        this.displayWrongQuestionsList(studyData.questions, questionsDiv);
    }
    
    displayRuleBasedRecommendations(studyData, topicsDiv, questionsDiv) {
        let topicsHTML = '<div class="study-topics-grid">';
        
        studyData.recommendations.forEach(rec => {
            topicsHTML += `
                <div class="study-topic-card">
                    <h4 class="topic-name">📚 ${rec.topic}</h4>
                    <ul class="topic-points">
                        ${rec.studyPoints.map(point => `<li>${point}</li>`).join('')}
                    </ul>
                    <span class="question-count">${rec.questions.length} question(s) on this topic</span>
                </div>
            `;
        });
        
        topicsHTML += '</div>';
        topicsDiv.innerHTML = topicsHTML;
        
        // Display wrong questions list
        const allQuestions = studyData.recommendations.flatMap(r => r.questions);
        this.displayWrongQuestionsList(allQuestions, questionsDiv);
    }
    
    displayBasicStudyGuide(topicsDiv, questionsDiv) {
        // Group wrong answers by basic topics
        const topics = this.categorizeWrongAnswers();
        const totalWrong = this.wrongAnswers.length;
        const totalQuestions = this.availableQuestions.length;
        const mastery = Math.round(((totalQuestions - totalWrong) / totalQuestions) * 100);
        
        // Create an engaging study plan header
        let topicsHTML = `
            <div class="study-plan-container">
                <div class="study-progress-overview">
                    <div class="mastery-meter">
                        <div class="mastery-fill" style="width: ${mastery}%"></div>
                        <span class="mastery-label">${mastery}% Mastery</span>
                    </div>
                    <p class="progress-message">You need to review ${totalWrong} concept${totalWrong > 1 ? 's' : ''} to reach 100%!</p>
                </div>
                
                <div class="study-topics-interactive">
        `;
        
        // Create interactive topic cards with priority levels
        const topicArray = Object.keys(topics).map(topic => ({
            name: topic,
            questions: topics[topic],
            priority: topics[topic].length >= 2 ? 'high' : 'medium',
            icon: this.getTopicIcon(topic)
        }));
        
        // Sort by priority (most questions first)
        topicArray.sort((a, b) => b.questions.length - a.questions.length);
        
        topicArray.forEach((topicData, index) => {
            const concepts = this.getKeyConceptsForTopic(topicData.name);
            const priorityClass = topicData.priority === 'high' ? 'priority-high' : 'priority-medium';
            const priorityLabel = topicData.priority === 'high' ? '🔥 High Priority' : '📚 Review';
            
            topicsHTML += `
                <div class="topic-study-card ${priorityClass}" data-topic="${topicData.name}">
                    <div class="topic-header-interactive">
                        <div class="topic-icon">${topicData.icon}</div>
                        <div class="topic-info">
                            <h4 class="topic-title">${topicData.name}</h4>
                            <span class="priority-badge">${priorityLabel}</span>
                        </div>
                        <div class="topic-score">
                            <span class="wrong-count">${topicData.questions.length}</span>
                            <span class="wrong-label">to review</span>
                        </div>
                    </div>
                    
                    <div class="topic-content-expandable">
                        <div class="concept-checklist">
                            <p class="checklist-title">📝 Key Concepts to Master:</p>
                            <ul class="concepts-interactive">
                                ${concepts.map(c => `
                                    <li class="concept-item">
                                        <input type="checkbox" id="concept-${index}-${concepts.indexOf(c)}" class="concept-checkbox">
                                        <label for="concept-${index}-${concepts.indexOf(c)}">${c}</label>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                        
                        <div class="study-actions">
                            <button class="btn-study-resource" onclick="window.open('https://www.khanacademy.org/science/ap-biology/cellular-respiration', '_blank')">
                                🎥 Watch Video
                            </button>
                            <button class="btn-practice-more" data-topic="${topicData.name}">
                                🎯 Practice This Topic
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        topicsHTML += `
                </div>
                
                <div class="study-tips-section">
                    <h4 class="tips-title">💡 Study Tips from TXT</h4>
                    <div class="tips-carousel">
                        <div class="tip-card active">
                            <img src="images/26-Kpop-TXT-Members-TAEHYUN-Profile.jpg" alt="Taehyun" class="tip-avatar">
                            <p class="tip-text">"Focus on understanding the concepts, not memorizing! Draw diagrams to visualize the processes." - Taehyun</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        topicsDiv.innerHTML = topicsHTML;
        
        // Display wrong questions with better formatting
        this.displayEnhancedWrongQuestionsList(this.wrongAnswers, questionsDiv);
    }
    
    displayWrongQuestionsList(questions, container) {
        this.displayEnhancedWrongQuestionsList(questions, container);
    }
    
    displayEnhancedWrongQuestionsList(questions, container) {
        let html = `
            <div class="wrong-questions-enhanced">
                <div class="questions-header-bar">
                    <h4 class="section-title-modern">
                        <span class="title-icon">📋</span>
                        Review Your Mistakes
                        <span class="question-count-badge">${questions.length}</span>
                    </h4>
                    <div class="filter-options">
                        <button class="filter-btn active" data-filter="all">All</button>
                        <button class="filter-btn" data-filter="high">High Priority</button>
                        <button class="filter-btn" data-filter="reviewed">Reviewed</button>
                    </div>
                </div>
                
                <div class="questions-review-list">
        `;
        
        questions.forEach((item, index) => {
            const topic = this.getQuestionTopic(item.question);
            const topicColor = this.getTopicColor(topic);
            
            html += `
                <div class="review-question-card" data-question-id="${index}">
                    <div class="question-status-bar" style="background: linear-gradient(to right, ${topicColor}, transparent)">
                        <div class="question-meta">
                            <span class="q-number-modern">#${item.questionNumber}</span>
                            <span class="q-topic-badge" style="background: ${topicColor}20; color: ${topicColor}">
                                ${this.getTopicIcon(topic)} ${topic}
                            </span>
                        </div>
                        <div class="review-status">
                            <button class="btn-mark-reviewed" data-question="${index}">
                                <span class="check-icon">✓</span> Mark as Reviewed
                            </button>
                        </div>
                    </div>
                    
                    <div class="question-main-content">
                        <p class="question-statement">${item.question}</p>
                        
                        <div class="answer-comparison-modern">
                            <div class="answer-box your-choice">
                                <div class="answer-label">
                                    <span class="icon">❌</span>
                                    <span>Your Answer</span>
                                </div>
                                <div class="answer-text">${item.yourAnswer}</div>
                            </div>
                            
                            <div class="answer-arrow">→</div>
                            
                            <div class="answer-box correct-choice">
                                <div class="answer-label">
                                    <span class="icon">✅</span>
                                    <span>Correct Answer</span>
                                </div>
                                <div class="answer-text">${item.correctAnswer}</div>
                            </div>
                        </div>
                        
                        <div class="explanation-enhanced">
                            <div class="explanation-header">
                                <span class="bulb-icon">💡</span>
                                <span>Why this is correct:</span>
                            </div>
                            <p class="explanation-text">${item.explanation}</p>
                            
                            <div class="understanding-check">
                                <p class="check-prompt">Do you understand this concept now?</p>
                                <div class="understanding-buttons">
                                    <button class="btn-understand yes" data-question="${index}">
                                        😊 Yes, I get it!
                                    </button>
                                    <button class="btn-understand no" data-question="${index}">
                                        🤔 Need more help
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
                
                <div class="review-progress-footer">
                    <div class="progress-stats">
                        <span class="stats-item">
                            <span class="stats-icon">📚</span>
                            <span class="stats-text">0/${questions.length} Reviewed</span>
                        </span>
                        <span class="stats-item">
                            <span class="stats-icon">✨</span>
                            <span class="stats-text">Keep studying!</span>
                        </span>
                    </div>
                    <button class="btn-retake-quiz">
                        🎯 Practice These Questions Again
                    </button>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
        // Add interactivity after rendering
        this.attachStudyGuideInteractions();
    }
    
    getQuestionTopic(questionText) {
        const text = questionText.toLowerCase();
        
        if (text.includes('glycolysis')) return 'Glycolysis';
        if (text.includes('citric acid') || text.includes('krebs')) return 'Citric Acid Cycle';
        if (text.includes('electron transport') || text.includes('etc')) return 'Electron Transport Chain';
        if (text.includes('atp synthase') || text.includes('oxidative phosphorylation')) return 'Oxidative Phosphorylation';
        if (text.includes('fermentation')) return 'Fermentation';
        if (text.includes('nadh') || text.includes('fadh')) return 'Electron Carriers';
        if (text.includes('pyruvate')) return 'Pyruvate Oxidation';
        if (text.includes('mitochondri')) return 'Mitochondria';
        
        return 'Cellular Respiration';
    }
    
    getTopicIcon(topic) {
        const icons = {
            'Glycolysis': '🔬',
            'Citric Acid Cycle': '🔄',
            'Electron Transport Chain': '⚡',
            'Oxidative Phosphorylation': '💡',
            'Fermentation': '🍞',
            'Electron Carriers': '🔋',
            'Pyruvate Oxidation': '🔥',
            'Mitochondria': '🏭',
            'Cellular Respiration': '🧬'
        };
        return icons[topic] || '📚';
    }
    
    getTopicColor(topic) {
        const colors = {
            'Glycolysis': '#FF6B6B',
            'Citric Acid Cycle': '#4ECDC4',
            'Electron Transport Chain': '#45B7D1',
            'Oxidative Phosphorylation': '#FFA07A',
            'Fermentation': '#98D8C8',
            'Electron Carriers': '#F7DC6F',
            'Pyruvate Oxidation': '#BB8FCE',
            'Mitochondria': '#85C1E2',
            'Cellular Respiration': '#A084DC'
        };
        return colors[topic] || '#4A9EFF';
    }
    
    attachStudyGuideInteractions() {
        // Add click handlers for mark as reviewed buttons
        document.querySelectorAll('.btn-mark-reviewed').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.review-question-card');
                card.classList.add('reviewed');
                e.target.textContent = '✓ Reviewed';
                e.target.disabled = true;
                
                // Update progress stats
                const reviewedCount = document.querySelectorAll('.review-question-card.reviewed').length;
                const totalCount = document.querySelectorAll('.review-question-card').length;
                document.querySelector('.stats-text').textContent = `${reviewedCount}/${totalCount} Reviewed`;
            });
        });
        
        // Add click handlers for understanding buttons
        document.querySelectorAll('.btn-understand').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const isYes = e.target.classList.contains('yes');
                const card = e.target.closest('.review-question-card');
                
                if (isYes) {
                    card.classList.add('understood');
                    e.target.closest('.understanding-check').innerHTML = '<p class="understood-message">Great! You got this! 🎉</p>';
                } else {
                    // Show additional help or resources
                    e.target.closest('.understanding-check').innerHTML = `
                        <p class="need-help-message">No worries! Here are some resources:</p>
                        <div class="help-resources">
                            <a href="https://www.khanacademy.org/science/ap-biology" target="_blank" class="resource-link">📺 Watch Khan Academy</a>
                            <button class="btn-ask-tutor">💬 Ask TXT for help</button>
                        </div>
                    `;
                }
            });
        });
        
        // Add filter functionality
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const filter = e.target.dataset.filter;
                const cards = document.querySelectorAll('.review-question-card');
                
                cards.forEach(card => {
                    if (filter === 'all') {
                        card.style.display = 'block';
                    } else if (filter === 'reviewed') {
                        card.style.display = card.classList.contains('reviewed') ? 'block' : 'none';
                    } else if (filter === 'high') {
                        // Show questions from topics with multiple wrong answers
                        card.style.display = 'block'; // You can add more logic here
                    }
                });
            });
        });
    }
    
    getKeyConceptsForTopic(topic) {
        const concepts = {
            'Glycolysis': [
                'The 10 steps of glycolysis and their products',
                'Energy investment phase vs. payoff phase',
                'Net production of 2 ATP and 2 NADH per glucose',
                'Regulation by phosphofructokinase-1 (PFK-1)'
            ],
            'Citric Acid Cycle (Krebs Cycle)': [
                'The 8 steps of the cycle',
                'Production of NADH, FADH₂, and GTP/ATP',
                'Regulation by isocitrate and α-ketoglutarate dehydrogenases',
                'Role of oxaloacetate in cycle continuation'
            ],
            'Electron Transport Chain & Oxidative Phosphorylation': [
                'Four protein complexes (I-IV) and their functions',
                'Proton pumping and gradient formation',
                'ATP synthase mechanism',
                'Difference between NADH and FADH₂ entry points'
            ],
            'ATP Production & Energy': [
                'Total ATP yield: ~30-32 ATP per glucose',
                'Substrate-level vs. oxidative phosphorylation',
                'Why theoretical yield differs from actual yield'
            ],
            'Fermentation': [
                'Lactic acid fermentation in muscles',
                'Alcoholic fermentation in yeast',
                'NAD+ regeneration for glycolysis continuation'
            ],
            'Pyruvate Oxidation': [
                'Conversion to acetyl-CoA',
                'Production of CO₂ and NADH',
                'Pyruvate dehydrogenase complex'
            ],
            'Electron Carriers (NADH/FADH₂)': [
                'Role in electron transport',
                'Why NADH yields ~2.5 ATP vs FADH₂ ~1.5 ATP',
                'Reduction and oxidation in metabolic pathways'
            ],
            'Mitochondria': [
                'Structure: matrix, inner membrane, intermembrane space',
                'Location of each respiration stage',
                'Proton gradient across inner membrane'
            ],
            'General Cellular Respiration': [
                'Overall equation: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP',
                'Four main stages and their locations',
                'Aerobic vs. anaerobic respiration'
            ]
        };
        
        return concepts[topic] || [
            'Review the basic concepts of this topic',
            'Understand how it relates to cellular respiration',
            'Practice problems focusing on this area'
        ];
    }
    
    formatAIResponse(response) {
        // Convert markdown-style formatting to HTML
        return response
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>\n?)+/g, '<ol>$&</ol>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>');
    }
    
    categorizeWrongAnswers() {
        const topics = {};
        
        this.wrongAnswers.forEach(item => {
            // Categorize based on keywords in the question
            let topic = 'General Cellular Respiration';
            
            const questionLower = item.question.toLowerCase();
            
            if (questionLower.includes('glycolysis')) {
                topic = 'Glycolysis';
            } else if (questionLower.includes('citric acid') || questionLower.includes('krebs') || questionLower.includes('tca')) {
                topic = 'Citric Acid Cycle (Krebs Cycle)';
            } else if (questionLower.includes('electron transport') || questionLower.includes('oxidative phosphorylation') || questionLower.includes('etc')) {
                topic = 'Electron Transport Chain & Oxidative Phosphorylation';
            } else if (questionLower.includes('atp')) {
                topic = 'ATP Production & Energy';
            } else if (questionLower.includes('fermentation')) {
                topic = 'Fermentation';
            } else if (questionLower.includes('pyruvate')) {
                topic = 'Pyruvate Oxidation';
            } else if (questionLower.includes('nadh') || questionLower.includes('fadh')) {
                topic = 'Electron Carriers (NADH/FADH₂)';
            } else if (questionLower.includes('mitochond')) {
                topic = 'Mitochondria';
            }
            
            if (!topics[topic]) {
                topics[topic] = [];
            }
            topics[topic].push(item);
        });
        
        return topics;
    }
    
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    closeResults() {
        this.resultsModal.classList.add('hidden');
    }

    restartQuiz() {
        this.resultsModal.classList.add('hidden');
        
        // Optimal quiz length for engagement (game theory)
        const OPTIMAL_QUIZ_LENGTH = 6; // Sweet spot between 5-7 questions
        
        // Build the quiz pool with progressive difficulty
        this.availableQuestions = this.selectQuestionsWithProgression(OPTIMAL_QUIZ_LENGTH);
        
        // Check if questions are loaded
        if (!this.availableQuestions || this.availableQuestions.length === 0) {
            this.addChatMessage('Soobin', 'No questions available to practice! 📚');
            return;
        }
        
        // Reset quiz state
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.selectedAnswer = null;
        this.isAnswerSubmitted = false;
        this.currentMemberIndex = 0;
        this.wrongAnswers = []; // Reset wrong answers
        
        // Clear chat except welcome message
        const messages = this.chatContainer.querySelectorAll('.chat-message');
        if (messages.length > 1) {
            for (let i = messages.length - 1; i > 0; i--) {
                messages[i].remove();
            }
        }
        
        // Show the answer section
        this.answerSection.classList.remove('hidden');
        
        // Show quiz composition with difficulty info
        const difficultyComposition = this.getDifficultyComposition();
        this.addChatMessage('Taehyun', 
            `Round 2! ${this.availableQuestions.length} questions: ${difficultyComposition}. Based on your performance, we're adjusting the difficulty! 🔥`
        );
        
        this.updateProgress();
        this.showQuestion();
    }
    
    selectQuestionsWithProgression(targetLength) {
        const selectedQuestions = [];
        const wrongQuestionIds = this.loadWrongQuestions();
        
        // Group questions by topic and difficulty
        const questionsByTopicAndDifficulty = {};
        this.questions.forEach(q => {
            const topic = q.topic || 'General Cellular Respiration';
            const difficulty = q.difficulty || 'Medium';
            
            if (!questionsByTopicAndDifficulty[topic]) {
                questionsByTopicAndDifficulty[topic] = {
                    Easy: [],
                    Medium: [],
                    Hard: []
                };
            }
            questionsByTopicAndDifficulty[topic][difficulty].push(q);
        });
        
        // Get unique topics
        const topics = Object.keys(questionsByTopicAndDifficulty);
        
        // Select questions with progressive difficulty
        let attempts = 0;
        while (selectedQuestions.length < targetLength && attempts < 100) {
            attempts++;
            
            // Rotate through topics for variety
            const topic = topics[attempts % topics.length];
            const recommendedDifficulty = this.getRecommendedDifficulty(topic);
            
            // Get questions for this topic at the recommended difficulty
            let candidateQuestions = questionsByTopicAndDifficulty[topic][recommendedDifficulty] || [];
            
            // If no questions at recommended difficulty, try adjacent difficulties
            if (candidateQuestions.length === 0) {
                const diffIndex = this.difficultyLevels.indexOf(recommendedDifficulty);
                if (diffIndex > 0) {
                    candidateQuestions = questionsByTopicAndDifficulty[topic][this.difficultyLevels[diffIndex - 1]] || [];
                }
                if (candidateQuestions.length === 0 && diffIndex < this.difficultyLevels.length - 1) {
                    candidateQuestions = questionsByTopicAndDifficulty[topic][this.difficultyLevels[diffIndex + 1]] || [];
                }
            }
            
            // Filter to prioritize unseen and wrong questions
            const unseenCandidates = candidateQuestions.filter(q => 
                !this.solvedQuestions.includes(this.getQuestionId(q)) &&
                !selectedQuestions.some(sq => sq.question === q.question)
            );
            
            const wrongCandidates = candidateQuestions.filter(q => 
                wrongQuestionIds.includes(this.getQuestionId(q)) &&
                !selectedQuestions.some(sq => sq.question === q.question)
            );
            
            // Select a question
            let selectedQuestion = null;
            if (unseenCandidates.length > 0) {
                selectedQuestion = unseenCandidates[Math.floor(Math.random() * unseenCandidates.length)];
            } else if (wrongCandidates.length > 0) {
                selectedQuestion = wrongCandidates[Math.floor(Math.random() * wrongCandidates.length)];
            } else if (candidateQuestions.length > 0) {
                // Fall back to any question from this topic/difficulty
                const available = candidateQuestions.filter(q => 
                    !selectedQuestions.some(sq => sq.question === q.question)
                );
                if (available.length > 0) {
                    selectedQuestion = available[Math.floor(Math.random() * available.length)];
                }
            }
            
            if (selectedQuestion) {
                selectedQuestions.push(selectedQuestion);
            }
        }
        
        // If we still need more questions, add from any available
        if (selectedQuestions.length < targetLength) {
            const remaining = this.questions.filter(q => 
                !selectedQuestions.some(sq => sq.question === q.question)
            );
            this.shuffleArray(remaining);
            const needed = targetLength - selectedQuestions.length;
            selectedQuestions.push(...remaining.slice(0, needed));
        }
        
        // Shuffle for variety
        this.shuffleArray(selectedQuestions);
        
        return selectedQuestions;
    }
    
    // Progressive difficulty methods
    loadTopicPerformance() {
        const saved = localStorage.getItem('ap_bio_topic_performance');
        return saved ? JSON.parse(saved) : {};
    }
    
    saveTopicPerformance() {
        localStorage.setItem('ap_bio_topic_performance', JSON.stringify(this.topicPerformance));
    }
    
    updateTopicPerformance(topic, difficulty, isCorrect) {
        if (!this.topicPerformance[topic]) {
            this.topicPerformance[topic] = {
                Easy: { correct: 0, total: 0 },
                Medium: { correct: 0, total: 0 },
                Hard: { correct: 0, total: 0 },
                currentLevel: 'Easy'
            };
        }
        
        const perf = this.topicPerformance[topic];
        perf[difficulty].total++;
        if (isCorrect) {
            perf[difficulty].correct++;
        }
        
        // Calculate success rate for current difficulty
        const successRate = perf[difficulty].total > 0 ? 
            perf[difficulty].correct / perf[difficulty].total : 0;
        
        // Progress to next difficulty if success rate is high enough
        if (successRate >= this.progressionThreshold && perf[difficulty].total >= 2) {
            const currentIndex = this.difficultyLevels.indexOf(difficulty);
            if (currentIndex < this.difficultyLevels.length - 1) {
                perf.currentLevel = this.difficultyLevels[currentIndex + 1];
            }
        }
        
        // Regress if struggling (below 40% success rate with at least 3 attempts)
        if (successRate < 0.4 && perf[difficulty].total >= 3) {
            const currentIndex = this.difficultyLevels.indexOf(difficulty);
            if (currentIndex > 0) {
                perf.currentLevel = this.difficultyLevels[currentIndex - 1];
            }
        }
        
        this.saveTopicPerformance();
    }
    
    getRecommendedDifficulty(topic) {
        if (!this.topicPerformance[topic]) {
            return 'Easy'; // Start with Easy for new topics
        }
        return this.topicPerformance[topic].currentLevel;
    }
    
    getDifficultyComposition() {
        const counts = { Easy: 0, Medium: 0, Hard: 0 };
        this.availableQuestions.forEach(q => {
            const difficulty = q.difficulty || 'Medium';
            counts[difficulty]++;
        });
        
        const parts = [];
        if (counts.Easy > 0) parts.push(`${counts.Easy} Easy`);
        if (counts.Medium > 0) parts.push(`${counts.Medium} Medium`);
        if (counts.Hard > 0) parts.push(`${counts.Hard} Hard`);
        
        return parts.join(', ') || 'Mixed difficulty';
    }
    
    // Helper methods for storing and retrieving solved questions
    getQuestionId(question) {
        // Create a unique identifier for each question based on its content
        // Use a simple hash function that handles Unicode characters
        const str = question.question || question.Question || '';
        let hash = 0;
        for (let i = 0; i < Math.min(str.length, 50); i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return 'q_' + Math.abs(hash).toString(36);
    }
    
    loadSolvedQuestions() {
        const saved = localStorage.getItem('ap_bio_solved_questions');
        return saved ? JSON.parse(saved) : [];
    }
    
    saveSolvedQuestions() {
        localStorage.setItem('ap_bio_solved_questions', JSON.stringify(this.solvedQuestions));
    }
    
    loadWrongQuestions() {
        const saved = localStorage.getItem('ap_bio_wrong_questions');
        return saved ? JSON.parse(saved) : [];
    }
    
    saveWrongQuestions() {
        // Save the IDs of questions that were answered incorrectly
        const wrongQuestionIds = this.wrongAnswers.map(item => {
            const question = this.questions.find(q => q.question === item.question);
            return question ? this.getQuestionId(question) : null;
        }).filter(id => id !== null);
        
        // Merge with existing wrong questions (avoid duplicates)
        const existingWrong = this.loadWrongQuestions();
        const allWrong = [...new Set([...existingWrong, ...wrongQuestionIds])];
        
        // Remove questions that were just answered correctly
        const correctlyAnswered = this.availableQuestions
            .filter((q, index) => {
                const questionNumber = index + 1;
                const wasWrong = this.wrongAnswers.some(w => w.questionNumber === questionNumber);
                return !wasWrong;
            })
            .map(q => this.getQuestionId(q));
        
        const updatedWrong = allWrong.filter(id => !correctlyAnswered.includes(id));
        
        localStorage.setItem('ap_bio_wrong_questions', JSON.stringify(updatedWrong));
    }
    
    shuffleArray(array) {
        // Fisher-Yates shuffle algorithm
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    resetProgress() {
        // Method to reset all saved progress
        localStorage.removeItem('ap_bio_solved_questions');
        localStorage.removeItem('ap_bio_wrong_questions');
        this.solvedQuestions = [];
        this.addChatMessage('Soobin', 'All progress has been reset! Starting fresh! 🌟');
    }
}

// Initialize the app when DOM is loaded
// Initialize the app and make it globally accessible
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new QuizApp();
    // Also expose it on window for easier debugging
    window.app = app;
});