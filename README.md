# KnowYourRights Card

A mobile-first web application that provides users with essential legal information and documentation tools for police interactions, accessible instantly via a smart card format.

## 🚀 Features

### Core Features Implemented

#### ✅ State-Specific Rights & Scripts
- Dynamic state selection with location-specific legal information
- AI-powered content generation using OpenAI API
- Multi-language support (English/Spanish)
- Fallback to default rights when API is unavailable

#### ✅ On-Demand Legal Guidance
- Context-aware advice for common police interaction scenarios
- Quick-access tabs for rights, what to say, and what to avoid
- Real-time language switching

#### ✅ Rapid Record & Alert System
- Audio and video recording capabilities using MediaRecorder API
- One-tap emergency alert system to trusted contacts
- Geolocation integration for location tracking
- Automatic incident documentation

#### ✅ Shareable Incident Summaries
- AI-generated incident summaries using OpenAI
- Encrypted sharing capabilities
- Export and download functionality
- Integration with native sharing APIs

### Additional Features

#### 🔐 User Authentication
- Supabase-powered authentication system
- User profiles and preferences
- Secure data storage

#### 📱 Subscription Management
- Freemium model with Pro tier ($4.99/month)
- Stripe integration for payment processing
- Feature gating for premium capabilities

#### 📊 Interaction History
- Complete history of police interactions
- Recording storage and playback
- Searchable and filterable records

#### 👥 Trusted Contacts Management
- Add and manage emergency contacts
- Test alert functionality
- Multiple contact methods (phone/email)

## 🛠 Technical Implementation

### Architecture

```
src/
├── components/          # React components
│   ├── Header.jsx
│   ├── StateSelector.jsx
│   ├── RightsCard.jsx
│   ├── TrustedContacts.jsx
│   ├── InteractionHistory.jsx
│   ├── Modal.jsx
│   └── ...
├── context/            # React Context for state management
│   └── AppContext.jsx
├── services/           # API integrations
│   ├── supabase.js     # Backend services
│   ├── openai.js       # AI content generation
│   ├── stripe.js       # Payment processing
│   └── recording.js    # Media recording & location
└── App.jsx            # Main application component
```

### Data Model

#### User Entity
```javascript
{
  userId: string,
  email: string,
  state: string,
  preferredLanguage: 'english' | 'spanish',
  trustedContacts: Contact[],
  subscriptionStatus: 'free' | 'pro'
}
```

#### Interaction Entity
```javascript
{
  interactionId: string,
  userId: string,
  timestamp: string,
  location: string,
  coordinates: { latitude: number, longitude: number },
  recordingUrl: string,
  recordingType: 'audio' | 'video',
  duration: number,
  notes: string,
  incidentSummary: string,
  status: 'recording' | 'completed'
}
```

#### StateLaw Entity
```javascript
{
  stateName: string,
  rights: string[],
  whatToSay: string[],
  whatNotToSay: string[],
  stateSpecific: string[]
}
```

### API Integrations

#### Supabase (Backend-as-a-Service)
- **Authentication**: User signup, signin, session management
- **Database**: User profiles, interactions, state laws
- **Storage**: Recording file uploads
- **Real-time**: Live data synchronization

#### OpenAI (AI Content Generation)
- **State Rights Generation**: Dynamic legal content based on state
- **Incident Summaries**: AI-generated interaction summaries
- **Translation**: Multi-language content support
- **Contextual Advice**: Scenario-specific legal guidance

#### Stripe (Payment Processing)
- **Subscriptions**: Pro tier subscription management
- **Checkout**: Secure payment processing
- **Webhooks**: Payment confirmation handling

### Browser APIs Used

#### MediaRecorder API
- Audio/video recording capabilities
- Real-time media capture
- File format optimization

#### Geolocation API
- Current position tracking
- Location-based features
- Privacy-conscious implementation

