const mongoose = require('mongoose');

const ClassScheduleSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  instructorId: { type: String, required: true },
  classTypeId: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: {type:Date,required:true},
  duration: { type: Number, default: 45 }, // Duration in minutes
});

module.exports = mongoose.model('ClassSchedule', ClassScheduleSchema);
