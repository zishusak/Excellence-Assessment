const mongoose = require('mongoose');

const ClassScheduleSchema = new mongoose.Aggregate({
    studentId : {type: String, required : true},
    instructorId : {type: String, required : true},
    classTypeId : {type: String, required : true},
    startTime : {type: Date, required : true},
    duration : {type: Number, default : 45},
});

module.exports = mongoose.model('ClassSchedule',ClassScheduleSchema);