#### Web Share API
- Native sharing integration
- Fallback to clipboard copy
- Cross-platform compatibility

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vistara-apps/this-is-a-0343.git
   cd this-is-a-0343
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your API keys:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_OPENAI_API_KEY=your-openai-api-key
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
   ```

4. **Set up Supabase database**
   
   Create the following tables in your Supabase project:
   
   ```sql
   -- Users table
   CREATE TABLE users (
     user_id UUID PRIMARY KEY REFERENCES auth.users(id),
     email TEXT,
     state TEXT,
     preferred_language TEXT DEFAULT 'english',
     trusted_contacts JSONB DEFAULT '[]',
     subscription_status TEXT DEFAULT 'free',
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   
   -- Interactions table
   CREATE TABLE interactions (
     interaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES users(user_id),
     timestamp TIMESTAMP DEFAULT NOW(),
     location TEXT,
     coordinates JSONB,
     recording_url TEXT,
     recording_type TEXT,
     duration INTEGER,
     notes TEXT,
     incident_summary TEXT,
     status TEXT DEFAULT 'completed',
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   
   -- State laws table
   CREATE TABLE state_laws (
     state_name TEXT PRIMARY KEY,
     rights JSONB,
     what_to_say JSONB,
     what_not_to_say JSONB,
     state_specific JSONB,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   
   -- Storage bucket for recordings
   INSERT INTO storage.buckets (id, name, public) VALUES ('recordings', 'recordings', false);
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Set up the database schema (see above)
3. Configure Row Level Security (RLS) policies
4. Create storage bucket for recordings

### OpenAI Setup
1. Get an API key from OpenAI
2. Set usage limits and monitoring
3. Configure content filtering if needed

### Stripe Setup
1. Create a Stripe account
2. Set up products and pricing
3. Configure webhooks for subscription events
4. Test with Stripe's test mode

## 📱 Usage

### For End Users

1. **Select Your State**: Choose your state to get location-specific legal information
2. **Know Your Rights**: Access constitutional rights and state-specific protections
3. **Emergency Recording**: One-tap recording with automatic location tracking
4. **Alert Contacts**: Instantly notify trusted contacts during interactions
5. **Document Everything**: Generate AI-powered incident summaries
6. **Share Safely**: Export and share documentation with legal counsel

### For Developers

#### Adding New States
```javascript
// Add to services/openai.js fallback data
const newStateData = {
  rights: [...],
  whatToSay: [...],
  whatNotToSay: [...],
  stateSpecific: [...]
}
```

#### Extending Recording Features
```javascript
// services/recording.js
class RecordingService {
  async startRecording(type, options) {
    // Add custom recording logic
  }
}
```

#### Custom AI Prompts
```javascript
// services/openai.js
const customPrompt = `Generate legal advice for ${scenario} in ${state}...`
```

## 🔒 Security & Privacy

### Data Protection
- End-to-end encryption for sensitive data
- Secure API key management
- Privacy-first location handling
- GDPR compliance considerations

### Recording Security
- Local storage with optional cloud backup
- Encrypted file uploads
- User-controlled data retention
- Secure sharing mechanisms

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
Ensure all production environment variables are set:
- Database URLs
- API keys
- Domain configurations
- Security settings

### Recommended Platforms
- **Vercel**: Optimal for React apps
- **Netlify**: Great for static deployment
- **Railway**: Full-stack deployment
- **Supabase**: Integrated hosting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the FAQ section

## 🔮 Roadmap

### Upcoming Features
- [ ] Offline mode support
- [ ] Advanced analytics dashboard
- [ ] Legal counsel integration
- [ ] Community-driven content
- [ ] Mobile app versions
- [ ] Voice-activated features
- [ ] Integration with legal databases

### Technical Improvements
- [ ] Performance optimizations
- [ ] Enhanced security measures
- [ ] Better error handling
- [ ] Comprehensive testing suite
- [ ] Accessibility improvements

---

**Built with ❤️ for civil rights and police accountability**
