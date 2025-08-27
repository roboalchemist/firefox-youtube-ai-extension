// Example of how to use Playwright with an existing Firefox profile
const { firefox } = require('playwright');

async function testWithExistingProfile() {
  // Option 1: Use existing profile directory
  const browser = await firefox.launch({
    // Point to your existing Firefox profile directory
    // You can find this by typing 'about:profiles' in Firefox
    args: [
      '--profile',
      '/Users/joe/Library/Application Support/Firefox/Profiles/your-profile-folder'
    ],
    headless: false, // Set to true if you want headless mode
  });

  // Option 2: Alternative method using launchPersistentContext
  // This creates a persistent browser context that saves state
  const context = await firefox.launchPersistentContext('/path/to/profile/directory', {
    headless: false,
    // You can also load extensions here:
    // args: ['--load-extension=/path/to/your/extension']
  });

  const page = await context.newPage();
  await page.goto('https://www.youtube.com');
  
  // Now you can test your extension in a real environment
  // with your actual YouTube login, preferences, etc.
  
  await browser.close();
}

// To find your Firefox profile directory:
// 1. Open Firefox
// 2. Type 'about:profiles' in the address bar
// 3. Look for the "Root Directory" of your default profile
// 4. Copy that path and use it in the script above

testWithExistingProfile();
