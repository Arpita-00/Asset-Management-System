/**
 * Base abstract class for AI Providers.
 * Supports future swap-ability to OpenAI, Claude, Llama, DeepSeek, etc.
 */
class Provider {
  /**
   * Generates a response using system and user prompts.
   * @param {string} systemPrompt
   * @param {string} userPrompt
   * @returns {Promise<string>}
   */
  async generateResponse(systemPrompt, userPrompt) {
    throw new Error('generateResponse method not implemented.');
  }
}

module.exports = Provider;
