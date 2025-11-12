import Device from '../models/device.model.js';

// Register or upsert a device's public keys
// Expected body:
// {
//   deviceId: 'device-uuid',
//   identityKey: '<base64>',
//   signedPreKey: '<base64>',
//   signedPreKeyId: 123,
//   oneTimePreKeys: [{ keyId: 1, publicKey: '<base64>' }, ...],
//   platform: 'web'
// }
export const registerDevice = async (req, res) => {
  try {
    const userId = req.user._id; // protectRoute should set req.user
    const { deviceId, identityKey, signedPreKey, signedPreKeyId, oneTimePreKeys, platform } = req.body;
    if (!deviceId || !identityKey || !signedPreKey) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const doc = {
      userId,
      deviceId,
      identityKey,
      signedPreKey,
      signedPreKeyId,
      oneTimePreKeys: oneTimePreKeys || [],
      platform,
      lastSeenAt: new Date(),
    };

    const device = await Device.findOneAndUpdate(
      { userId, deviceId },
      { $set: doc },
      { upsert: true, new: true }
    );

    return res.status(200).json({ device });
  } catch (err) {
    console.error('registerDevice error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get public device keys for a user (used by sender to fetch recipient devices)
export const getDevicesForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: 'userId required' });

    const devices = await Device.find({ userId }).select('-_id deviceId identityKey signedPreKey signedPreKeyId oneTimePreKeys platform lastSeenAt');
    return res.status(200).json({ devices });
  } catch (err) {
    console.error('getDevicesForUser error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Revoke a device (delete its public keys and optionally notify other devices)
export const revokeDevice = async (req, res) => {
  try {
    const userId = req.user._id;
    const { deviceId } = req.params;
    if (!deviceId) return res.status(400).json({ message: 'deviceId required' });

    await Device.findOneAndDelete({ userId, deviceId });
    return res.status(200).json({ message: 'Device revoked' });
  } catch (err) {
    console.error('revokeDevice error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
