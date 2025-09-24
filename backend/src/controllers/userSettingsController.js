import { saveAllUserSettings, getUserGeneralSettings, getUserNotificationSettings } from '../models/userSettingsModel.js';
import { getUserProfileById, updateUserProfile, changeUserPassword } from '../models/userModel.js';
import { authMiddleware } from '../utils/jwt.js';

export async function postAllUserSettings(req, res, next) {
  try {
    // If authenticated, prefer token user id; else allow explicit body userId for public/mobile usage
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const { general, notifications } = req.body || {};
    await saveAllUserSettings(userId, { general, notifications });
    res.status(200).json({ success: true, message: 'Settings saved' });
  } catch (err) {
    next(err);
  }
}

// Mirror admin API semantics for individual tabs using users table
export async function putUserProfile(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });
    const { fullName, email } = req.body || {};
    // Prevent email modification; only allow fullName
    await updateUserProfile(userId, { fullName, email: undefined });
    res.status(200).json({ success: true, message: 'Profile updated' });
  } catch (err) { next(err); }
}

export async function putUserPassword(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });
    const { oldPassword, newPassword } = req.body || {};
    const result = await changeUserPassword(userId, { oldPassword, newPassword });
    if (!result.ok) {
      const msg = result.reason === 'invalid_old' ? 'Old password incorrect' : 'User not found';
      return res.status(400).json({ success: false, message: msg });
    }
    res.status(200).json({ success: true, message: 'Password changed' });
  } catch (err) { next(err); }
}

export async function getAllUserSettings(req, res, next) {
  try {
    const userId = (req.user?.id) || Number(req.query?.userId) || Number(req.params?.userId);
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });

    const [profile, general, notifications] = await Promise.all([
      getUserProfileById(userId),
      getUserGeneralSettings(userId),
      getUserNotificationSettings(userId)
    ]);

    res.status(200).json({ success: true, message: 'OK', data: { profile, general, notifications } });
  } catch (err) {
    next(err);
  }
}


