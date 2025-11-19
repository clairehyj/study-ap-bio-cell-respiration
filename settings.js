// Settings Management
class SettingsManager {
    constructor() {
        this.apiKeyInput = document.getElementById('apiKey');
        this.toggleBtn = document.getElementById('toggleVisibility');
        this.saveBtn = document.getElementById('saveApiKey');
        this.testBtn = document.getElementById('testApiKey');
        this.clearBtn = document.getElementById('clearApiKey');
        this.statusDiv = document.getElementById('apiKeyStatus');
        this.showExplanations = document.getElementById('showExplanations');
        this.enableAI = document.getElementById('enableAI');
        
        this.loadSettings();
        this.attachEventListeners();
    }
    
    loadSettings() {
        // Load API key from localStorage
        const savedKey = localStorage.getItem('openai_api_key');
        if (savedKey) {
            this.apiKeyInput.value = savedKey;
            this.showStatus('API key loaded from storage', 'success');
        }
        
        // Load preferences
        const showExplanations = localStorage.getItem('show_explanations');
        if (showExplanations !== null) {
            this.showExplanations.checked = showExplanations === 'true';
        }
        
        const enableAI = localStorage.getItem('enable_ai');
        if (enableAI !== null) {
            this.enableAI.checked = enableAI === 'true';
        }
    }
    
    attachEventListeners() {
        // Toggle API key visibility
        this.toggleBtn.addEventListener('click', () => {
            const type = this.apiKeyInput.type === 'password' ? 'text' : 'password';
            this.apiKeyInput.type = type;
            this.toggleBtn.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
        });
        
        // Save API key
        this.saveBtn.addEventListener('click', () => this.saveApiKey());
        
        // Test API key
        this.testBtn.addEventListener('click', () => this.testApiKey());
        
        // Clear API key
        this.clearBtn.addEventListener('click', () => this.clearApiKey());
        
        // Save preferences on change
        this.showExplanations.addEventListener('change', () => {
            localStorage.setItem('show_explanations', this.showExplanations.checked);
        });
        
        this.enableAI.addEventListener('change', () => {
            localStorage.setItem('enable_ai', this.enableAI.checked);
        });
    }
    
    saveApiKey() {
        const apiKey = this.apiKeyInput.value.trim();
        
        if (!apiKey) {
            this.showStatus('Please enter an API key', 'error');
            return;
        }
        
        if (!apiKey.startsWith('sk-')) {
            this.showStatus('Invalid API key format. It should start with "sk-"', 'error');
            return;
        }
        
        localStorage.setItem('openai_api_key', apiKey);
        this.showStatus('API key saved successfully! 🎉', 'success');
    }
    
    async testApiKey() {
        const apiKey = this.apiKeyInput.value.trim();
        
        if (!apiKey) {
            this.showStatus('Please enter an API key first', 'error');
            return;
        }
        
        this.showStatus('Testing API key...', 'info');
        this.testBtn.disabled = true;
        
        try {
            const response = await fetch('https://api.openai.com/v1/models', {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });
            
            if (response.ok) {
                this.showStatus('✅ API key is valid and working!', 'success');
                // Auto-save if test is successful
                localStorage.setItem('openai_api_key', apiKey);
            } else {
                const error = await response.json().catch(() => ({}));
                this.showStatus(`❌ API key test failed: ${error.error?.message || 'Invalid key'}`, 'error');
            }
        } catch (error) {
            this.showStatus(`❌ Connection error: ${error.message}`, 'error');
        } finally {
            this.testBtn.disabled = false;
        }
    }
    
    clearApiKey() {
        if (confirm('Are you sure you want to clear the API key?')) {
            localStorage.removeItem('openai_api_key');
            this.apiKeyInput.value = '';
            this.showStatus('API key cleared', 'info');
        }
    }
    
    showStatus(message, type) {
        this.statusDiv.textContent = message;
        this.statusDiv.className = `status-message ${type}`;
        
        // Auto-hide after 5 seconds for non-error messages
        if (type !== 'error') {
            setTimeout(() => {
                this.statusDiv.textContent = '';
                this.statusDiv.className = 'status-message';
            }, 5000);
        }
    }
}

// Initialize settings manager when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SettingsManager();
});