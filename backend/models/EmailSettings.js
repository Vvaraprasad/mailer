import mongoose from 'mongoose';

const platformSettingsSchema = new mongoose.Schema({
  email: { type: String },
  key: { type: String },
});

const emailSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  gmail: platformSettingsSchema,
  outlook: platformSettingsSchema,
  // Add other platforms here if needed
});

export default mongoose.model('EmailSettings', emailSettingsSchema);
