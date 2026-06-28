const Provider = require('./Provider');

/**
 * Mock OpenAI Provider for future compatibility.
 */
class OpenaiProvider extends Provider {
  async generateResponse(systemPrompt, userPrompt) {
    return `### OpenAI Provider (Placeholder)
Received prompt details:
- **System Instructions**: Length ${systemPrompt.length} chars
- **User Question**: "${userPrompt}"

*Note: Change process.env.AI_PROVIDER back to 'gemini' for real Google Gemini API usage.*`;
  }
}

module.exports = OpenaiProvider;
