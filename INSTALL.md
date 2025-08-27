# Installation and Testing Guide

## Step 1: Install the Extension

1. **Open Firefox** and type `about:debugging` in the address bar
2. Click **"This Firefox"** in the left sidebar
3. Click **"Load Temporary Add-on..."**
4. Navigate to this folder and select **`manifest.json`**
5. You should see "YouTube Already Watched" appear in the extension list

## Step 2: Verify Installation

1. The extension should appear in the list with no error messages
2. If you see errors, check that all files are present:
   - `manifest.json`
   - `content.js`
   - `styles.css`

## Step 3: Test on YouTube

1. **Go to** https://www.youtube.com
2. **Open Developer Console** (Press F12)
3. **Look for console messages** like:
   ```
   YouTube Already Watched Extension: Loading...
   YouTube Already Watched: Initializing extension...
   YouTube Already Watched: Processing thumbnails...
   YouTube Already Watched: Found X thumbnails
   ```

## Step 4: Look for Buttons

1. **Hover over video thumbnails** on the YouTube home page
2. You should see a **checkmark button (✓)** in the lower-right corner
3. The button should have a **tooltip** saying "Mark as already watched"

## Troubleshooting

### If extension doesn't load:
- Check for JSON syntax errors in manifest.json
- Ensure all referenced files exist
- Try reloading the extension in about:debugging

### If no console messages appear:
- The content script isn't running
- Check if YouTube changed their domain structure
- Try refreshing the YouTube page

### If no buttons appear:
- Check console for JavaScript errors
- YouTube's DOM structure may have changed
- Try different YouTube pages (home, search results)

### If buttons appear but don't work:
- Check console for click handler errors
- YouTube's menu structure may have changed

## Debug Steps

1. **Check Console**: Look for our debug messages
2. **Inspect Elements**: Right-click on video thumbnails and inspect
3. **Manual Test**: Try adding a button manually in console:
   ```javascript
   document.querySelector('ytd-thumbnail').innerHTML += '<button style="position:absolute;bottom:8px;right:8px;background:red;color:white;">TEST</button>'
   ```

If you're still having issues, share the console output and we can debug further!
