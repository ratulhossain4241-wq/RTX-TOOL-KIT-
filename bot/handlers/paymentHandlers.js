const { db, admin } = require('../firebaseAdmin');
const config = require('../config');

/**
 * paymentHandlers.js
 * -------------------
 * Two jobs:
 *  1. watchPendingRequests(bot) - listens LIVE to Firestore for new
 *     "pending" payment requests, and pushes a Telegram message to the
 *     admin with Approve/Reject inline buttons for each one.
 *  2. handleCallbackQuery(bot) - runs when the admin taps a button:
 *     approves -> sets requester's plan to 'premium' with a 30-day expiry,
 *     rejects  -> just marks the request 'rejected', user stays free.
 */

function watchPendingRequests(bot) {
  db.collection('paymentRequests')
    .where('status', '==', 'pending')
    .onSnapshot(
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const request = change.doc.data();
            const requestId = change.doc.id;
            sendApprovalMessage(bot, requestId, request);
          }
        });
      },
      (error) => {
        console.error('[paymentHandlers] Firestore listener error:', error.message);
      }
    );
}

async function sendApprovalMessage(bot, requestId, request) {
  const text =
    `🔔 *নতুন Payment Request*\n\n` +
    `👤 Email: ${escapeMd(request.userEmail || 'unknown')}\n` +
    `💳 Method: ${escapeMd((request.method || '').toUpperCase())}\n` +
    `📱 Sender Number: ${escapeMd(request.senderNumber || '-')}\n` +
    `🔖 Transaction ID: \`${escapeMd(request.transactionId || '-')}\`\n` +
    `💰 Amount: ৳${request.amount || 1000}\n\n` +
    `Request ID: \`${requestId}\``;

  await bot.sendMessage(config.ADMIN_CHAT_ID, text, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '✅ Approve', callback_data: `approve:${requestId}` },
          { text: '❌ Reject', callback_data: `reject:${requestId}` },
        ],
      ],
    },
  });
}

function handleCallbackQuery(bot) {
  bot.on('callback_query', async (query) => {
    const [action, requestId] = (query.data || '').split(':');
    if (!requestId || !['approve', 'reject'].includes(action)) return;

    try {
      if (action === 'approve') {
        await approveRequest(requestId);
        await bot.answerCallbackQuery(query.id, { text: 'Approved ✅' });
      } else {
        await rejectRequest(requestId);
        await bot.answerCallbackQuery(query.id, { text: 'Rejected ❌' });
      }

      // Edit the original message so the admin sees the outcome and can't
      // double-click approve/reject on the same request again.
      const resultLabel = action === 'approve' ? '✅ APPROVED' : '❌ REJECTED';
      await bot.editMessageText(`${query.message.text}\n\n${resultLabel}`, {
        chat_id: query.message.chat.id,
        message_id: query.message.message_id,
      });
    } catch (err) {
      console.error('[paymentHandlers] callback error:', err.message);
      await bot.answerCallbackQuery(query.id, { text: 'Error: ' + err.message, show_alert: true });
    }
  });
}

async function approveRequest(requestId) {
  const requestRef = db.collection('paymentRequests').doc(requestId);
  const requestSnap = await requestRef.get();
  if (!requestSnap.exists) throw new Error('Request not found');

  const request = requestSnap.data();
  if (request.status !== 'pending') throw new Error('Already processed');

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + config.PREMIUM_DAYS);

  const batch = db.batch();
  batch.update(requestRef, {
    status: 'approved',
    approvedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  batch.set(
    db.collection('users').doc(request.userId),
    {
      plan: 'premium',
      expiryDate: admin.firestore.Timestamp.fromDate(expiryDate),
    },
    { merge: true }
  );
  await batch.commit();
}

async function rejectRequest(requestId) {
  const requestRef = db.collection('paymentRequests').doc(requestId);
  const requestSnap = await requestRef.get();
  if (!requestSnap.exists) throw new Error('Request not found');
  if (requestSnap.data().status !== 'pending') throw new Error('Already processed');

  await requestRef.update({
    status: 'rejected',
    rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

// Telegram MarkdownV1 breaks on unescaped _ * ` [ - keep messages readable
function escapeMd(str) {
  return String(str).replace(/([_*`\[])/g, '\\$1');
}

module.exports = { watchPendingRequests, handleCallbackQuery };
