// Push feature removed — this module kept as a stub to avoid import failures.
export const urlBase64ToUint8Array = () => {
  throw new Error('Push feature has been removed from this build');
};

export const registerServiceWorker = async () => {
  console.warn('registerServiceWorker called but push feature is removed');
  return null;
};

export const subscribeToPush = async () => {
  const err = new Error('Push feature has been removed');
  err.configured = false;
  throw err;
};

export const unsubscribeFromPush = async () => {
  console.warn('unsubscribeFromPush called but push feature is removed');
  return;
};
