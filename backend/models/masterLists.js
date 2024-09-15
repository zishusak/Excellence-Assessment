const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true }
});
const instructorSchema = new mongoose.Schema({
  instructorId: { type: String, required: true, unique: true }
});
const classTypeSchema = new mongoose.Schema({
  classTypeId: { type: String, required: true, unique: true }
});

const Student = mongoose.model('Student', studentSchema);
const Instructor = mongoose.model('Instructor', instructorSchema);
const ClassType = mongoose.model('ClassType', classTypeSchema);

module.exports = { Student, Instructor, ClassType };
