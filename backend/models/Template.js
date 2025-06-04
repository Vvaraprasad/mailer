const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  subject: String,
  body: String,
});

module.exports = mongoose.model('Template', templateSchema);
