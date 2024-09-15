const mongoose = require('mongoose');

const InstructorSchema = new mongoose.Schema({
  instructorId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  specialization: { type: String, required: true },
  phone: { type: String, required: true  },
});

module.exports = mongoose.model('Instructor', InstructorSchema);
