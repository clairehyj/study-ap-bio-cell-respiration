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
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.selectedAnswer = null;
        this.isAnswerSubmitted = false;
        this.currentMemberIndex = 0;
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadData();
    }

    initializeElements() {
        // Chat and display elements
        this.chatContainer = document.getElementById('chatContainer');
        
        // Control buttons
        this.startBtn = document.getElementById('startBtn');
        this.submitBtn = document.getElementById('submitBtn');
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
    }

    attachEventListeners() {
        this.startBtn.addEventListener('click', () => this.startQuiz());
        this.submitBtn.addEventListener('click', () => this.submitAnswer());
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
        this.restartBtn.addEventListener('click', () => this.restartQuiz());
        this.closeModal.addEventListener('click', () => this.closeResults());
    }

    async loadData() {
        this.loadingIndicator.classList.remove('hidden');
        
        try {
            // Load both CSV files
            const [questionsResponse, messagesResponse] = await Promise.all([
                fetch('questions.csv'),
                fetch('messages.csv')
            ]);
            
            const questionsText = await questionsResponse.text();
            const messagesText = await messagesResponse.text();
            
            console.log('Questions CSV loaded, length:', questionsText.length);
            console.log('Messages CSV loaded, length:', messagesText.length);
            
            this.questions = this.parseQuestionsCSV(questionsText);
            this.parseMessagesCSV(messagesText);
            
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
            this.loadingIndicator.classList.add('hidden');
            this.addChatMessage('Soobin', 'Oh no! I couldn\'t load the quiz data. Please refresh the page! 😢');
        }
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
                    explanation: values[6]
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
        // Check if questions are loaded
        if (!this.questions || this.questions.length === 0) {
            this.addChatMessage('Soobin', 'Please wait, still loading questions... 📚');
            return;
        }
        
        this.startBtn.classList.add('hidden');
        this.answerSection.classList.remove('hidden');
        this.currentQuestionIndex = 0;
        this.score = 0;
        
        // Add a welcome message if available
        if (encouragingMessages.welcome && encouragingMessages.welcome.length > 0) {
            const welcomeMsg = encouragingMessages.welcome[Math.floor(Math.random() * encouragingMessages.welcome.length)];
            this.addChatMessage(welcomeMsg.member, welcomeMsg.message);
        }
        
        this.updateProgress();
        this.showQuestion();
    }

    showQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.showResults();
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        const member = txtMembers[this.currentMemberIndex % txtMembers.length];
        
        // Clear previous answers
        this.selectedAnswer = null;
        this.isAnswerSubmitted = false;
        this.submitBtn.classList.add('hidden');
        this.nextBtn.classList.add('hidden');
        
        // Add TXT member asking the question
        this.addChatMessage(
            member.name,
            `Question ${this.currentQuestionIndex + 1}: ${question.question}`,
            true
        );
        
        // Display answer options
        this.displayAnswerOptions(question.options);
        
        // Rotate to next member for next question
        this.currentMemberIndex++;
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
        this.submitBtn.classList.remove('hidden');
    }

    submitAnswer() {
        if (!this.selectedAnswer || this.isAnswerSubmitted) return;
        
        this.isAnswerSubmitted = true;
        this.submitBtn.classList.add('hidden');
        
        const question = this.questions[this.currentQuestionIndex];
        const isCorrect = this.selectedAnswer === question.answer;
        
        if (isCorrect) {
            this.score++;
        }
        
        // Mark answers as correct or incorrect
        document.querySelectorAll('.answer-option').forEach(opt => {
            const optionLabel = opt.querySelector('.option-label').textContent.replace(')', '');
            
            if (optionLabel === question.answer) {
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
                }, 1000);
            }
            
            this.nextBtn.classList.remove('hidden');
        }, 500);
        
        this.updateProgress();
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        
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

    updateProgress() {
        const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
        this.progressFill.style.width = `${progress}%`;
        
        this.questionNumber.textContent = `Question ${this.currentQuestionIndex + 1} of ${this.questions.length}`;
        this.scoreDisplay.textContent = `Score: ${this.score}`;
    }

    showResults() {
        // Handle case where no questions were answered
        if (!this.questions || this.questions.length === 0) {
            this.scoreCircle.querySelector('.score-percent').textContent = '0%';
            this.resultsMessage.textContent = 'No questions loaded. Please refresh and try again!';
            this.resultsModal.classList.remove('hidden');
            return;
        }
        
        const percentage = Math.round((this.score / this.questions.length) * 100);
        
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
        
        // Show modal
        this.resultsModal.classList.remove('hidden');
        
        // Hide quiz controls
        this.answerSection.classList.add('hidden');
        this.nextBtn.classList.add('hidden');
    }

    closeResults() {
        this.resultsModal.classList.add('hidden');
    }

    restartQuiz() {
        this.resultsModal.classList.add('hidden');
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.selectedAnswer = null;
        this.isAnswerSubmitted = false;
        this.currentMemberIndex = 0;
        
        // Clear chat except welcome message
        const messages = this.chatContainer.querySelectorAll('.chat-message');
        if (messages.length > 1) {
            for (let i = messages.length - 1; i > 0; i--) {
                messages[i].remove();
            }
        }
        
        this.updateProgress();
        this.showQuestion();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new QuizApp();
});