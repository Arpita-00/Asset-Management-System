const axios = require('axios');
const Provider = require('./Provider');
const config = require('../../config/env');
const logger = require('../../utils/logger');

/**
 * Gemini API Provider implementation.
 */
class GeminiProvider extends Provider {
  async generateResponse(systemPrompt, userPrompt) {
    const apiKey = config.gemini.apiKey;
    if (!apiKey || apiKey === 'your-gemini-api-key' || apiKey === '') {
      throw new Error('Gemini API key is not configured.');
    }

    try {
      const url = `${config.gemini.baseUrl}/models/${config.gemini.model}:generateContent?key=${apiKey}`;
      const response = await axios.post(url, {
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nUser Question: ${userPrompt}` }]
          }
        ],
        generationConfig: {
          temperature: 0.25,
          maxOutputTokens: 2048,
        }
      }, { timeout: 30000 });

      const candidates = response.data?.candidates;
      if (candidates && candidates.length > 0) {
        const text = candidates[0]?.content?.parts?.[0]?.text;
        if (text) {
          return text;
        }
      }
      throw new Error('No candidate content received from Gemini API.');
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || err.message;
      logger.error(`Gemini API call error: ${errorMsg}`);
      throw new Error(`Gemini service error: ${errorMsg}`);
    }
  }
}

module.exports = GeminiProvider;
