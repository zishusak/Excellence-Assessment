const ClassSchedule = require('../models/ClassSchedule');
const config = require('../config/config');
const fs = require('fs');
const path = require('path');
//const moment = require('moment');
const moment = require('moment-timezone');

// Function to add 4 hours to a given start time
function addFourHours(startTime) {
    const parsedTime = moment.tz(startTime, 'MM/DD/YYYY h:mm:ss A', 'Asia/Dubai');
    return parsedTime.add(4, 'hours').toDate(); // Returns a JavaScript Date object
}

// Function to calculate the end time of a class
function calculateEndTime(startTime, duration) {
    // Assuming startTime is from CSV in a custom format
    const parsedStartTime = moment.tz(startTime, 'MM/DD/YYYY h:mm:ss A', 'Asia/Dubai').utc().toDate(); 
    return new Date(parsedStartTime.getTime() + duration * 60000); // duration is in minutes
}

async function checkClassExists(studentId, instructorId, startTime, duration) {
    const parsedStartTime = moment.tz(startTime, 'MM/DD/YYYY h:mm:ss A', 'Asia/Dubai').utc().toDate();
    const parsedEndTime = calculateEndTime(startTime, duration);
  
    // Ensure parsedStartTime is valid
    if (isNaN(parsedStartTime.getTime())) {
      throw new Error('Invalid start time provided.');
    }
  
    console.log(`Checking for class existence: ${parsedStartTime} to ${parsedEndTime}`);
  
    // Query to check if a class exists for either the instructor or student at the same time
    const classExists = await ClassSchedule.findOne({
      $or: [
        { instructorId },
        { studentId }
      ],
      startTime: { 
        $lt: parsedEndTime 
      },
      endTime: { 
        $gt: parsedStartTime 
      }
    });
  
    console.log(`Class existence check result: ${classExists}`);
    return !!classExists;
  }


// Handle CSV actions
const processSchedule = async (req, res) => {
  const csvData = req.csvData;
  //console.log(csvData);
  const responses = [];

  for (let row of csvData) {
    const { action, studentId, instructorId, classTypeId, startTime, registrationId } = row;

    // Parse startTime to ensure it's a Date object
    // Assuming startTime is in the format '10/10/2024 1:00:00 PM' from CSV
    const parsedStartTime = moment.tz(startTime, 'MM/DD/YYYY h:mm:ss A', 'Asia/Dubai').utc().toDate();
    console.log(parsedStartTime);
    
    if (isNaN(parsedStartTime.getTime())) {
        responses.push({ status: 'error', message: `Invalid startTime: ${startTime}`, registrationId });
        continue; // Skip to the next row if startTime is invalid
    }

    const MAX_CLASSES_STUDENT = parseInt(process.env.MAX_CLASSES_STUDENT_PER_DAY);
    const MAX_CLASSES_INSTRUCTOR = parseInt(process.env.MAX_CLASSES_INSTRUCTOR_PER_DAY);
    const classDuration = parseInt(process.env.CLASS_DURATION_MINUTES);

    try {
        if (action === 'new') {

            const classExists = await checkClassExists(studentId, instructorId, startTime, classDuration);

            if (classExists) {
              responses.push({ status: 'error', message: 'Class already exists for either the instructor or the student at the same time.', registrationId });
              continue; // Skip adding the class
            }
          
          
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
};

const changeEnvValues = async (req, res) =>{
     
  const { MAX_CLASSES_STUDENT_PER_DAY, MAX_CLASSES_INSTRUCTOR_PER_DAY, CLASS_DURATION_MINUTES,MAX_CLASSES_PER_CLASS_TYPE } = req.body;
  
  //console.log(data);

  // Path to the .env file
  const envFilePath = path.resolve(__dirname, '.env');

  const newUrlString = envFilePath.replace("\controllers", "");

  const updatedEnvData = `
  PORT=5000
  MONGODB_URI=mongodb://localhost:27017/schedule_db
  MAX_CLASSES_STUDENT_PER_DAY=${MAX_CLASSES_STUDENT_PER_DAY}
  MAX_CLASSES_INSTRUCTOR_PER_DAY=${MAX_CLASSES_INSTRUCTOR_PER_DAY}
  CLASS_DURATION_MINUTES=${CLASS_DURATION_MINUTES}
  MAX_CLASSES_PER_CLASS_TYPE=${MAX_CLASSES_PER_CLASS_TYPE}
  `;
  
  fs.writeFile(newUrlString, updatedEnvData.trim(), (err) => {
    if (err) {
        return res.status(500).send('Error updating .env file.');
    }

    // Send response
    res.send({status:200,message:'Environment variables updated! Please restart the server to apply the changes.'});
  });

  console.log(envFilePath);

}

module.exports = { processSchedule , changeEnvValues };
