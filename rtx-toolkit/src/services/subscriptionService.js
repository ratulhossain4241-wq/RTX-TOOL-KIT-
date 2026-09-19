import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase.config';

/**
 * subscriptionService
 * --------------------
 * Writes a "payment request" document. It does NOT touch the user's plan -
 * only the Telegram admin bot (running separately, added in a later batch)
 * has permission to flip a user to premium, after the admin manually
 * approves the request. This keeps billing decisions in one trusted place.
 *
 * Firestore collection: paymentRequests
 * { userId, userEmail, method, senderNumber, transactionId, amount,
 *   status: 'pending' | 'approved' | 'rejected', createdAt }
 */
export async function submitPaymentRequest({ userId, userEmail, method, senderNumber, transactionId }) {
  if (!senderNumber?.trim() || !transactionId?.trim()) {
    throw new Error('আপনার নাম্বার এবং ট্রানজেকশন আইডি দুটোই দিন।');
  }

  try {
    const docRef = await addDoc(collection(db, 'paymentRequests'), {
      userId,
      userEmail,
      method, // 'bkash' | 'nagad'
      senderNumber: senderNumber.trim(),
      transactionId: transactionId.trim(),
      amount: 1000,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    throw new Error('রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে, আবার চেষ্টা করুন।');
  }
}
