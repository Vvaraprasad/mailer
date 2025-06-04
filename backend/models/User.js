const mongoose = require('mongoose');

const smtpSchema = new mongoose.Schema(
  {
    host: { type: String },
    port: { type: Number },
    secure: { type: Boolean },
    auth: {
      user: { type: String },
      pass: { type: String },
    },
  },
  { _id: false }
);

const platformSchema = new mongoose.Schema(
  {
    smtp: smtpSchema,
    parseKeys: [{ type: String }],
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    otp: { type: String },

    platforms: {
      gmail: platformSchema,
      outlook: platformSchema,
    },
  },
  {
    timestamps: true, // optional but useful
  }
);

module.exports = mongoose.model('User', userSchema);
