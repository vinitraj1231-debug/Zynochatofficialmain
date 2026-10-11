// server/rewardsService.js

const redemptionsHistory = [];

const REWARD_TIERS = [
  { id: 'UPI_10', title: '₹10 Instant UPI Cash', pointsCost: 100, type: 'UPI', value: '10 INR' },
  { id: 'UPI_50', title: '₹50 Fast UPI Cash', pointsCost: 450, type: 'UPI', value: '50 INR' },
  { id: 'REDEEM_CODE_25', title: '₹25 Voucher / Gift Code', pointsCost: 200, type: 'GIFT_CODE', value: '25 INR' },
  { id: 'VIP_EFFECTS', title: '7-Day Glow Chat Ring & Crown', pointsCost: 300, type: 'IN_APP', value: 'Cosmetic VIP' },
];

export function getAvailableRewards() {
  return REWARD_TIERS;
}

export function processUpiRedemption(userId, upiId, rewardId, currentPoints) {
  const reward = REWARD_TIERS.find(r => r.id === rewardId);
  if (!reward) {
    return { success: false, error: 'Invalid reward selection' };
  }

  // UPI VPA format simple regex validation
  const upiRegex = /^[\w.-]+@[\w.-]+$/;
  if (!upiId || !upiRegex.test(upiId.trim())) {
    return { success: false, error: 'Invalid UPI VPA ID. Format should be user@upi (e.g. alex@okaxis)' };
  }

  if (currentPoints < reward.pointsCost) {
    return { success: false, error: `Insufficient points! You need ${reward.pointsCost} points.` };
  }

  // Simulate Instant UPI Gateway Processing
  const transactionRef = 'ZYNO_UPI_' + Math.random().toString(36).substring(2, 9).toUpperCase();
  const redemptionRecord = {
    id: transactionRef,
    userId,
    rewardTitle: reward.title,
    pointsDeducted: reward.pointsCost,
    upiId: upiId.trim(),
    status: 'COMPLETED',
    payoutRef: 'PAY_' + Math.floor(10000000 + Math.random() * 90000000),
    timestamp: new Date().toISOString()
  };

  redemptionsHistory.push(redemptionRecord);

  return {
    success: true,
    message: `₹${reward.value} successfully transferred to ${upiId.trim()}!`,
    transaction: redemptionRecord
  };
}

export function generateDailyRedeemCode(userId) {
  const code = 'ZYNO-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  const rewardPoints = 50;

  return {
    code,
    points: rewardPoints,
    expiresIn: '24 Hours',
    message: 'Daily streak reward code generated successfully!'
  };
}

export function redeemCode(userId, code, currentPoints) {
  if (!code || !code.toUpperCase().startsWith('ZYNO-')) {
    return { success: false, error: 'Invalid or expired redeem code format' };
  }

  const pointsBonus = 75;
  return {
    success: true,
    pointsAwarded: pointsBonus,
    message: `Code redeemed! ${pointsBonus} bonus engagement points added to your balance.`
  };
}
