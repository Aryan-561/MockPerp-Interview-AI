# AI Chat Page Features

## 🎯 Features Implemented

### 1. **Chat Interface**
- Beautiful gradient background (blue to indigo)
- Message history with user and AI messages
- Auto-scroll to latest message
- Responsive design

### 2. **Text-to-Speech (AI Voice)**
- Automatic voice response when AI replies
- Uses Web Speech API
- Female voice preference
- Adjustable speech rate (0.9x for clarity)
- Stop button to pause speaking
- Visual indicator when AI is speaking

### 3. **Speech-to-Text (User Voice)**
- Microphone button to start/stop listening
- Real-time transcript display
- Continuous listening mode
- Automatic text population
- Visual indicator when listening
- Support for multiple languages (default: English)

### 4. **Typing Animation**
- AI responses appear with typewriter effect
- Smooth character-by-character reveal
- Blinking cursor at end of typing
- Speed: 20ms per character (adjustable)

### 5. **UI Components**

#### ChatMessage Component
- User and AI message differentiation
- Color-coded bubbles (green for user, blue for AI)
- Typing animation for AI responses
- Timestamps for each message
- Avatars (U for user, AI for assistant)

#### Microphone Button
- Toggle on/off with visual feedback
- Red color when active (listening)
- Disabled state during loading/speaking

#### Input Area
- Textarea with multiline support
- Max height of 120px
- Auto-focus on load
- Keyboard shortcut: Enter to send, Shift+Enter for new line

#### Status Indicators
- Speaking indicator with pulse animation
- Listening indicator with pulse animation
- Loading state with animated dots
- Transcript display while listening

## 📱 Usage

### Text Input
1. Type your message in the textarea
2. Click send button (📤) or press Enter
3. AI responds with voice + typing animation

### Voice Input
1. Click microphone button (🎤)
2. Speak clearly
3. Message auto-populates as you speak
4. Click send or press Enter to submit
5. AI responds with voice

### Controls
- 🎤 Microphone: Toggle speech recognition
- 📤 Send: Submit message
- ⏹️ Stop: Pause AI speech (appears when speaking)

## 🔧 Technical Stack

### Frontend
- **Next.js 14** (App Router)
- **React Hooks** for state management
- **Web Speech API** for voice features
- **Tailwind CSS** for styling
- **TypeScript** for type safety

### Custom Hooks
- `useSpeechRecognition()` - Speech-to-text
- `useTextToSpeech()` - Text-to-speech

### API Integration
- Next.js API route (`/api/chat`)
- Proxies to Express backend (`/chat`)
- Automatic error handling

## 🎨 Styling

- Gradient backgrounds and buttons
- Color-coded messages (green/blue)
- Smooth animations and transitions
- Responsive layout
- Dark mode ready

## ⚙️ Configuration

### Speech Recognition
- Language: `en-US` (customize in `useSpeechRecognition.ts`)
- Continuous mode enabled
- Interim results enabled

### Text-to-Speech
- Rate: 0.9 (slower for clarity)
- Pitch: 1 (normal)
- Volume: 1 (full)
- Prefers female voice

### Typing Animation
- Speed: 20ms per character (customize in `ChatMessage.tsx`)

## 🔐 Security

- Uses httpOnly cookies for authentication (via axiosInstance)
- All API calls proxied through Next.js
- XSS protection with React sanitization
- CSRF ready

## 🐛 Browser Support

**Supported:**
- Chrome/Edge (full support)
- Firefox (full support)
- Safari (full support with webkit prefix)
- Mobile browsers (with microphone permission)

**Requirements:**
- HTTPS (required for microphone access)
- Microphone permission (for voice features)

## 📝 Files Created

| File | Purpose |
|------|---------|
| `src/app/chat/page.tsx` | Main chat page component |
| `src/components/ChatMessage.tsx` | Message display with typing animation |
| `src/hooks/useSpeechRecognition.ts` | Speech-to-text hook |
| `src/hooks/useTextToSpeech.ts` | Text-to-speech hook |
| `src/app/api/chat/route.ts` | API endpoint (proxies to backend) |

## 🚀 Next Steps

1. Test with backend `/chat` endpoint
2. Customize typing animation speed if needed
3. Add message persistence (localStorage/DB)
4. Add chat history/conversation management
5. Implement user preferences (voice, language, speed)
6. Add conversation export feature
7. Add typing indicators for real-time multi-user chat
