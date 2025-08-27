# Testing the Extension

## Quick Installation Test

1. **Open Firefox Developer Mode**
   ```
   about:debugging → This Firefox → Load Temporary Add-on
   ```

2. **Load Extension**
   - Select `manifest.json` from this folder
   - Should see "YouTube Already Watched" in the extension list

3. **Test on YouTube**
   - Go to https://www.youtube.com
   - Hover over video thumbnails
   - Look for checkmark button (✓) in lower-right corner of thumbnails

## Expected Behavior

- ✅ Buttons appear on hover
- ✅ Tooltip shows "Mark as already watched"
- ✅ Button changes to eye icon (👁) when clicked
- ✅ Tooltip changes to "Already watched" after clicking
- ⚠️ Automatic menu interaction may vary depending on YouTube's current interface

## Manual Testing Checklist

- [ ] Extension loads without errors
- [ ] Buttons appear on YouTube home page
- [ ] Buttons appear on search results
- [ ] Hover tooltip works
- [ ] Click changes button state
- [ ] Works after scrolling (new videos load)
- [ ] Works after navigation within YouTube

## Troubleshooting

If buttons don't appear:
1. Check browser console for errors (F12)
2. Verify extension is active in about:debugging
3. Try refreshing YouTube page
4. Check if YouTube's DOM structure has changed
