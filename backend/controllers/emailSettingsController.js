import EmailSettings from '../models/EmailSettings.js';

export const getEmailSettings = async (req, res) => {
  try {
    const { userId } = req.params;
    const settings = await EmailSettings.findOne({ userId });
    res.json(settings || {});
  } catch (err) {
    res.status(500).json({ error: 'Failed to get email settings.' });
  }
};

export const updateEmailSettings = async (req, res) => {
  try {
    const { userId } = req.params;
    const { platform, email, key } = req.body;

    if (!['gmail', 'outlook'].includes(platform)) {
      return res.status(400).json({ error: 'Unsupported platform.' });
    }

    let settings = await EmailSettings.findOne({ userId });
    if (!settings) {
      settings = new EmailSettings({ userId });
    }

    settings[platform] = { email, key };
    await settings.save();

    res.json({ message: 'Settings updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings.' });
  }
};
