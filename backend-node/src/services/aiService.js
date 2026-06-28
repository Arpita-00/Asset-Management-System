const axios = require('axios');
const { 
  Role, User, Department, Employee, AssetCategory, Vendor, 
  Asset, AssetAllocation, AssetMovement, AssetHealthScore, 
  MaintenanceRequest, WarrantyTracking, DepreciationRecord, 
  BudgetForecast, AiChatHistory, QrScanLog, AuditLog 
} = require('../models');
const { PagedResponse } = require('../utils/apiResponse');
const config = require('../config/env');
const logger = require('../utils/logger');

/**
 * AI Service.
 * Processes natural language queries using Provider abstraction (Gemini / OpenAI).
 * Falls back to rule-based responses when API key is not configured.
 */

// ─── Main Chat Method ─────────────────────────────────────────────────────────

async function chat(userMessage, currentUserId) {
  logger.info(`AI chat request from user ${currentUserId}: ${userMessage.substring(0, 80)}...`);

  // Build context from database dynamically using SQL classification
  const context = await buildDatabaseContext(userMessage);
  const systemPrompt = buildSystemPrompt(context);

  let aiResponse;
  const providerType = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
  const apiKey = providerType === 'openai' ? process.env.OPENAI_API_KEY : config.gemini.apiKey;

  const isPlaceholder = !apiKey 
    || apiKey === 'your-gemini-api-key' 
    || apiKey === 'your_gemini_api_key_here'
    || apiKey === 'your-openai-api-key'
    || apiKey === '';

  const hasValidPrefix = providerType === 'openai'
    ? (apiKey && apiKey.startsWith('sk-'))
    : (apiKey && (apiKey.startsWith('AIza') || apiKey.startsWith('AQ')));

  if (isPlaceholder || !hasValidPrefix) {
    // Fallback: rule-based response
    logger.warn(`${providerType.toUpperCase()} API key not configured or is a placeholder. Using rule-based fallback response.`);
    aiResponse = await generateFallbackResponse(userMessage);
  } else {
    try {
      const provider = require('./ai/index').getProvider();
      aiResponse = await provider.generateResponse(systemPrompt, userMessage);
    } catch (err) {
      logger.error(`AI Provider call failed: ${err.message}`);
      aiResponse = `⚠️ **AI Provider Request Failed**\n\nI encountered an issue connecting to the AI endpoint. Here is a rule-based query fallback instead:\n\n${await generateFallbackResponse(userMessage)}`;
    }
  }

  // Save chat history
  await saveChatHistory(currentUserId, userMessage, aiResponse);

  return { message: aiResponse, timestamp: new Date() };
}

// ─── Context Builder (RAG Classified Database Queries) ─────────────────────────

