import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'your-openai-api-key',
  dangerouslyAllowBrowser: true // Note: In production, API calls should go through your backend
})

export const aiService = {
  // Generate state-specific rights and scripts
  async generateStateRights(stateName, language = 'english') {
    try {
      const prompt = `Generate comprehensive legal rights information for police interactions in ${stateName}, United States. 
      
      Please provide:
      1. Constitutional rights that apply during police stops
      2. State-specific laws and protections
      3. Recommended phrases to say during interactions
      4. Things to avoid saying or doing
      
      Format the response as JSON with the following structure:
      {
        "rights": ["right 1", "right 2", ...],
        "whatToSay": ["phrase 1", "phrase 2", ...],
        "whatNotToSay": ["avoid 1", "avoid 2", ...],
        "stateSpecific": ["state law 1", "state law 2", ...]
      }
      
      Language: ${language}
      Keep responses concise and legally accurate.`

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a legal expert specializing in constitutional rights and police interaction law. Provide accurate, helpful information while emphasizing the importance of remaining calm and respectful during police encounters."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })

      const content = completion.choices[0].message.content
      return { data: JSON.parse(content), error: null }
    } catch (error) {
      console.error('OpenAI API Error:', error)
      return { data: null, error: error.message }
    }
  },

  // Generate incident summary
  async generateIncidentSummary(interactionData, language = 'english') {
    try {
      const { timestamp, location, notes, duration } = interactionData
      
      const prompt = `Create a concise incident summary for a police interaction that occurred on ${timestamp} at ${location}. 
      
      Interaction details:
      - Duration: ${duration || 'Unknown'}
      - Notes: ${notes || 'No additional notes'}
      
      Generate a professional summary that includes:
      1. Date, time, and location
      2. Brief description of the interaction
      3. Key rights that were relevant
      4. Any important observations
      
      Language: ${language}
      Keep it factual and objective, suitable for sharing with legal counsel or trusted contacts.`

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a legal documentation assistant. Create clear, factual summaries of police interactions that could be useful for legal purposes."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 500
      })

      const summary = completion.choices[0].message.content
      return { data: summary, error: null }
    } catch (error) {
      console.error('OpenAI API Error:', error)
      return { data: null, error: error.message }
    }
  },

  // Translate content to Spanish
  async translateToSpanish(content) {
    try {
      const prompt = `Translate the following legal rights content to Spanish, maintaining legal accuracy and clarity:

      ${JSON.stringify(content)}
      
      Ensure translations are appropriate for legal contexts and easily understood by Spanish speakers.`

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a professional legal translator specializing in constitutional rights and police interaction terminology. Provide accurate Spanish translations that maintain legal precision."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      })

      const translatedContent = completion.choices[0].message.content
      return { data: JSON.parse(translatedContent), error: null }
    } catch (error) {
      console.error('OpenAI Translation Error:', error)
      return { data: null, error: error.message }
    }
  },

  // Generate contextual advice for specific scenarios
  async generateContextualAdvice(scenario, stateName, language = 'english') {
    try {
      const prompt = `Provide specific legal advice for the following police interaction scenario in ${stateName}:
      
      Scenario: ${scenario}
      
      Please provide:
      1. Immediate steps to take
      2. Relevant rights to invoke
      3. Specific phrases to use
      4. Things to avoid
      5. State-specific considerations
      
      Language: ${language}
      Keep advice practical and immediately actionable.`

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a legal advisor specializing in police interactions. Provide practical, legally sound advice that prioritizes safety and constitutional rights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      })

      const advice = completion.choices[0].message.content
      return { data: advice, error: null }
    } catch (error) {
      console.error('OpenAI API Error:', error)
      return { data: null, error: error.message }
    }
  }
}

// Fallback data in case API is unavailable
export const fallbackData = {
  defaultRights: {
    rights: [
      "Right to remain silent (5th Amendment)",
      "Right to refuse consent to searches",
      "Right to ask if you're free to leave",
      "Right to a lawyer during questioning",
      "Right to record in public spaces"
    ],
    whatToSay: [
      "I am exercising my right to remain silent.",
      "I do not consent to any searches.",
      "I would like to speak to a lawyer.",
      "Am I free to leave?",
      "I do not consent to this interaction."
    ],
    whatNotToSay: [
      "Don't argue or become confrontational",
      "Don't run or resist physically",
      "Don't lie or provide false information",
      "Don't consent to searches",
      "Don't answer questions without a lawyer"
    ],
    stateSpecific: [
      "Consult local laws for state-specific protections",
      "Some states have additional recording rights",
      "State laws may vary on vehicle searches"
    ]
  }
}
