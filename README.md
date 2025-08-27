# YouTube Already Watched - Firefox Extension

A Firefox extension that adds an "Already Watched" button to YouTube video thumbnails, allowing you to quickly mark videos as watched with a single click instead of going through YouTube's menu system.

## 🎯 Features

### 📺 Already Watched
- **One-click marking**: Add videos to your "already watched" list with a single button click
- **Automated workflow**: Automatically triggers YouTube's "Not interested" → "Tell us why" → "I've already watched this video" sequence
- **Visual feedback**: Button changes appearance when clicked to show watched status
- **Persistent state**: Remembers which videos you've marked as watched

### 🤖 AI Video Summaries
- **Instant summaries**: Get AI-powered summaries of any YouTube video with one click
- **Multiple AI models**: Choose from Google Gemini, Claude, GPT-4, and more via OpenRouter
- **Automatic transcript extraction**: Extracts video transcripts from YouTube's API
- **Customizable prompts**: Configure your own summary style and length
- **Modal interface**: Clean, readable popup with formatted summaries
- **Quick actions**: Mark videos as watched directly from the summary modal

### 🎨 Clean Interface
- **Two-button layout**: Summary button (📄) on the left, watched button (✓) on the right  
- **Bottom-positioned**: Unobtrusive placement below video metadata
- **Visual states**: Loading indicators and hover effects
- **Accessible**: Tooltips and keyboard-friendly design

## 🚀 Installation

### Method 1: Temporary Installation (for testing)

1. **Download or clone this repository**
2. **Open Firefox** and navigate to `about:debugging`
3. **Click "This Firefox"** in the left sidebar
4. **Click "Load Temporary Add-on"**
5. **Navigate** to the extension folder and select `manifest.json`
6. **Visit YouTube** - you should see the extension working!

### Method 2: Permanent Installation (requires signing)

For permanent installation, the extension needs to be signed by Mozilla. You can:
- Submit it to Mozilla Add-ons (AMO) for review and signing
- Use the web-ext tool for local development signing

## 🎮 Usage

### Already Watched Feature
1. **Visit YouTube** (any page with video thumbnails)
2. **Look for the "✓" button** at the bottom-right of each video's metadata area
3. **Click the button** to mark a video as "already watched"
4. **The automation runs**: The extension automatically:
   - Clicks the video's 3-dot menu
   - Selects "Not interested"
   - Clicks "Tell us why"
   - Selects "I've already watched the video"
   - Submits the form

### AI Summary Feature
1. **Configure your API key** in the extension settings (see Configuration section below)
2. **Look for the "📄" button** at the bottom-left of each video's metadata area
3. **Click the button** to generate an AI summary
4. **Wait for processing** (transcript extraction + AI generation)
5. **Read the summary** in the popup modal
6. **Optionally mark as watched** directly from the summary modal

## ⚙️ Configuration

### Setting up AI Summaries

1. **Open extension settings**:
   - Go to `about:addons` in Firefox  
   - Find "YouTube Already Watched" extension
   - Click "Options" or "Preferences"

2. **Configure OpenRouter API**:
   - Get an API key from [OpenRouter.ai](https://openrouter.ai/keys)
   - Enter your API key in the settings
   - Choose your preferred AI model (default: Google Gemini 2.0 Flash)

3. **Customize summary settings**:
   - Edit the summary prompt to match your preferences
   - Set maximum summary length (50-1000 words)
   - Enable/disable features as needed

## 🛠 Technical Details

### File Structure
```
firefox-youtube-ai-extension/
├── manifest.json          # Extension configuration
├── content.js            # Main content script with automation logic
├── styles.css            # Button styling and positioning
├── README.md             # This file
├── INSTALL.md            # Detailed installation instructions
└── PROJECT_SPEC.md       # Original project requirements
```

### Key Components

- **Button Creation**: Dynamically creates "already watched" buttons for each video
- **DOM Observation**: Uses MutationObserver to handle YouTube's dynamic content loading
- **Menu Automation**: Programmatically clicks through YouTube's menu system
- **State Management**: Tracks which videos have been marked as watched

### Browser Compatibility

- **Firefox**: ✅ Fully supported (Manifest V2)
- **Chrome/Edge**: ❌ Would require conversion to Manifest V3

## 🔧 Development

### Prerequisites
- Firefox (any recent version)
- Basic knowledge of web extensions

### Local Development
1. **Clone the repository**
2. **Make your changes** to the source files
3. **Reload the extension** in `about:debugging`
4. **Test on YouTube**

### Debugging
- Open Firefox Developer Tools (F12)
- Check the Console tab for logs starting with "YouTube Already Watched:"
- All automation steps are logged for easy debugging

## 📝 How It Works

The extension works by:

1. **Detecting YouTube pages** and waiting for content to load
2. **Finding video containers** (`ytd-rich-item-renderer` elements)
3. **Injecting custom buttons** into the video metadata areas
4. **Automating the menu sequence** when buttons are clicked:
   ```
   User clicks button
   → Find 3-dot menu
   → Click "Not interested" 
   → Click "Tell us why"
   → Select "I've already watched the video"
   → Submit
   ```

## 🎨 Styling

The button is styled to:
- Be small and unobtrusive (24x24px)
- Have a dark semi-transparent background
- Show a checkmark icon
- Appear only on hover (configurable)
- Position at bottom-left of video metadata

## 🐛 Troubleshooting

### Button not appearing
- Check that the extension is loaded in `about:debugging`
- Verify you're on a YouTube page with video thumbnails
- Check browser console for error messages

### Automation not working
- Ensure you have console logging enabled
- Check if YouTube's menu structure has changed
- Verify the extension has permission to run on YouTube

### Console Logging
Enable detailed logging by opening Developer Tools (F12) and watching for:
```
YouTube Already Watched: [various status messages]
```

## 🔮 Future Enhancements

- Settings page for configuration options
- OpenRouter API integration (as mentioned in original spec)
- Support for different YouTube layouts
- Export/import of watched video lists
- Keyboard shortcuts

## 📄 License

This project is open source. Feel free to modify and distribute.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on YouTube
5. Submit a pull request

## ⚠️ Disclaimer

This extension automates interaction with YouTube's interface. YouTube's terms of service should be reviewed to ensure compliance. The extension is for personal use and educational purposes.