async function buildDatabaseContext(query) {
  const q = (query || '').toLowerCase();
  let ctx = '=== CURRENT SYSTEM DATABASE CONTEXT ===\n\n';
  const todayStr = new Date().toISOString().split('T')[0];

  try {
    // 1. Classification & Gathering
    if (q.includes('repair') || q.includes('maintenance') || q.includes('broken') || q.includes('work order')) {
      // Maintenance RAG context
      const openRequests = await MaintenanceRequest.findAll({
        where: { status: { [require('sequelize').Op.ne]: 'COMPLETED' } },
        include: [
          { model: Asset, as: 'asset', attributes: ['name', 'assetTag'] },
          { model: User, as: 'requestedBy', attributes: ['firstName', 'lastName'] }
        ],
        order: [['priority', 'DESC'], ['createdAt', 'DESC']],
        limit: 15
      });
      ctx += `--- OPEN MAINTENANCE REQUESTS (Sorted by priority) ---\n`;
      if (openRequests.length === 0) {
        ctx += 'No open maintenance issues.\n';
      } else {
        openRequests.forEach(r => {
          ctx += `- Req #${r.requestNumber} | Asset: [${r.asset?.assetTag || 'N/A'}] ${r.asset?.name || 'N/A'} | Issue: ${r.issueType} | Title: "${r.title}" | Priority: ${r.priority} | Status: ${r.status} | Cost: Est. $${r.estimatedCost || 0} / Act. $${r.actualCost || 0} | Assigned Tech: ${r.assignedTechnician || 'None'}\n`;
        });
      }
    } 
    
    else if (q.includes('warranty') || q.includes('warranties') || q.includes('expire')) {
      // Warranties RAG context
      const ninetyDays = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const warranties = await WarrantyTracking.findAll({
        where: {
          expiryDate: {
            [require('sequelize').Op.between]: [todayStr, ninetyDays]
          }
        },
        include: [
          { model: Asset, as: 'asset', attributes: ['name', 'assetTag', 'status'] }
        ],
        order: [['expiryDate', 'ASC']],
        limit: 15
      });
      ctx += `--- EXPIRING WARRANTIES (Next 90 Days) ---\n`;
      if (warranties.length === 0) {
        ctx += 'No warranties expiring in the next 90 days.\n';
      } else {
        warranties.forEach(w => {
          ctx += `- Asset: [${w.asset?.assetTag || 'N/A'}] ${w.asset?.name || 'N/A'} | Provider: ${w.providerName} | Expiry: ${w.expiryDate} | Status: ${w.asset?.status || 'N/A'}\n`;
        });
      }
    }

    else if (q.includes('available') || q.includes('free') || q.includes('unassigned') || q.includes('server') || q.includes('laptop') || q.includes('computer')) {
      // Available & Inventory RAG context
      const availableAssets = await Asset.findAll({
        where: { status: 'AVAILABLE', isActive: true },
        include: [
          { model: AssetCategory, as: 'category', attributes: ['name'] },
          { model: Department, as: 'department', attributes: ['name'] }
        ],
        limit: 15
      });
      ctx += `--- AVAILABLE ASSETS (Ready for allocation) ---\n`;
      if (availableAssets.length === 0) {
        ctx += 'No available assets in stock.\n';
      } else {
        availableAssets.forEach(a => {
          ctx += `- Asset: [${a.assetTag}] ${a.name} | Category: ${a.category?.name || 'N/A'} | Brand/Model: ${a.brand || ''} ${a.model || ''} | Current Location: ${a.currentLocation || 'Warehouse'}\n`;
        });
      }
    }

    else if (q.includes('assign') || q.includes('allocat') || q.includes('department') || q.includes('employee')) {
      // Allocations and Department RAG context
      const recentAllocations = await AssetAllocation.findAll({
        where: { status: 'ACTIVE' },
        include: [
          { model: Asset, as: 'asset', attributes: ['name', 'assetTag', 'purchaseCost'] },
          { model: Employee, as: 'employee', attributes: ['firstName', 'lastName'], include: [{ model: Department, as: 'department', attributes: ['name'] }] }
        ],
        order: [['allocatedAt', 'DESC']],
        limit: 15
      });
      ctx += `--- ACTIVE ASSET ALLOCATIONS ---\n`;
      if (recentAllocations.length === 0) {
        ctx += 'No active allocations.\n';
      } else {
        recentAllocations.forEach(a => {
          const empName = a.employee ? `${a.employee.firstName} ${a.employee.lastName}` : 'N/A';
          const deptName = a.employee?.department?.name || 'N/A';
          ctx += `- Asset: [${a.asset?.assetTag || 'N/A'}] ${a.asset?.name || 'N/A'} | Allocated To: ${empName} | Dept: ${deptName} | Allocated On: ${a.allocatedAt}\n`;
        });
      }
    }

    else if (q.includes('critical') || q.includes('health') || q.includes('score') || q.includes('replace') || q.includes('preventive')) {
      // Health and Replace RAG context
      const lowHealth = await AssetHealthScore.findAll({
        where: {
          healthScore: {
            [require('sequelize').Op.lt]: 70
          }
        },
        include: [{ model: Asset, as: 'asset', attributes: ['name', 'assetTag', 'status', 'purchaseCost'] }],
        order: [['healthScore', 'ASC']],
        limit: 15
      });
      ctx += `--- LOW HEALTH & CRITICAL ASSETS (Health Score < 70) ---\n`;
      if (lowHealth.length === 0) {
        ctx += 'All active assets are in excellent health (>70).\n';
      } else {
        lowHealth.forEach(h => {
          ctx += `- Asset: [${h.asset?.assetTag || 'N/A'}] ${h.asset?.name || 'N/A'} | Health Score: ${h.healthScore}/100 | Risk: ${h.riskLevel} | Status: ${h.asset?.status || 'N/A'} | Recommended Action: ${h.recommendations || 'None'}\n`;
        });
      }
    }

    else if (q.includes('depreciat') || q.includes('cost') || q.includes('budget') || q.includes('value') || q.includes('ledger') || q.includes('financial')) {
      // Financial/Depreciation RAG context
      const forecasts = await BudgetForecast.findAll({
        include: [{ model: Department, as: 'department', attributes: ['name'] }],
        limit: 10
      });
      ctx += `--- BUDGET FORECASTS & DEPARTMENTS ---\n`;
      if (forecasts.length === 0) {
        ctx += 'No budget forecasts recorded.\n';
      } else {
        forecasts.forEach(f => {
          ctx += `- Dept: ${f.department?.name || 'N/A'} | Year: ${f.fiscalYear} | Limit: $${f.allocatedAmount} | Spent/Committed: $${f.spentAmount} | Remaining: $${f.allocatedAmount - f.spentAmount}\n`;
        });
      }
    }

    else if (q.includes('activity') || q.includes('logs') || q.includes('today') || q.includes('audit')) {
      // Audit activities context
      const recentLogs = await AuditLog.findAll({
        include: [{ model: User, as: 'performedBy', attributes: ['firstName', 'lastName'] }],
        order: [['createdAt', 'DESC']],
        limit: 10
      });
      ctx += `--- RECENT AUDIT LOGS ---\n`;
      if (recentLogs.length === 0) {
        ctx += 'No audit logs found.\n';
      } else {
        recentLogs.forEach(l => {
          const uName = l.performedBy ? `${l.performedBy.firstName} ${l.performedBy.lastName}` : 'System';
          ctx += `- User: ${uName} | Action: ${l.action} | Target: ${l.entityType} (ID: ${l.entityId}) | IP: ${l.ipAddress} | Date: ${l.createdAt}\n`;
        });
      }
    }

    else {
      // Default fallback general summary context
      const [total, available, assigned, repair] = await Promise.all([
        Asset.count({ where: { isActive: true } }),
        Asset.count({ where: { isActive: true, status: 'AVAILABLE' } }),
        Asset.count({ where: { isActive: true, status: 'ASSIGNED' } }),
        Asset.count({ where: { isActive: true, status: 'UNDER_REPAIR' } }),
      ]);
      ctx += `--- SYSTEM SUMMARY ---\n`;
      ctx += `- Total Active Assets: ${total}\n`;
      ctx += `- Available in Stock: ${available}\n`;
      ctx += `- Assigned to Users: ${assigned}\n`;
      ctx += `- Undergoing Repairs: ${repair}\n`;
    }

    // 2. Add System-wide Smart Replacement Logic Context
    ctx += `\n--- SMART REPLACEMENT RECOMMENDATION ALERTS ---\n`;
    const assets = await Asset.findAll({
      where: { isActive: true },
      include: [
        { model: MaintenanceRequest, as: 'maintenanceRequests', attributes: ['actualCost', 'status'] }
      ]
    });

    let recsFound = 0;
    assets.forEach(a => {
      const repairs = a.maintenanceRequests || [];
      const completedRepairs = repairs.filter(r => r.status === 'COMPLETED');
      const repairCount = completedRepairs.length;
      const totalRepairCost = completedRepairs.reduce((sum, r) => sum + parseFloat(r.actualCost || 0), 0);
      const purchaseCost = parseFloat(a.purchaseCost || 0);
      const costRatio = purchaseCost > 0 ? (totalRepairCost / purchaseCost) : 0;

      // Business logic: Flag replacement if > 3 repairs OR repair cost > 60% of purchase price
      if (repairCount >= 4 || costRatio > 0.6) {
        recsFound++;
        ctx += `- Asset: [${a.assetTag}] ${a.name} | Repairs: ${repairCount} | Total Repair Cost: $${totalRepairCost.toFixed(2)} | Purchase Cost: $${purchaseCost.toFixed(2)} | Ratio: ${(costRatio * 100).toFixed(0)}% | RECOMMENDATION: Replace the asset instead of repairing, as maintenance cost is disproportionately high.\n`;
      }
    });

    if (recsFound === 0) {
      ctx += `- System Health check: No asset repair costs currently exceed safety thresholds.\n`;
    }
  } catch (err) {
    logger.error(`Database context builder error: ${err.message}`);
    ctx += `Error fetching context: ${err.message}\n`;
  }

  ctx += '\n=== END SYSTEM DATABASE CONTEXT ===';
  return ctx;
}

