# Testing Extension with Existing Firefox Profile

## Finding Your Firefox Profile

1. **Open Firefox** and type `about:profiles` in the address bar
2. **Copy the "Root Directory"** path of your default profile (it will look something like):
   - macOS: `/Users/your-username/Library/Application Support/Firefox/Profiles/xxxxxxxx.default-release`
   - Windows: `C:\Users\your-username\AppData\Roaming\Mozilla\Firefox\Profiles\xxxxxxxx.default-release`
   - Linux: `/home/your-username/.mozilla/firefox/xxxxxxxx.default-release`

## Method 1: Manual Testing with Your Profile

1. **Close Firefox completely** (important!)
2. **Load the extension in Developer Mode**:
   ```bash
   # Open Firefox with your profile and developer mode
   /Applications/Firefox.app/Contents/MacOS/firefox --profile "/path/to/your/profile" about:debugging
   ```
3. **Load Temporary Add-on**:
   - Click "This Firefox" → "Load Temporary Add-on"
   - Select the `manifest.json` file
4. **Navigate to YouTube** and test

## Method 2: Playwright with Existing Profile

Create a test script (`test-existing-profile.js`):

```javascript
const { firefox } = require('playwright');

async function testWithYourProfile() {
  // Replace with your actual profile path
  const profilePath = '/Users/joe/Library/Application Support/Firefox/Profiles/your-profile-folder';
  
  const browser = await firefox.launch({
    headless: false,
    args: [`--profile=${profilePath}`]
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Navigate to YouTube
  await page.goto('https://www.youtube.com');
  
  // Wait for page to load
  await page.waitForTimeout(3000);
  
  // Check if extension is working
  const buttons = await page.$$('.already-watched-btn');
  console.log(`Found ${buttons.length} already-watched buttons`);
  
  // Check console messages
  const logs = await page.evaluate(() => {
    return window.console.logs || [];
  });
  
  console.log('Console logs:', logs);
  
  // Keep browser open for manual testing
  console.log('Browser is ready for testing. Press Ctrl+C to close.');
  
  // Don't close automatically - let user test manually
  // await browser.close();
}

testWithYourProfile().catch(console.error);
```

## Method 3: Playwright with Extension Auto-Loading

```javascript
const { firefox } = require('playwright');
const path = require('path');

async function testWithExtension() {
  const extensionPath = path.resolve(__dirname);
  
  const context = await firefox.launchPersistentContext('/tmp/test-profile', {
    headless: false,
    // Load extension
    args: [
      `--load-extension=${extensionPath}`,
      '--disable-extensions-except=' + extensionPath
    ]
  });
  
  const page = await context.newPage();
  await page.goto('https://www.youtube.com');
  
  // Test extension functionality
  await page.waitForSelector('ytd-rich-item-renderer', { timeout: 10000 });
  
  // Wait for extension to process
  await page.waitForTimeout(2000);
  
  // Check for buttons
  const buttonCount = await page.$$eval('.already-watched-btn', buttons => buttons.length);
  console.log(`Extension added ${buttonCount} buttons`);
  
  if (buttonCount > 0) {
    console.log('✅ Extension is working!');
    
    // Test clicking a button
    await page.click('.already-watched-btn:first-child');
    console.log('✅ Button click test completed');
  } else {
    console.log('❌ No buttons found - extension may not be working');
  }
}
```

## Debugging Steps

1. **Check Extension Loading**:
   ```javascript
   // Check if extension scripts are loaded
   const hasExtension = await page.evaluate(() => {
     return window.console?.logs?.some(log => 
       log.includes('YouTube Already Watched')
     );
   });
   ```

2. **Inspect DOM**:
   ```javascript
   // Check video containers
   const containerCount = await page.$$eval('ytd-rich-item-renderer', 
     containers => containers.length
   );
   console.log(`Found ${containerCount} video containers`);
   ```

3. **Check Console Output**:
   ```javascript
   page.on('console', msg => {
     if (msg.text().includes('YouTube Already Watched')) {
       console.log('Extension:', msg.text());
     }
   });
   ```

## Expected Behavior

✅ **Working Extension**:
- Console shows: "YouTube Already Watched: Loading..."
- Console shows: "YouTube Already Watched: Processing video containers..."
- Console shows: "YouTube Already Watched: Found X video containers"
- Buttons appear on hover over video thumbnails
- Buttons have checkmark (✓) icon
- Clicking changes to eye (👁) icon

❌ **Not Working**:
- No console messages from extension
- No buttons appear on hover
- JavaScript errors in console

## Run the Test

```bash
# Install playwright if not already installed
npm install playwright

# Run the test
node test-existing-profile.js
```

This will help you test the extension in your real Firefox environment with your actual YouTube account and preferences!
