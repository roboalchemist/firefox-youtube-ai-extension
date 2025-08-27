/**
 * YouTube Already Watched - Popup Script
 * Handles the browser action popup interface
 */

/**
 * Initialize the popup
 */
document.addEventListener('DOMContentLoaded', async function() {
    console.log('YouTube Already Watched: Popup loaded');
    
    // Load and display extension status
    await updateStatus();
    
    // Setup button event listeners
    setupButtons();
});

/**
 * Update the status display based on current settings
 */
async function updateStatus() {
    const statusElement = document.getElementById('summaryStatus');
    const statusText = document.getElementById('statusText');
    
    try {
        // Get current settings
        const settings = await browser.storage.sync.get({
            enableSummary: true,
            apiKey: '',
            model: 'google/gemini-2.5-flash-lite'
        });
        
        if (!settings.enableSummary) {
            statusElement.className = 'status disabled';
            statusText.textContent = '⚠️ Summary feature is disabled';
        } else if (!settings.apiKey) {
            statusElement.className = 'status disabled';
            statusText.textContent = '🔑 API key required for summaries';
        } else {
            statusElement.className = 'status enabled';
            statusText.textContent = `✅ Ready with ${getModelDisplayName(settings.model)}`;
        }
        
    } catch (error) {
        console.error('Error loading status:', error);
        statusElement.className = 'status disabled';
        statusText.textContent = '❌ Error loading configuration';
    }
}

/**
 * Get a user-friendly display name for the model
 */
function getModelDisplayName(model) {
    const modelNames = {
        'google/gemini-2.5-flash-lite': 'Gemini 2.5 Flash Lite',
        'google/gemini-2.0-flash-exp': 'Gemini 2.0 Flash',
        'anthropic/claude-3.5-sonnet': 'Claude 3.5 Sonnet',
        'openai/gpt-4o': 'GPT-4o',
        'openai/gpt-4o-mini': 'GPT-4o Mini'
    };
    
    return modelNames[model] || model;
}

/**
 * Setup button event listeners
 */
function setupButtons() {
    // Open Settings button
    document.getElementById('openSettings').addEventListener('click', function() {
        browser.runtime.openOptionsPage();
        window.close();
    });
    
    // Test Feature button
    document.getElementById('testFeature').addEventListener('click', function() {
        browser.tabs.create({ url: 'https://www.youtube.com' });
        window.close();
    });
    
    // View Stats button
    document.getElementById('viewStats').addEventListener('click', async function() {
        try {
            // Get watched videos from storage
            const data = await browser.storage.local.get('watchedVideos');
            const watchedCount = data.watchedVideos ? data.watchedVideos.length : 0;
            
            // Show stats in a simple alert for now
            alert(`Extension Stats:\n\n📺 Videos marked as watched: ${watchedCount}\n\n💡 Tip: Use the summary feature to quickly understand video content before marking as watched!`);
            
        } catch (error) {
            console.error('Error getting stats:', error);
            alert('Unable to load extension statistics.');
        }
    });
}

/**
 * Handle storage changes to update status in real-time
 */
if (typeof browser !== 'undefined' && browser.storage) {
    browser.storage.onChanged.addListener((changes, area) => {
        if (area === 'sync' && (changes.enableSummary || changes.apiKey || changes.model)) {
            updateStatus();
        }
    });
}
