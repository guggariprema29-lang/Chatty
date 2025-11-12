import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deviceId: { type: String, required: true }, // client-generated unique id per device
  identityKey: { type: String, required: true }, // base64 or hex public identity key
  signedPreKey: { type: String, required: true }, // base64 public signed prekey
  signedPreKeyId: { type: Number }, // optional id if provided
  oneTimePreKeys: [{ keyId: Number, publicKey: String }], // optional array
  platform: { type: String }, // e.g., 'web', 'ios', 'android'
  lastSeenAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

deviceSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

const Device = mongoose.model('Device', deviceSchema);
export default Device;
