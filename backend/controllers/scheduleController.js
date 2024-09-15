//Add class models file for insert document 
const ClassSchedule = require('../models/ClassSchedule');
//Add config lib for fetch env variabkes
const config = require('../config/config');

//Add packages for file manage and path manage
const fs = require('fs');
const path = require('path');

//Add packages for check timezone
const moment = require('moment-timezone');


// Handle CSV actions
const processSchedule = async (req, res) => {

    const csvData = req.csvData;
    //console.log(csvData);
    const responses = [];
  
    for (let row of csvData) {
      const { action, studentId, instructorId, classTypeId, startTime, registrationId } = row;
  
      // Parse startTime to ensure it's a Date object
      // Assuming startTime is in the format '10/10/2024 1:00:00 PM' from CSV
      const parsedStartTime = moment.tz(startTime, 'MM/DD/YYYY h:mm:ss A', 'Asia/Dubai').toDate();
  
      if (isNaN(parsedStartTime.getTime())) {
          responses.push({ status: 'error', message: `Invalid startTime: ${startTime}`, registrationId });
          continue; // Skip to the next row if startTime is invalid
      }
  
      const MAX_CLASSES_STUDENT = parseInt(process.env.MAX_CLASSES_STUDENT_PER_DAY);
      const MAX_CLASSES_INSTRUCTOR = parseInt(process.env.MAX_CLASSES_INSTRUCTOR_PER_DAY);
      const classDuration = parseInt(process.env.CLASS_DURATION_MINUTES);
  
      try {
          if (action === 'new') {
  

            // Save new class
            const newClass = new ClassSchedule({
                  studentId,
                  instructorId,
                  classTypeId,
                  startTime: parsedStartTime,
                  duration: config.classDurationMinutes,
              });
  
              await newClass.save();
              responses.push({ status: 'success', message: 'Class added', registrationId: newClass._id });
          } 
          // Add similar changes for 'update' and 'delete' actions if needed
      } catch (error) {
          responses.push({ status: 'error', message: error.message, registrationId });
      }
  }
  
  
    res.json({ results: responses });
  }

  module.exports = { processSchedule };