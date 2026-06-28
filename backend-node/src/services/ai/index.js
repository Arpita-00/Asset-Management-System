const GeminiProvider = require('./GeminiProvider');
const OpenaiProvider = require('./OpenaiProvider');

class ProviderFactory {
  /**
   * Instantiates and returns the configured AI provider.
   * Configure via process.env.AI_PROVIDER (defaults to 'gemini')
   * @returns {import('./Provider')}
   */
  static getProvider() {
    const providerType = process.env.AI_PROVIDER || 'gemini';
    switch (providerType.toLowerCase()) {
      case 'openai':
        return new OpenaiProvider();
      case 'gemini':
      default:
        return new GeminiProvider();
    }
  }
}

module.exports = ProviderFactory;
