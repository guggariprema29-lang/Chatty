// Push feature has been removed. This module kept as a harmless stub to avoid
// accidental runtime imports during the rollback process.

export const getVapidPublicKey = () => null;

export const saveSubscriptionForUser = async () => null;
export const removeSubscriptionForUser = async () => null;

export const sendPushToUser = async () => {
  // no-op: push removed
  return;
};

export const sendPushToUsers = async () => {
  // no-op
  return;
};
