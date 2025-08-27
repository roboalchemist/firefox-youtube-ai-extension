/**
 * YouTube Already Watched - Options Page Script
 * Handles saving and loading extension settings
 */

// Default settings
const DEFAULT_SETTINGS = {
    apiKey: '',
    model: 'google/gemini-2.5-flash-lite',
    summaryPrompt: 'Please provide a concise and informative summary of this video transcript. Focus on the main points, key insights, and important information. Structure the summary with clear sections if the video covers multiple topics. Keep it engaging and easy to understand.',
    enableSummary: true,
    autoExtractTranscript: true
};

/**
 * Load settings from storage and populate form
 */
async function loadSettings() {
    try {
        const settings = await browser.storage.sync.get(DEFAULT_SETTINGS);
        
        // Populate form fields
        document.getElementById('apiKey').value = settings.apiKey || '';
        document.getElementById('model').value = settings.model || DEFAULT_SETTINGS.model;
        document.getElementById('summaryPrompt').value = settings.summaryPrompt || DEFAULT_SETTINGS.summaryPrompt;
        document.getElementById('enableSummary').checked = settings.enableSummary !== false;
        document.getElementById('autoExtractTranscript').checked = settings.autoExtractTranscript !== false;
        
        console.log('Settings loaded successfully');
    } catch (error) {
        console.error('Error loading settings:', error);
        showStatus('Error loading settings', 'error');
    }
}

/**
 * Save settings to storage
 */
async function saveSettings(event) {
    event.preventDefault();
    
    const saveButton = document.getElementById('saveButton');
    const originalText = saveButton.textContent;
    
    try {
        // Show saving state
        saveButton.disabled = true;
        saveButton.textContent = '💾 Saving...';
        
        // Get form values
        const settings = {
            apiKey: document.getElementById('apiKey').value.trim(),
            model: document.getElementById('model').value,
            summaryPrompt: document.getElementById('summaryPrompt').value.trim(),
            enableSummary: document.getElementById('enableSummary').checked,
            autoExtractTranscript: document.getElementById('autoExtractTranscript').checked
        };
        
        // Validate settings
        if (settings.enableSummary && !settings.apiKey) {
            throw new Error('API Key is required when summary feature is enabled');
        }
        
        if (!settings.summaryPrompt) {
            throw new Error('Summary prompt cannot be empty');
        }
        
        // Save to storage
        await browser.storage.sync.set(settings);
        
        console.log('Settings saved successfully:', settings);
        showStatus('✅ Settings saved successfully!', 'success');
        
        // Reset button after delay
        setTimeout(() => {
            saveButton.disabled = false;
            saveButton.textContent = originalText;
        }, 2000);
        
    } catch (error) {
        console.error('Error saving settings:', error);
        showStatus(`❌ Error: ${error.message}`, 'error');
        
        // Reset button
        saveButton.disabled = false;
        saveButton.textContent = originalText;
    }
}

/**
 * Show status message
 */
function showStatus(message, type) {
    const statusElement = document.getElementById('statusMessage');
    statusElement.textContent = message;
    statusElement.className = `status-message ${type}`;
    statusElement.style.display = 'block';
    
    // Hide after 5 seconds
    setTimeout(() => {
        statusElement.style.display = 'none';
    }, 5000);
}

/**
 * Test API key functionality
 */
async function testApiKey() {
    const apiKey = document.getElementById('apiKey').value.trim();
    const model = document.getElementById('model').value;
    
    if (!apiKey) {
        showStatus('Please enter an API key first', 'error');
        return;
    }
    
    try {
        showStatus('🔄 Testing API key...', 'info');
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'user',
                        content: 'Hello, this is a test message. Please respond with "API test successful".'
                    }
                ],
                max_tokens: 50
            })
        });
        
        if (response.ok) {
            showStatus('✅ API key is working correctly!', 'success');
        } else {
            const error = await response.text();
            showStatus(`❌ API test failed: ${response.status} ${error}`, 'error');
        }
    } catch (error) {
        console.error('API test error:', error);
        showStatus(`❌ API test failed: ${error.message}`, 'error');
    }
}

/**
 * Handle form validation in real-time
 */
function setupValidation() {
    const apiKeyInput = document.getElementById('apiKey');
    const enableSummaryCheck = document.getElementById('enableSummary');
    
    // Validate API key format
    apiKeyInput.addEventListener('input', function() {
        const value = this.value.trim();
        if (value && !value.startsWith('sk-or-v1-')) {
            this.style.borderColor = '#dc3545';
        } else {
            this.style.borderColor = '#ddd';
        }
    });
    
    // Enable/disable API key field based on summary feature
    enableSummaryCheck.addEventListener('change', function() {
        apiKeyInput.disabled = !this.checked;
        if (!this.checked) {
            apiKeyInput.style.borderColor = '#ddd';
        }
    });
}

/**
 * Initialize the options page
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Options page loaded');
    
    // Load existing settings
    loadSettings();
    
    // Setup form validation
    setupValidation();
    
    // Bind form submission
    document.getElementById('settingsForm').addEventListener('submit', saveSettings);
    
    // Add test API button if needed
    const apiKeyInput = document.getElementById('apiKey');
    const testButton = document.createElement('button');
    testButton.type = 'button';
    testButton.textContent = '🧪 Test API Key';
    testButton.style.marginTop = '10px';
    testButton.style.padding = '8px 16px';
    testButton.style.backgroundColor = '#28a745';
    testButton.style.color = 'white';
    testButton.style.border = 'none';
    testButton.style.borderRadius = '4px';
    testButton.style.cursor = 'pointer';
    testButton.style.fontSize = '12px';
    
    testButton.addEventListener('click', testApiKey);
    apiKeyInput.parentNode.appendChild(testButton);
    
    console.log('Options page initialized');
});

/**
 * Handle storage changes from other parts of the extension
 */
if (typeof browser !== 'undefined' && browser.storage) {
    browser.storage.onChanged.addListener((changes, area) => {
        if (area === 'sync') {
            console.log('Settings changed externally, reloading...');
            loadSettings();
        }
    });
}
