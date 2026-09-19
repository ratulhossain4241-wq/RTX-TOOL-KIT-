const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const config = require('./config');
const { watchPendingRequests, handleCallbackQuery } = require('./handlers/paymentHandlers');

/**
 * bot.js
 * ------
 * Entry point for the Telegram admin bot, deployed on Render as a Web
 * Service. Render web services need an open HTTP port, so a tiny express
 * server runs alongside the bot purely as a health check / keep-alive
 * endpoint - it does not serve any app content.
 *
 * Run locally with: node bot.js  (after creating a .env file, see config.js)
 */

const bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, { polling: true });

console.log('[bot] RTX TOOL KIT admin bot starting...');

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    '👋 RTX TOOL KIT Admin Bot চালু আছে।\nনতুন payment request এলে এখানে notification আসবে, Approve/Reject বাটনে ট্যাপ করুন।'
  );
});

bot.on('polling_error', (err) => {
  console.error('[bot] polling error:', err.message);
});

// Start listening for pending payment requests + button taps
watchPendingRequests(bot);
handleCallbackQuery(bot);

// --- keep-alive web server (required by Render Web Service) ---
const app = express();
app.get('/', (req, res) => res.send('RTX TOOL KIT admin bot is running.'));
app.listen(config.PORT, () => {
  console.log(`[bot] health check server listening on port ${config.PORT}`);
});