function buildSystemPrompt(context) {
  return `You are an Enterprise Railway Asset Management Assistant (IR-AMP).
Answer only using the provided system database information.
Never invent assets or allocations.
Never hallucinate values.
If data is unavailable, clearly say it is unavailable.
Give concise, professional, structured markdown answers. Use tables and bullet lists when summarizing counts.
When possible, recommend maintenance, replacement or warranty renewal.

${context}`;
}

// ─── Gemini REST API Call ─────────────────────────────────────────────────────────

async function callGeminiApi(prompt, apiKey) {
  try {
    const url = `${config.gemini.baseUrl}/models/${config.gemini.model}:generateContent?key=${apiKey}`;
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
    }, { timeout: 30000 });

    const candidates = response.data?.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0]?.content?.parts;
      if (parts && parts.length > 0) {
        return parts[0].text;
      }
    }
    return 'I encountered an issue processing your request. Please try again.';
  } catch (err) {
    logger.error(`Gemini API call failed: ${err.message}`);
    return `AI service temporarily unavailable. ${await generateFallbackResponse('')}`;
  }
}

// ─── Fallback Rule-Based Responses ───────────────────────────────────────────

async function generateFallbackResponse(query) {
  const q = (query || '').toLowerCase();

  if ((q.includes('available') && (q.includes('laptop') || q.includes('asset'))) || q.includes('how many available')) {
    const count = await Asset.count({ where: { isActive: true, status: 'AVAILABLE' } });
    return `📊 **Available Assets**\n\nThere are currently **${count}** available assets in the system.\n\nTo see the full list, please visit the Assets module and filter by status 'Available'.`;
  }

  if (q.includes('warranty') && (q.includes('expir') || q.includes('month'))) {
    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const count = await WarrantyTracking.count({
      where: {
        expiryDate: {
          [require('sequelize').Op.between]: [
            today.toISOString().split('T')[0],
            thirtyDaysLater.toISOString().split('T')[0],
          ],
        },
      },
    });
    return `⚠️ **Warranty Alerts**\n\nThere are **${count}** assets with warranties expiring in the next 30 days.\n\nVisit the Warranty Management module to see details and take action.`;
  }

  if (q.includes('repair') || q.includes('maintenance') || q.includes('under repair')) {
    const count = await Asset.count({ where: { isActive: true, status: 'UNDER_REPAIR' } });
    return `🔧 **Assets Under Repair**\n\nCurrently **${count}** assets are under repair.\n\nCheck the Maintenance module for detailed repair status and technician assignments.`;
  }

  if (q.includes('assigned') || q.includes('allocation')) {
    const count = await Asset.count({ where: { isActive: true, status: 'ASSIGNED' } });
    return `👤 **Assigned Assets**\n\n**${count}** assets are currently assigned to employees.\n\nVisit the Allocation module for the complete assignment history and details.`;
  }

  if (q.includes('total') || q.includes('summary') || q.includes('overview')) {
    const [total, available, assigned, repair] = await Promise.all([
      Asset.count({ where: { isActive: true } }),
      Asset.count({ where: { isActive: true, status: 'AVAILABLE' } }),
      Asset.count({ where: { isActive: true, status: 'ASSIGNED' } }),
      Asset.count({ where: { isActive: true, status: 'UNDER_REPAIR' } }),
    ]);
    return `📈 **Asset Summary**\n\n| Status | Count |\n|--------|-------|\n| ✅ Total Active | ${total} |\n| 🟢 Available | ${available} |\n| 👤 Assigned | ${assigned} |\n| 🔧 Under Repair | ${repair} |\n\nUse the Dashboard for visual charts and trends.`;
  }

  return `👋 **Hello! I'm your Asset Management AI Assistant.**\n\nI can help you with:\n- 📦 Finding available assets by category or department\n- ⚠️ Checking warranty expiration alerts\n- 🔧 Viewing assets under repair\n- 👤 Asset allocation status\n- 📊 Getting asset summaries\n\nTry asking me:\n- "Show available laptops"\n- "Which warranties expire this month?"\n- "How many assets are under repair?"\n- "Give me an asset summary"\n\n*Note: Connect a Gemini API key in your .env for full AI capabilities.*`;
}

