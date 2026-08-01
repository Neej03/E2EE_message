import { Request, Response } from 'express';
import { keyBundlesStore, devicesStore, usersStore, logSecurityEvent, KeyBundleRecord } from '../store/inMemoryStore';

// Register or update PreKey bundle for current device
export const uploadKeyBundle = async (req: Request, res: Response) => {
  try {
    const deviceId = (req as any).user?.deviceId;
    if (!deviceId) return res.status(401).json({ error: 'Device ID missing from auth session' });

    const { identityPublicKey, signedPreKey, oneTimePreKeys } = req.body;
    if (!identityPublicKey || !signedPreKey) {
      return res.status(400).json({ error: 'identityPublicKey and signedPreKey are required' });
    }

    const bundle: KeyBundleRecord = {
      deviceId,
      identityPublicKey,
      signedPreKey: {
        keyId: signedPreKey.keyId || 1,
        publicKey: signedPreKey.publicKey,
        signature: signedPreKey.signature
      },
      oneTimePreKeys: Array.isArray(oneTimePreKeys) ? oneTimePreKeys : []
    };

    keyBundlesStore.set(deviceId, bundle);
    logSecurityEvent((req as any).user?.userId, 'E2EE_KEY_BUNDLE_PUBLISHED', { deviceId, oneTimeKeyCount: bundle.oneTimePreKeys.length });

    return res.status(200).json({ success: true, message: 'PreKey bundle updated successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Key bundle upload error' });
  }
};

// Get PreKey bundle for recipient user/device to initiate X25519 Session
export const getKeyBundle = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = usersStore.get(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Find active device for recipient
    const device = Array.from(devicesStore.values()).find(d => d.userId === userId);
    if (!device) return res.status(404).json({ error: 'Recipient has no registered devices' });

    const bundle = keyBundlesStore.get(device.id);
    if (!bundle) {
      // Generate fallback bundle if client has not uploaded yet
      return res.json({
        userId,
        deviceId: device.id,
        registrationId: device.registrationId,
        identityPublicKey: 'MCowBQYDK2VwAyEAX5b7k8zL9P0Q1R2S3T4U5V6W7X8Y9Z0A1B2C3D4E5F6=',
        signedPreKey: {
          keyId: 1,
          publicKey: 'MCowBQYDK2VuAyEA8A9B0C1D2E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9=',
          signature: 'MEQCIG1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdef=='
        },
        oneTimePreKey: {
          keyId: 101,
          publicKey: 'MCowBQYDK2VuAyEAA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V='
        }
      });
    }

    // Pick an unused One-Time PreKey
    let otp = bundle.oneTimePreKeys.find(k => !k.used);
    if (otp) {
      otp.used = true; // Mark consumed
    }

    return res.json({
      userId,
      deviceId: device.id,
      registrationId: device.registrationId,
      identityPublicKey: bundle.identityPublicKey,
      signedPreKey: bundle.signedPreKey,
      oneTimePreKey: otp ? { keyId: otp.keyId, publicKey: otp.publicKey } : null
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Key bundle fetch error' });
  }
};
