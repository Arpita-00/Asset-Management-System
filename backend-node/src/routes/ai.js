const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { ApiResponse } = require('../utils/apiResponse');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const aiService = require('../services/aiService');

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI-powered asset management assistant (Gemini)
 */

/**
 * POST /api/ai/chat
 * Send a natural language message to the AI assistant.
 * Rate-limited and validated prompts.
 */
router.post('/chat', authenticate, aiRateLimiter, async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json(ApiResponse.error(400, 'Message is required'));
  }

  // Security: Limit prompt size to 500 characters to prevent prompt bloat/injection
  const trimmed = message.trim();
  if (trimmed.length > 500) {
    return res.status(400).json(ApiResponse.error(400, 'Prompt size limit exceeded (maximum 500 characters)'));
  }

  try {
    const result = await aiService.chat(trimmed, req.user.id);
    res.status(200).json(ApiResponse.success(result, 'AI response generated'));
  } catch (err) {
    res.status(500).json(ApiResponse.error(500, `AI processing failed: ${err.message}`));
  }
});

/**
 * GET /api/ai/history
 * Retrieve chat history for the authenticated user with search filter.
 */
router.get('/history', authenticate, async (req, res) => {
  const { page = 0, size = 20, search = '' } = req.query;
  try {
    const data = await aiService.getChatHistory(req.user.id, parseInt(page), parseInt(size), search.trim());
    res.status(200).json(ApiResponse.success(data));
  } catch (err) {
    res.status(500).json(ApiResponse.error(500, `Failed to retrieve history: ${err.message}`));
  }
});

/**
 * DELETE /api/ai/history/:id
 * Delete a specific chat log item.
 */
router.delete('/history/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await aiService.deleteChatHistoryItem(req.user.id, id);
    if (!deleted) {
      return res.status(404).json(ApiResponse.error(404, 'Chat history item not found'));
    }
    res.status(200).json(ApiResponse.success(null, 'History item deleted successfully'));
  } catch (err) {
    res.status(500).json(ApiResponse.error(500, `Deletion failed: ${err.message}`));
  }
});

/**
 * DELETE /api/ai/history
 * Clear all chat logs for the authenticated user.
 */
router.delete('/history', authenticate, async (req, res) => {
  try {
    await aiService.clearUserChatHistory(req.user.id);
    res.status(200).json(ApiResponse.success(null, 'All chat history cleared successfully'));
  } catch (err) {
    res.status(500).json(ApiResponse.error(500, `Failed to clear history: ${err.message}`));
  }
});

module.exports = router;
