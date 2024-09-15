const mongoose = require('mongoose');

const ClassMasterSchema = new mongoose.Schema({
  classId: { type: String, required: true },
  className: { type: String, required: true },
  description: { type: String, required: false },
});

module.exports = mongoose.model('ClassMaster', ClassMasterSchema);
