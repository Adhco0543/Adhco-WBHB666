# Environment Setup for Advanced Features

## Required Environment Variables

Create a `.env.local` file in the root of your project with these variables:

```env
# Firebase (lifes-assistant project)
Get these from: https://console.firebase.google.com/ > Select "lifes-assistant" project > Project Settings > Service Accounts

NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=lifes-assistant.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=lifes-assistant
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=lifes-assistant.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Claude Vision API (for photo analysis)
ANTHROPIC_API_KEY=your_anthropic_api_key

# Speech-to-Text (Choose one for Phase 1 voice transcription)
# Option 1: Google Cloud Speech-to-Text
GOOGLE_CLOUD_SPEECH_API_KEY=your_google_cloud_api_key

# Option 2: AWS Transcribe (requires AWS SDK setup)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Option 3: AssemblyAI (Recommended - simplest)
ASSEMBLYAI_API_KEY=your_assemblyai_api_key
```

## Setup Instructions

### 1. Get Your Claude API Key
1. Visit https://console.anthropic.com/
2. Sign up or log in
3. Create an API key in the settings
4. Add it to `.env.local` as `ANTHROPIC_API_KEY`

### 2. Choose a Speech-to-Text Provider

**Recommended: AssemblyAI** (easiest to set up)
- Visit https://www.assemblyai.com/
- Create a free account (includes generous free tier)
- Get your API key and add to `.env.local`

## Features Implemented

### Phase 1: Voice + Computer Vision ✅ (IN PROGRESS)

**Job Site Companion Mode** - Toggle in chat interface
- 🎤 **Voice Input** - Hands-free recording (ready for speech-to-text)
- 📸 **Photo Capture** - Snap job site photos
- 📋 **Auto-Analysis** - Claude Vision analyzes photos for:
  - Estimated materials needed
  - Labor estimates
  - Potential issues/safety concerns
  - Quote starting point

**How to Use:**
1. Go to Chat
2. Toggle "📍 Job Site Mode"
3. Use "🎤 Voice Input" or "📸 Snap Photo" buttons
4. Results auto-populate the chat

### Phase 2: Integration Ecosystem (PLANNED)
- QuickBooks sync
- Slack integration
- Email automation
- Calendar scheduling
- Stripe payments

### Phase 3: Predictive Intelligence (PLANNED)
- Profitability analysis
- Churn risk alerts
- Industry benchmarks
- AI-generated playbooks

## Testing Without Full Setup

You can test the UI right now without all environment variables:
- Job Site Companion UI is fully functional
- Photo capture will work
- Voice recording UI is ready
- Photo analysis will show a demo response until Claude API is configured

## Next Steps

1. Add your `ANTHROPIC_API_KEY` to `.env.local`
2. Choose and set up a speech-to-text provider
3. Test Job Site Mode on the chat page
4. Provide feedback on UX/features
