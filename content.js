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
        button.className = 'already-watched-btn';
        button.setAttribute('data-tooltip', 'Mark as already watched');
        button.setAttribute('data-video-id', videoId);
        
        // Check if this video was already marked
        if (watchedVideos.has(videoId)) {
            button.classList.add('clicked');
            button.setAttribute('data-tooltip', 'Already watched');
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
     * Adds button to a single video container
     */
    function addButtonToVideoContainer(containerElement) {
        // Skip if button already exists
        if (containerElement.querySelector('.already-watched-btn')) {
            console.log('YouTube Already Watched: Button already exists, skipping container');
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
            console.log('YouTube Already Watched: Creating button for video:', videoId);
            const button = createAlreadyWatchedButton(videoId, attachmentArea);
            console.log('YouTube Already Watched: Button created, adding to DOM...');
            attachmentArea.appendChild(button);
            console.log('YouTube Already Watched: Button added for video:', videoId);
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
