require('dotenv').config();

/**
 * config.js
 * ---------
 * All secrets/config come from environment variables (set these in Render's
 * dashboard under Environment, never commit real values to GitHub).
 *
 * Required env vars on Render:
 *   TELEGRAM_BOT_TOKEN      - from @BotFather
 *   ADMIN_CHAT_ID           - YOUR Telegram numeric chat id (get it from @userinfobot)
 *   FIREBASE_SERVICE_ACCOUNT - the full service account JSON, as a single-line string
 *                              (Firebase Console > Project Settings > Service Accounts
 *                              > Generate new private key, then paste the file's
 *                              contents as one line into this env var)
 *   PORT                    - Render sets this automatically, used for the
 *                              keep-alive web server (see bot.js)
 */
function required(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`[config] Missing required env var: ${name}`);
  }
  return value;
}

module.exports = {
  TELEGRAM_BOT_TOKEN: required('TELEGRAM_BOT_TOKEN'),
  ADMIN_CHAT_ID: required('ADMIN_CHAT_ID'),
  FIREBASE_SERVICE_ACCOUNT: required('FIREBASE_SERVICE_ACCOUNT'),
  PORT: process.env.PORT || 3000,
  PREMIUM_DAYS: 30, // how many days one approved payment grants
};
