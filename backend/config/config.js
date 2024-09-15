module.exports = {
    maxClassesStudentPerDay: process.env.MAX_CLASSES_STUDENT_PER_DAY || 5,
    maxClassesInstructorPerDay: process.env.MAX_CLASSES_INSTRUCTOR_PER_DAY || 6,
    classDurationMinutes: process.env.CLASS_DURATION_MINUTES || 45,
    maxClassesPerClassType: process.env.MAX_CLASSES_PER_CLASS_TYPE || 3,
};
  