// ─── Chat History ─────────────────────────────────────────────────────────────

async function saveChatHistory(userId, userMessage, aiResponse) {
  try {
    await AiChatHistory.create({ userId, userMessage, aiResponse });
  } catch (err) {
    logger.warn(`Could not save chat history: ${err.message}`);
  }
}

async function getChatHistory(userId, page = 0, size = 20, search = '') {
  const whereClause = { userId };
  
  if (search && search.trim() !== '') {
    whereClause[require('sequelize').Op.or] = [
      { userMessage: { [require('sequelize').Op.like]: `%${search}%` } },
      { aiResponse: { [require('sequelize').Op.like]: `%${search}%` } }
    ];
  }

  const { count, rows } = await AiChatHistory.findAndCountAll({
    where: whereClause,
    order: [['createdAt', 'DESC']],
    limit: size,
    offset: page * size,
  });
  
  return PagedResponse.from(rows.map(h => ({
    id: h.id,
    userMessage: h.userMessage,
    aiResponse: h.aiResponse,
    createdAt: h.createdAt,
    sessionId: h.sessionId || 'active-session'
  })), count, page, size);
}

async function deleteChatHistoryItem(userId, id) {
  return await AiChatHistory.destroy({
    where: { id, userId }
  });
}

async function clearUserChatHistory(userId) {
  return await AiChatHistory.destroy({
    where: { userId }
  });
}

module.exports = { 
  chat, 
  getChatHistory, 
  deleteChatHistoryItem, 
  clearUserChatHistory 
};
