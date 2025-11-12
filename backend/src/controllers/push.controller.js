// Push endpoints removed — keep stubs in place in case routes were left wired.
export const subscribe = async (req, res) => {
  res.status(410).json({ message: 'Push subscriptions are no longer supported' });
};

export const unsubscribe = async (req, res) => {
  res.status(410).json({ message: 'Push subscriptions are no longer supported' });
};

export const getVapidKey = async (req, res) => {
  res.status(410).json({ publicKey: null, configured: false, message: 'Push is disabled' });
};
