/**
 * YouTube Already Watched Extension
 * Adds "already watched" buttons to video thumbnails
 */

(function() {
    'use strict';
    
    console.log('YouTube Already Watched Extension: Loading...');
    
    // Store clicked video IDs to persist across page navigation
    const watchedVideos = new Set();
    
    // Observer to detect new videos being loaded
    let observer;
    
    /**
     * Extracts video ID from various YouTube URL formats
     */
    function getVideoId(url) {
        if (!url) return null;
        
        const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^&\n?#]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }
    
    /**
     * Creates the "already watched" button
     */
    function createAlreadyWatchedButton(videoId, thumbnailElement) {
        const button = document.createElement('button');
        button.className = 'yt-ai-button already-watched-btn';
        button.setAttribute('data-tooltip', 'Mark as already watched');
        button.setAttribute('data-video-id', videoId);
        button.innerHTML = '✓';
        
        // Check if this video was already marked
        if (watchedVideos.has(videoId)) {
            button.classList.add('clicked');
            button.setAttribute('data-tooltip', 'Already watched');
            button.innerHTML = '👁';
        }
        
        button.addEventListener('click', function(e) {
            console.log('YouTube Already Watched: Button clicked!', videoId);
            e.preventDefault();
            e.stopPropagation();
            handleAlreadyWatchedClick(videoId, button);
        });
        
        return button;
    }
    
    /**
     * Creates a summary button for a video
     */
    function createSummaryButton(videoId, thumbnailElement) {
        const button = document.createElement('button');
        button.className = 'yt-ai-button summary-btn';
        button.setAttribute('data-tooltip', 'Get AI summary');
        button.setAttribute('data-video-id', videoId);
        button.innerHTML = '📄';
        
        button.addEventListener('click', function(e) {
            console.log('YouTube AI Summary: Button clicked!', videoId);
            e.preventDefault();
            e.stopPropagation();
            handleSummaryClick(videoId, button);
        });
        
        return button;
    }
    
    /**
     * Handles the "already watched" button click
     */
    function handleAlreadyWatchedClick(videoId, button) {
        console.log('YouTube Already Watched: handleAlreadyWatchedClick called for video:', videoId);
        
        // Toggle the watched state
        if (watchedVideos.has(videoId)) {
            console.log('YouTube Already Watched: Removing from watched list');
            watchedVideos.delete(videoId);
            button.classList.remove('clicked');
            button.setAttribute('data-tooltip', 'Mark as already watched');
        } else {
            console.log('YouTube Already Watched: Adding to watched list');
            watchedVideos.add(videoId);
            button.classList.add('clicked');
            button.setAttribute('data-tooltip', 'Already watched');
            
            // Try to click the "Not interested" option
            markAsNotInterested(button);
        }
    }
    
    /**
     * Attempts to mark the video as "Not interested" via YouTube's menu
     */
    function markAsNotInterested(buttonElement) {
        try {
            console.log('YouTube Already Watched: Starting automation sequence...');
            
            // Find the parent video container
            const videoContainer = buttonElement.closest('ytd-rich-item-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer');
            if (!videoContainer) {
                console.log('YouTube Already Watched: Could not find video container');
                return;
            }
            
            // Find the three-dot menu button with multiple selectors
            let menuButton = videoContainer.querySelector('button[aria-label*="Action menu"]');
            if (!menuButton) {
                menuButton = videoContainer.querySelector('button[aria-label*="More actions"]');
            }
            if (!menuButton) {
                menuButton = videoContainer.querySelector('button[aria-haspopup="true"]');
            }
            if (!menuButton) {
                menuButton = videoContainer.querySelector('#button[aria-label*="More actions"]');
            }
            
            if (!menuButton) {
                console.log('YouTube Already Watched: Could not find menu button');
                return;
            }
            
            console.log('YouTube Already Watched: Found menu button, clicking...');
            
            // Click the menu button
            menuButton.click();
            
            // Wait for menu to appear and find "Not interested" option
            setTimeout(() => {
                console.log('YouTube Already Watched: Looking for "Not interested" option...');
                
                // Try multiple selectors for "Not interested"
                let notInterestedOption = null;
                
                // Try different ways to find the "Not interested" option
                const menuItems = document.querySelectorAll('ytd-menu-service-item-renderer, tp-yt-paper-item, [role="menuitem"]');
                for (const item of menuItems) {
                    const text = item.textContent?.toLowerCase() || '';
                    if (text.includes('not interested') || text.includes('don\'t recommend')) {
                        notInterestedOption = item;
                        break;
                    }
                }
                
                if (notInterestedOption) {
                    console.log('YouTube Already Watched: Found "Not interested", clicking...');
                    notInterestedOption.click();
                    
                    // Wait for the "Video removed" dialog and click "Tell us why"
                    setTimeout(() => {
                        console.log('YouTube Already Watched: Looking for "Tell us why" button...');
                        
                        // Look for "Tell us why" button in the dialog
                        let tellUsWhyButton = null;
                        const buttons = document.querySelectorAll('button, [role="button"]');
                        
                        for (const button of buttons) {
                            const text = button.textContent?.toLowerCase() || '';
                            if (text.includes('tell us why')) {
                                tellUsWhyButton = button;
                                break;
                            }
                        }
                        
                        if (tellUsWhyButton) {
                            console.log('YouTube Already Watched: Found "Tell us why", clicking...');
                            tellUsWhyButton.click();
                            
                            // Wait for the "Tell us why" dialog with checkboxes
                            setTimeout(() => {
                                console.log('YouTube Already Watched: Looking for "already watched" checkbox...');
                                
                                // Look for the checkbox or label for "I've already watched the video"
                                let alreadyWatchedOption = null;
                                
                                // Try to find by text content
                                const labels = document.querySelectorAll('label, [role="checkbox"], [role="option"]');
                                for (const label of labels) {
                                    const text = label.textContent?.toLowerCase() || '';
                                    if (text.includes('already watched') || text.includes('i\'ve already watched')) {
                                        alreadyWatchedOption = label;
                                        break;
                                    }
                                }
                                
                                // Also try finding elements that contain the text
                                if (!alreadyWatchedOption) {
                                    const allElements = document.querySelectorAll('*');
                                    for (const el of allElements) {
                                        const text = el.textContent?.toLowerCase() || '';
                                        if (text.includes('i\'ve already watched the video') && !text.includes('i don\'t like')) {
                                            // Find clickable parent (checkbox or container)
                                            alreadyWatchedOption = el.closest('[role="checkbox"]') || el.closest('label') || el;
                                            break;
                                        }
                                    }
                                }
                                
                                if (alreadyWatchedOption) {
                                    console.log('YouTube Already Watched: Found "already watched" option, clicking...');
                                    alreadyWatchedOption.click();
                                    
                                    // Wait a bit and try to click Submit
                                    setTimeout(() => {
                                        console.log('YouTube Already Watched: Looking for Submit button...');
                                        const submitButtons = document.querySelectorAll('button, [role="button"]');
                                        for (const button of submitButtons) {
                                            const text = button.textContent?.toLowerCase() || '';
                                            if (text.includes('submit')) {
                                                console.log('YouTube Already Watched: Found Submit button, clicking...');
                                                button.click();
                                                console.log('YouTube Already Watched: Automation sequence completed!');
                                                break;
                                            }
                                        }
                                    }, 300);
                                } else {
                                    console.log('YouTube Already Watched: Could not find "already watched" checkbox');
                                }
                            }, 500);
                        } else {
                            console.log('YouTube Already Watched: Could not find "Tell us why" button');
                        }
                    }, 500);
                } else {
                    console.log('YouTube Already Watched: Could not find "Not interested" option');
                    // Close any open menu
                    document.addEventListener('click', function closeMenu(e) {
                        if (!e.target.closest('ytd-popup-container, tp-yt-iron-dropdown')) {
                            document.removeEventListener('click', closeMenu);
                        }
                    });
                    document.body.click();
                }
            }, 300);
        } catch (error) {
            console.log('YouTube Already Watched: Error in automation sequence:', error);
        }
    }
    
    /**
     * Handles the summary button click
     */
    async function handleSummaryClick(videoId, button) {
        console.log('YouTube AI Summary: Starting summary for video:', videoId);
        
        try {
            // Check if feature is enabled
            const settings = await getExtensionSettings();
            if (!settings.enableSummary) {
                showModal('Feature Disabled', 'The summary feature is disabled. Please enable it in the extension settings.', [
                    { text: 'Close', action: 'close', type: 'secondary' }
                ]);
                return;
            }
            
            if (!settings.apiKey) {
                showModal('API Key Required', 'Please configure your OpenRouter API key in the extension settings to use the summary feature.', [
                    { text: 'Open Settings', action: () => browser.runtime.openOptionsPage(), type: 'primary' },
                    { text: 'Close', action: 'close', type: 'secondary' }
                ]);
                return;
            }
            
            // Show loading modal
            const modal = showModal('🤖 Generating Summary', '', [], true);
            updateModalContent(modal, 'loading', 'Extracting video transcript...');
            
            // Set button to loading state
            button.classList.add('loading');
            button.innerHTML = '⏳';
            button.setAttribute('data-tooltip', 'Generating summary...');
            
            // Get video transcript
            const transcript = await extractVideoTranscript(videoId);
            if (!transcript) {
                throw new Error('Could not extract video transcript. The video may not have captions available.');
            }
            
            // Show transcript first
            updateModalContent(modal, 'transcript', transcript, videoId);
            
            // Wait a moment to let user see the transcript, then generate summary
            // Allow user to skip the wait with the skip button
            await new Promise(resolve => {
                const timer = setTimeout(resolve, 2000);
                const checkSkip = setInterval(() => {
                    if (modal.getAttribute('data-skip') === 'true') {
                        clearTimeout(timer);
                        clearInterval(checkSkip);
                        resolve();
                    }
                }, 100);
            });
            
            updateModalContent(modal, 'loading', 'Generating AI summary...');
            
            // Generate summary using OpenRouter API
            const summary = await generateSummary(transcript, settings);
            
            // Store transcript and summary in modal for later access
            modal.setAttribute('data-transcript', transcript);
            modal.setAttribute('data-summary', summary);
            
            // Show summary in modal
            updateModalContent(modal, 'summary', summary, videoId);
            
        } catch (error) {
            console.error('YouTube AI Summary: Error generating summary:', error);
            showModal('❌ Summary Error', `Failed to generate summary: ${error.message}`, [
                { text: 'Close', action: 'close', type: 'secondary' }
            ]);
        } finally {
            // Reset button state
            button.classList.remove('loading');
            button.innerHTML = '📄';
            button.setAttribute('data-tooltip', 'Get AI summary');
        }
    }
    
    /**
     * Extract video transcript from YouTube using modern methods inspired by youtube-caption-extractor
     */
    async function extractVideoTranscript(videoId) {
        try {
            console.log('YouTube AI Summary: Extracting transcript for video:', videoId);
            
            // Method 1: Try authenticated URL from current page
            const authenticatedUrl = await getAuthenticatedTranscriptUrl(videoId);
            if (authenticatedUrl) {
                console.log('YouTube AI Summary: Trying authenticated URL method');
                const result = await fetchTranscriptFromUrl(authenticatedUrl, videoId);
                if (result) return result;
            }
            
            // Method 2: Try engagement panel transcript API
            console.log('YouTube AI Summary: Trying engagement panel method');
            const engagementResult = await fetchTranscriptFromEngagementPanel(videoId);
            if (engagementResult) return engagementResult;
            
            // Method 3: Try direct timedtext API with various formats
            console.log('YouTube AI Summary: Trying direct API methods');
            const directResult = await fetchTranscriptDirect(videoId);
            if (directResult) return directResult;
            
            // Method 4: Fallback to page-based extraction
            console.log('YouTube AI Summary: Falling back to page-based extraction');
            return await extractTranscriptFromPage(videoId);
            
        } catch (error) {
            console.log('YouTube AI Summary: Transcript extraction failed:', error.message);
            return await extractTranscriptFromPage(videoId);
        }
    }
    
    /**
     * Fetch transcript from a given URL with proper error handling
     */
    async function fetchTranscriptFromUrl(url, videoId) {
        try {
            console.log('YouTube AI Summary: Fetching from URL:', url.substring(0, 100) + '...');
            
            const response = await fetch(url, {
                headers: {
                    'User-Agent': navigator.userAgent,
                    'Referer': `https://www.youtube.com/watch?v=${videoId}`,
                    'Accept': '*/*',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Origin': 'https://www.youtube.com',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'same-origin',
                    'Cache-Control': 'no-cache'
                },
                credentials: 'include'
            });
            
            if (!response.ok) {
                console.log('YouTube AI Summary: HTTP error:', response.status);
                return null;
            }
            
            const responseText = await response.text();
            console.log('YouTube AI Summary: Response length:', responseText.length);
            
            if (responseText.length === 0) {
                console.log('YouTube AI Summary: Empty response');
                return null;
            }
            
            // Try JSON parsing first
            try {
                const data = JSON.parse(responseText);
                if (data && data.events) {
                    return parseJsonTranscript(data.events);
                }
            } catch (e) {
                // Try XML parsing
                if (responseText.includes('<transcript>') || responseText.includes('<text')) {
                    return parseXmlTranscript(responseText);
                }
            }
            
            return null;
            
        } catch (error) {
            console.log('YouTube AI Summary: Error fetching from URL:', error.message);
            return null;
        }
    }
    
    /**
     * Try YouTube's engagement panel transcript API
     */
    async function fetchTranscriptFromEngagementPanel(videoId) {
        try {
            // This is based on the youtube-caption-extractor approach
            const apiUrl = 'https://www.youtube.com/youtubei/v1/get_transcript';
            
            const requestBody = {
                context: {
                    client: {
                        clientName: 'WEB',
                        clientVersion: '2.20250821.07.00'
                    }
                },
                params: btoa(`\n\x0b${videoId}`)
            };
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': navigator.userAgent,
                    'Origin': 'https://www.youtube.com',
                    'Referer': `https://www.youtube.com/watch?v=${videoId}`
                },
                body: JSON.stringify(requestBody),
                credentials: 'include'
            });
            
            if (!response.ok) {
                console.log('YouTube AI Summary: Engagement panel API failed:', response.status);
                return null;
            }
            
            const data = await response.json();
            
            // Parse the engagement panel response
            const transcriptData = data?.actions?.[0]?.updateEngagementPanelAction?.content?.transcriptRenderer?.content?.transcriptSearchPanelRenderer?.body?.transcriptSegmentListRenderer?.initialSegments;
            
            if (transcriptData && transcriptData.length > 0) {
                const transcript = transcriptData
                    .map(segment => segment?.transcriptSegmentRenderer?.snippet?.runs?.[0]?.text)
                    .filter(text => text)
                    .join(' ')
                    .replace(/\s+/g, ' ')
                    .trim();
                
                if (transcript.length > 0) {
                    console.log('YouTube AI Summary: Engagement panel transcript extracted, length:', transcript.length);
                    return transcript;
                }
            }
            
            return null;
            
        } catch (error) {
            console.log('YouTube AI Summary: Engagement panel error:', error.message);
            return null;
        }
    }
    
    /**
     * Try direct timedtext API calls with various parameters
     */
    async function fetchTranscriptDirect(videoId) {
        const formats = ['json3', 'srv3', 'vtt', ''];
        const languages = ['en', 'en-US', ''];
        
        for (const fmt of formats) {
            for (const lang of languages) {
                try {
                    let url = `https://www.youtube.com/api/timedtext?v=${videoId}`;
                    if (lang) url += `&lang=${lang}`;
                    if (fmt) url += `&fmt=${fmt}`;
                    
                    const result = await fetchTranscriptFromUrl(url, videoId);
                    if (result) {
                        console.log(`YouTube AI Summary: Direct API success with fmt=${fmt}, lang=${lang}`);
                        return result;
                    }
                } catch (e) {
                    // Continue to next format/language combination
                }
            }
        }
        
        return null;
    }
    
    /**
     * Parse JSON transcript events
     */
    function parseJsonTranscript(events) {
        try {
            const transcript = events
                .filter(event => event.segs)
                .map(event => 
                    event.segs.map(seg => seg.utf8).join('')
                )
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim();
            
            if (transcript.length > 0) {
                console.log('YouTube AI Summary: JSON transcript parsed, length:', transcript.length);
                return transcript;
            }
            
            return null;
        } catch (error) {
            console.log('YouTube AI Summary: Error parsing JSON transcript:', error.message);
            return null;
        }
    }
    
    /**
     * Get the authenticated transcript URL by fetching the video page
     */
    async function getAuthenticatedTranscriptUrl(videoId) {
        try {
            console.log('YouTube AI Summary: Getting authenticated URL for video:', videoId);
            console.log('YouTube AI Summary: Current page:', window.location.href);
            
            // Check if we're already on the video page
            if (window.location.pathname === '/watch') {
                const urlParams = new URLSearchParams(window.location.search);
                const currentVideoId = urlParams.get('v');
                
                if (currentVideoId === videoId) {
                    console.log('YouTube AI Summary: Already on video page, extracting from current page');
                    return await extractTranscriptUrlFromCurrentPage(videoId);
                }
            }
            
            // We're not on the video page, so we need to fetch it
            console.log('YouTube AI Summary: Fetching video page to get transcript data');
            const videoPageUrl = `https://www.youtube.com/watch?v=${videoId}`;
            
            const response = await fetch(videoPageUrl, {
                headers: {
                    'User-Agent': navigator.userAgent,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5'
                },
                credentials: 'include'
            });
            
            if (!response.ok) {
                console.log('YouTube AI Summary: Failed to fetch video page:', response.status);
                return null;
            }
            
            const html = await response.text();
            return await extractTranscriptUrlFromHtml(html, videoId);
            
        } catch (error) {
            console.log('YouTube AI Summary: Error getting authenticated URL:', error.message);
            return null;
        }
    }
    
    /**
     * Extract transcript URL from the current page
     */
    async function extractTranscriptUrlFromCurrentPage(videoId) {
        try {
            // First try window.ytInitialPlayerResponse
            if (window.ytInitialPlayerResponse) {
                console.log('YouTube AI Summary: Found window.ytInitialPlayerResponse');
                const url = extractCaptionUrlFromPlayerResponse(window.ytInitialPlayerResponse, videoId);
                if (url) return url;
            }
            
            // Then try script tags
            const scripts = document.querySelectorAll('script');
            for (const script of scripts) {
                if (script.textContent && script.textContent.includes('ytInitialPlayerResponse')) {
                    const text = script.textContent;
                    const match = text.match(/var ytInitialPlayerResponse = ({.*?});/);
                    if (match) {
                        try {
                            const playerResponse = JSON.parse(match[1]);
                            console.log('YouTube AI Summary: Found ytInitialPlayerResponse in script');
                            const url = extractCaptionUrlFromPlayerResponse(playerResponse, videoId);
                            if (url) return url;
                        } catch (parseError) {
                            console.log('YouTube AI Summary: Error parsing player response:', parseError.message);
                        }
                    }
                }
            }
            
            return null;
        } catch (error) {
            console.log('YouTube AI Summary: Error extracting from current page:', error.message);
            return null;
        }
    }
    
    /**
     * Extract transcript URL from HTML content
     */
    async function extractTranscriptUrlFromHtml(html, videoId) {
        try {
            // Look for ytInitialPlayerResponse in the HTML
            const match = html.match(/var ytInitialPlayerResponse = ({.*?});/);
            if (match) {
                try {
                    const playerResponse = JSON.parse(match[1]);
                    console.log('YouTube AI Summary: Found ytInitialPlayerResponse in fetched HTML');
                    return extractCaptionUrlFromPlayerResponse(playerResponse, videoId);
                } catch (parseError) {
                    console.log('YouTube AI Summary: Error parsing player response from HTML:', parseError.message);
                }
            }
            
            // Alternative: look for window.ytInitialPlayerResponse assignment
            const windowMatch = html.match(/window\["ytInitialPlayerResponse"\] = ({.*?});/);
            if (windowMatch) {
                try {
                    const playerResponse = JSON.parse(windowMatch[1]);
                    console.log('YouTube AI Summary: Found window ytInitialPlayerResponse in HTML');
                    return extractCaptionUrlFromPlayerResponse(playerResponse, videoId);
                } catch (parseError) {
                    console.log('YouTube AI Summary: Error parsing window player response:', parseError.message);
                }
            }
            
            return null;
        } catch (error) {
            console.log('YouTube AI Summary: Error extracting from HTML:', error.message);
            return null;
        }
    }
    
    /**
     * Extract caption URL from player response object
     */
    function extractCaptionUrlFromPlayerResponse(playerResponse, videoId) {
        try {
            const captions = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
            
            if (!captions || captions.length === 0) {
                console.log('YouTube AI Summary: No caption tracks found for video:', videoId);
                return null;
            }
            
            console.log(`YouTube AI Summary: Found ${captions.length} caption tracks`);
            
            // Find English caption track
            const englishTrack = captions.find(track => 
                track.languageCode === 'en' || 
                track.languageCode === 'en-US' ||
                (track.name?.simpleText && track.name.simpleText.toLowerCase().includes('english'))
            );
            
            if (englishTrack && englishTrack.baseUrl) {
                console.log('YouTube AI Summary: Found English caption track');
                const url = new URL(englishTrack.baseUrl);
                url.searchParams.set('fmt', 'json3');
                return url.toString();
            }
            
            // If no English track, try the first available track
            if (captions[0] && captions[0].baseUrl) {
                console.log('YouTube AI Summary: Using first available caption track:', captions[0].languageCode);
                const url = new URL(captions[0].baseUrl);
                url.searchParams.set('fmt', 'json3');
                return url.toString();
            }
            
            console.log('YouTube AI Summary: No usable caption tracks found');
            return null;
            
        } catch (error) {
            console.log('YouTube AI Summary: Error extracting caption URL:', error.message);
            return null;
        }
    }
    
    /**
     * Parse XML transcript format
     */
    function parseXmlTranscript(xmlText) {
        try {
            console.log('YouTube AI Summary: Parsing XML transcript');
            
            // Parse XML manually since we might not have DOMParser in all contexts
            const textMatches = xmlText.match(/<text[^>]*>(.*?)<\/text>/g);
            if (textMatches) {
                const transcript = textMatches
                    .map(match => {
                        // Extract text content and decode HTML entities
                        const textContent = match.replace(/<text[^>]*>(.*?)<\/text>/, '$1');
                        return textContent
                            .replace(/&amp;/g, '&')
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                            .replace(/&quot;/g, '"')
                            .replace(/&#39;/g, "'");
                    })
                    .join(' ')
                    .replace(/\s+/g, ' ')
                    .trim();
                
                console.log('YouTube AI Summary: XML transcript parsed, length:', transcript.length);
                return transcript;
            }
            
            console.log('YouTube AI Summary: No text elements found in XML');
            return null;
            
        } catch (error) {
            console.log('YouTube AI Summary: Error parsing XML transcript:', error.message);
            return null;
        }
    }
    
    /**
     * Alternative transcript extraction from page elements
     */
    async function extractTranscriptFromPage(videoId) {
        try {
            // Try to find transcript elements on the page
            const transcriptButtons = document.querySelectorAll('[aria-label*="transcript"], [aria-label*="Transcript"]');
            
            if (transcriptButtons.length > 0) {
                // Click transcript button and wait for content
                transcriptButtons[0].click();
                
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Look for transcript text
                const transcriptElements = document.querySelectorAll('[class*="transcript"], [data-target-id*="transcript"]');
                
                if (transcriptElements.length > 0) {
                    const transcript = Array.from(transcriptElements)
                        .map(el => el.textContent)
                        .join(' ')
                        .replace(/\s+/g, ' ')
                        .trim();
                    
                    if (transcript.length > 100) {
                        return transcript;
                    }
                }
            }
            
            return null;
            
        } catch (error) {
            console.log('YouTube AI Summary: Page transcript extraction failed:', error.message);
            return null;
        }
    }
    
    /**
     * Generate summary using OpenRouter API
     */
    async function generateSummary(transcript, settings) {
        console.log('YouTube AI Summary: Generating summary with model:', settings.model);
        
        const prompt = `${settings.summaryPrompt}\n\nTranscript:\n${transcript}`;
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${settings.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'YouTube Already Watched Extension'
            },
            body: JSON.stringify({
                model: settings.model,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content.trim();
        }
        
        throw new Error('Invalid response format from API');
    }
    
    /**
     * Get extension settings from storage
     */
    async function getExtensionSettings() {
        try {
            const defaults = {
                enableSummary: true,
                apiKey: '',
                model: 'google/gemini-2.5-flash-lite',
                summaryPrompt: 'Please provide a concise and informative summary of this video transcript. Focus on the main points, key insights, and important information.',
                autoExtractTranscript: true
            };
            
            const settings = await browser.storage.sync.get(defaults);
            return settings;
            
        } catch (error) {
            console.error('YouTube AI Summary: Error loading settings:', error);
            return {
                enableSummary: false,
                apiKey: '',
                model: 'google/gemini-2.5-flash-lite',
                summaryPrompt: 'Please provide a concise summary of this video.',
                autoExtractTranscript: true
            };
        }
    }
    
    /**
     * Show modal dialog
     */
    function showModal(title, content, buttons = [], loading = false) {
        // Remove existing modal
        const existingModal = document.querySelector('.yt-ai-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.className = 'yt-ai-modal';
        modal.innerHTML = `
            <div class="yt-ai-modal-content">
                <div class="yt-ai-modal-header">
                    <h3 class="yt-ai-modal-title">${title}</h3>
                    <button class="yt-ai-modal-close">×</button>
                </div>
                <div class="yt-ai-modal-body">
                    ${loading ? '<div class="yt-ai-loading"><div class="yt-ai-spinner"></div><p>Loading...</p></div>' : content}
                </div>
                <div class="yt-ai-modal-footer">
                    ${buttons.map(btn => 
                        `<button class="yt-ai-modal-button ${btn.type || 'secondary'}" data-action="${btn.action || 'close'}">${btn.text}</button>`
                    ).join('')}
                </div>
            </div>
        `;
        
        // Add event listeners
        modal.querySelector('.yt-ai-modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        // Handle button clicks
        modal.querySelectorAll('.yt-ai-modal-button').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                if (action === 'close') {
                    modal.remove();
                } else if (typeof action === 'function') {
                    action();
                    modal.remove();
                }
            });
        });
        
        document.body.appendChild(modal);
        return modal;
    }
    
    /**
     * Update modal content
     */
    function updateModalContent(modal, type, content, videoId = null) {
        const body = modal.querySelector('.yt-ai-modal-body');
        const footer = modal.querySelector('.yt-ai-modal-footer');
        
        if (type === 'loading') {
            body.innerHTML = `
                <div class="yt-ai-loading">
                    <div class="yt-ai-spinner"></div>
                    <p>${content}</p>
                </div>
            `;
            footer.innerHTML = '';
        } else if (type === 'transcript') {
            const truncatedTranscript = content.length > 2000 ? content.substring(0, 2000) + '...' : content;
            body.innerHTML = `
                <div class="yt-ai-transcript">
                    <p><strong>📜 Extracted Transcript</strong> (${content.length} characters)</p>
                    <div class="transcript-content">${escapeHtml(truncatedTranscript)}</div>
                    <p><em>Generating AI summary...</em></p>
                </div>
            `;
            footer.innerHTML = `
                <button class="yt-ai-modal-button secondary" data-action="close">Cancel</button>
                <button class="yt-ai-modal-button secondary" data-action="skip-summary">Skip to Summary</button>
            `;
            
            // Add skip functionality
            const skipBtn = footer.querySelector('[data-action="skip-summary"]');
            if (skipBtn) {
                skipBtn.addEventListener('click', () => {
                    // Trigger immediate summary generation by resolving the timeout
                    modal.setAttribute('data-skip', 'true');
                });
            }
        } else if (type === 'summary') {
            body.innerHTML = `<div class="yt-ai-summary">${formatSummary(content)}</div>`;
            footer.innerHTML = `
                <button class="yt-ai-modal-button secondary" data-action="close">Close</button>
                <button class="yt-ai-modal-button secondary" data-action="view-transcript">View Transcript</button>
                <button class="yt-ai-modal-button primary" data-action="mark-watched">Mark as Watched</button>
            `;
            
            // Add mark as watched functionality
            const markWatchedBtn = footer.querySelector('[data-action="mark-watched"]');
            if (markWatchedBtn && videoId) {
                markWatchedBtn.addEventListener('click', () => {
                    // Find the already watched button for this video
                    const watchedButton = document.querySelector(`[data-video-id="${videoId}"].already-watched-btn`);
                    if (watchedButton) {
                        handleAlreadyWatchedClick(videoId, watchedButton);
                    }
                    modal.remove();
                });
            }
            
            // Add view transcript functionality
            const viewTranscriptBtn = footer.querySelector('[data-action="view-transcript"]');
            if (viewTranscriptBtn) {
                viewTranscriptBtn.addEventListener('click', () => {
                    const transcript = modal.getAttribute('data-transcript');
                    if (transcript) {
                        updateModalContent(modal, 'transcript-only', transcript);
                    }
                });
            }
        } else if (type === 'transcript-only') {
            body.innerHTML = `
                <div class="yt-ai-transcript">
                    <p><strong>📜 Full Video Transcript</strong> (${content.length} characters)</p>
                    <div class="transcript-content full-transcript">${escapeHtml(content)}</div>
                </div>
            `;
            footer.innerHTML = `
                <button class="yt-ai-modal-button secondary" data-action="close">Close</button>
                <button class="yt-ai-modal-button secondary" data-action="back-to-summary">Back to Summary</button>
            `;
            
            // Add back to summary functionality
            const backBtn = footer.querySelector('[data-action="back-to-summary"]');
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    const summary = modal.getAttribute('data-summary');
                    if (summary) {
                        updateModalContent(modal, 'summary', summary, videoId);
                    }
                });
            }
        } else if (type === 'error') {
            body.innerHTML = `<div class="yt-ai-error">${content}</div>`;
            footer.innerHTML = '<button class="yt-ai-modal-button secondary" data-action="close">Close</button>';
        }
        
        // Re-bind close handlers
        const closeBtn = footer.querySelector('[data-action="close"]');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => modal.remove());
        }
    }
    
    /**
     * Format summary content with basic markdown-like formatting
     */
    function formatSummary(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/^\- (.*$)/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(.*)$/gm, '<p>$1</p>')
            .replace(/<p><\/p>/g, '')
            .replace(/<p>(<h[1-3]>)/g, '$1')
            .replace(/(<\/h[1-3]>)<\/p>/g, '$1');
    }
    
    /**
     * Escape HTML characters to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Adds button to a single video container
     */
    function addButtonToVideoContainer(containerElement) {
        // Skip if buttons already exist
        if (containerElement.querySelector('.yt-ai-button')) {
            console.log('YouTube Already Watched: Buttons already exist, skipping container');
            return;
        }
        
        // Find the video link to get the video ID
        const videoLink = containerElement.querySelector('a[href*="/watch"]');
        
        if (!videoLink) {
            console.log('YouTube Already Watched: No video link found in container');
            return;
        }
        
        const videoId = getVideoId(videoLink.href);
        if (!videoId) {
            console.log('YouTube Already Watched: Could not extract video ID from:', videoLink.href);
            return;
        }
        
        console.log('YouTube Already Watched: Processing video:', videoId);
        
        // Find the metadata area below the thumbnail (where title, channel, views are)
        let attachmentArea = containerElement.querySelector('#meta, #metadata, .ytd-rich-item-renderer #dismissible #details');
        
        if (!attachmentArea) {
            // Try to find the area with video title and metadata
            attachmentArea = containerElement.querySelector('#details, .details, [id*="meta"]');
        }
        
        if (!attachmentArea) {
            // Look for the area containing the 3-dot menu button
            const menuButton = containerElement.querySelector('button[aria-label*="Action menu"], button[aria-label*="More actions"], button[aria-haspopup="true"]');
            if (menuButton) {
                attachmentArea = menuButton.parentElement;
                console.log('YouTube Already Watched: Using menu button parent as attachment point');
            }
        }
        
        if (!attachmentArea) {
            // Fallback: look for any element that contains video metadata
            attachmentArea = containerElement.querySelector('#video-title, .video-title, #channel-name, .channel-name');
            if (attachmentArea) {
                // Use the parent that likely contains all the metadata
                attachmentArea = attachmentArea.closest('#details, #meta, #metadata') || attachmentArea.parentElement;
                console.log('YouTube Already Watched: Using metadata area as attachment point');
            }
        }
        
        if (!attachmentArea) {
            // Last resort: use the container itself
            attachmentArea = containerElement;
            console.log('YouTube Already Watched: Using container as attachment point');
        } else {
            console.log('YouTube Already Watched: Using metadata area as attachment point');
        }
        
        // Ensure the attachment area has relative positioning
        if (attachmentArea && getComputedStyle(attachmentArea).position === 'static') {
            attachmentArea.style.position = 'relative';
        }
        
                    // Create and add the button
            console.log('YouTube Already Watched: Creating buttons for video:', videoId);
            
            // Create summary button (left side)
            const summaryButton = createSummaryButton(videoId, attachmentArea);
            attachmentArea.appendChild(summaryButton);
            
            // Create already watched button (right side)
            const watchedButton = createAlreadyWatchedButton(videoId, attachmentArea);
            attachmentArea.appendChild(watchedButton);
            
            console.log('YouTube Already Watched: Buttons added for video:', videoId);
    }
    
    /**
     * Debug function to inspect page state
     */
    function debugPageState() {
        console.log('YouTube Already Watched: === DEBUG INFO ===');
        console.log('URL:', location.href);
        console.log('Pathname:', location.pathname);
        console.log('Document ready state:', document.readyState);
        console.log('ytd-app present:', !!document.querySelector('ytd-app'));
        console.log('ytd-page-manager present:', !!document.querySelector('ytd-page-manager'));
        console.log('ytd-rich-item-renderer count:', document.querySelectorAll('ytd-rich-item-renderer').length);
        console.log('ytd-grid-video-renderer count:', document.querySelectorAll('ytd-grid-video-renderer').length);
        console.log('ytd-compact-video-renderer count:', document.querySelectorAll('ytd-compact-video-renderer').length);
        console.log('Any video links:', document.querySelectorAll('a[href*="/watch"]').length);
        console.log('=== END DEBUG ===');
    }
    
    /**
     * Processes all video containers on the page
     */
    function processVideoContainers() {
        console.log('YouTube Already Watched: Processing video containers...');
        
        // Debug current state
        debugPageState();
        
        // Target all rich item renderers, but only process ones without buttons
        const allContainers = document.querySelectorAll('ytd-rich-item-renderer');
        const unprocessedContainers = Array.from(allContainers).filter(container => 
            !container.querySelector('.already-watched-btn')
        );
        
        console.log(`YouTube Already Watched: Found ${allContainers.length} total containers, ${unprocessedContainers.length} need processing`);
        
        if (unprocessedContainers.length === 0) {
            if (allContainers.length > 0) {
                console.log('YouTube Already Watched: All containers already have buttons');
                return true; // Containers exist and are processed
            } else {
                console.log('YouTube Already Watched: No containers found, YouTube content may still be loading...');
                return false; // No containers at all
            }
        }
        
        unprocessedContainers.forEach(container => {
            addButtonToVideoContainer(container);
        });
        
        console.log(`YouTube Already Watched: Successfully processed ${unprocessedContainers.length} containers`);
        return true; // Indicate containers were processed
    }
    
    /**
     * Waits for YouTube app to be ready
     */
    function waitForYouTubeApp() {
        return new Promise((resolve) => {
            function checkYouTubeReady() {
                const ytdApp = document.querySelector('ytd-app');
                const pageManager = document.querySelector('ytd-page-manager');
                
                if (ytdApp && pageManager) {
                    console.log('YouTube Already Watched: YouTube app structure detected');
                    resolve();
                } else {
                    console.log('YouTube Already Watched: Waiting for YouTube app to load...');
                    setTimeout(checkYouTubeReady, 500);
                }
            }
            checkYouTubeReady();
        });
    }
    
    /**
     * Waits for YouTube content to load and processes containers
     */
    function waitForYouTubeContentAndProcess(maxRetries = 15, delay = 1000) {
        let retries = 0;
        
        function tryProcess() {
            console.log(`YouTube Already Watched: Attempt ${retries + 1}/${maxRetries} to find video containers`);
            
            // First check if we're even on a page that should have video containers
            const isHomePage = location.pathname === '/' || location.pathname === '/feed/subscriptions';
            if (!isHomePage) {
                console.log('YouTube Already Watched: Not on a page with video containers, skipping');
                return;
            }
            
            const success = processVideoContainers();
            
            if (success || retries >= maxRetries) {
                if (!success) {
                    console.log('YouTube Already Watched: Max retries reached, no video containers found');
                    console.log('YouTube Already Watched: Current page:', location.pathname);
                    console.log('YouTube Already Watched: Available elements:', 
                        document.querySelectorAll('ytd-rich-item-renderer, ytd-grid-video-renderer, ytd-compact-video-renderer').length
                    );
                }
                return;
            }
            
            retries++;
            setTimeout(tryProcess, delay);
        }
        
        // Wait for YouTube app first, then try processing
        waitForYouTubeApp().then(() => {
            setTimeout(tryProcess, 1000); // Give it a moment after app is ready
        });
    }
    
    /**
     * Sets up the mutation observer to watch for new content
     */
    function setupObserver() {
        if (observer) {
            observer.disconnect();
        }
        
        observer = new MutationObserver((mutations) => {
            let shouldProcess = false;
            
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if new video containers were added
                            if (node.matches && (
                                node.matches('ytd-rich-item-renderer') ||
                                node.querySelector('ytd-rich-item-renderer') ||
                                node.matches('ytd-grid-video-renderer') ||
                                node.matches('ytd-compact-video-renderer')
                            )) {
                                shouldProcess = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldProcess) {
                // Debounce the processing
                setTimeout(processVideoContainers, 100);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    /**
     * Initialize the extension
     */
    function init() {
        console.log('YouTube Already Watched: Initializing extension...');
        
        // Set up observer for new content first
        setupObserver();
        
        // Wait for YouTube content to load, then process
        waitForYouTubeContentAndProcess();
        
        // Re-process when navigation occurs (SPA behavior)
        let currentUrl = location.href;
        setInterval(() => {
            if (location.href !== currentUrl) {
                currentUrl = location.href;
                console.log('YouTube Already Watched: Page navigation detected, reprocessing...');
                setTimeout(() => {
                    // Just reprocess - our new logic handles duplicates
                    waitForYouTubeContentAndProcess();
                }, 1500); // Increased delay for SPA navigation
            }
        }, 500);
    }
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Also initialize after delays to catch different loading scenarios
    setTimeout(() => {
        console.log('YouTube Already Watched: Secondary initialization attempt...');
        waitForYouTubeContentAndProcess();
    }, 3000);
    
    setTimeout(() => {
        console.log('YouTube Already Watched: Final initialization attempt...');
        waitForYouTubeContentAndProcess();
    }, 5000);
    
    // Emergency manual test - inject a button directly for debugging
    setTimeout(() => {
        console.log('YouTube Already Watched: Emergency manual test - injecting test button...');
        const firstContainer = document.querySelector('ytd-rich-item-renderer');
        if (firstContainer) {
            // Find the metadata area like our main function does
            let testArea = firstContainer.querySelector('#meta, #metadata, #details');
            if (!testArea) {
                const menuButton = firstContainer.querySelector('button[aria-label*="Action menu"], button[aria-label*="More actions"], button[aria-haspopup="true"]');
                if (menuButton) {
                    testArea = menuButton.parentElement;
                }
            }
            if (!testArea) {
                testArea = firstContainer;
            }
            
            const testButton = document.createElement('button');
            testButton.className = 'already-watched-btn';
            testButton.style.position = 'absolute';
            testButton.style.bottom = '-60px';
            testButton.style.left = '4px';
            testButton.style.width = '24px';
            testButton.style.height = '24px';
            testButton.style.background = 'rgba(0, 0, 0, 0.8)';
            testButton.style.border = 'none';
            testButton.style.opacity = '1';
            testButton.style.borderRadius = '4px';
            testButton.style.zIndex = '9999';
            testButton.style.display = 'flex';
            testButton.style.alignItems = 'center';
            testButton.style.justifyContent = 'center';
            testButton.innerHTML = '✓';
            testButton.style.color = 'white';
            testButton.style.fontSize = '12px';
            testButton.onclick = () => alert('Test button clicked!');
            
            testArea.style.position = 'relative';
            testArea.appendChild(testButton);
            console.log('YouTube Already Watched: Test button injected into metadata area');
        } else {
            console.log('YouTube Already Watched: No containers found for manual test');
        }
    }, 7000);
    
})();
