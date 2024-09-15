const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  enrollmentYear: { type: Date, required: false },
  major: {type:Date,required:false},
  phone: { type: String, required: false  }, 
});

module.exports = mongoose.model('Student', StudentSchema);
