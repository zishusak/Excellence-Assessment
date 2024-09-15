const ClassSchedule = require('../models/ClassSchedule');
const config = require('../config/config');
const fs = require('fs');
const path = require('path');
//const moment = require('moment');
const moment = require('moment-timezone');

// Function to calculate the end time of a class
function calculateEndTime(startTime, duration) {
    // Convert startTime to a moment object in the 'Asia/Dubai' timezone
    const parsedStartTime = moment.tz(startTime, 'MM/DD/YYYY h:mm:ss A', 'Asia/Dubai');
    
    // Calculate end time by adding duration in minutes
    const endTime = parsedStartTime.add(duration, 'minutes');
    
    // Convert endTime to UTC before returning
    return endTime.utc().toDate();
}

//Add function for check class exist/student exist/instructor exist at same timeslot
async function checkClassExists(studentId, instructorId, startTime, duration) {
    // Convert startTime to a moment object in the 'Asia/Dubai' timezone
    const parsedStartTime = moment.tz(startTime, 'MM/DD/YYYY h:mm:ss A', 'Asia/Dubai').utc().toDate();
    const parsedEndTime = calculateEndTime(startTime, duration);
  
    // Ensure parsedStartTime is valid
    if (isNaN(parsedStartTime.getTime())) {
      throw new Error('Invalid start time provided.');
    }
  
    //console.log(`Checking for class existence: ${parsedStartTime} to ${parsedEndTime}`);
  
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
  
    //console.log(`Class existence check result: ${classExists}`);
    return !!classExists;
  }

// Function to check if a student or instructor has exceeded their daily limit
async function checkDailyClassLimit(studentId, instructorId, startTime) {
    const startOfDay = moment.tz(startTime, 'Asia/Dubai').startOf('day').utc().toDate();
    const endOfDay = moment.tz(startTime, 'Asia/Dubai').endOf('day').utc().toDate();
  
    const studentClassCount = await ClassSchedule.countDocuments({
      studentId,
      startTime: { $gte: startOfDay, $lte: endOfDay }
    });
  
    const instructorClassCount = await ClassSchedule.countDocuments({
      instructorId,
      startTime: { $gte: startOfDay, $lte: endOfDay }
    });
  
    const MAX_CLASSES_STUDENT = parseInt(process.env.MAX_CLASSES_STUDENT_PER_DAY);
    const MAX_CLASSES_INSTRUCTOR = parseInt(process.env.MAX_CLASSES_INSTRUCTOR_PER_DAY);
  
    const exceedsStudentLimit = studentClassCount >= MAX_CLASSES_STUDENT;
    const exceedsInstructorLimit = instructorClassCount >= MAX_CLASSES_INSTRUCTOR;
  
    return { exceedsStudentLimit, exceedsInstructorLimit };
  }

// Handle CSV actions
const processSchedule = async (req, res) => {
  const csvData = req.csvData;
  //console.log(csvData);
  const responses = [];

  for (let row of csvData) {
    const { action, studentId, instructorId, classTypeId, startTime, registrationId } = row;

    // Parse startTime to ensure it's a Date object
    const parsedStartTime = moment.tz(startTime, 'MM/DD/YYYY h:mm:ss A', 'Asia/Dubai').utc().toDate();
    //console.log(`Parsed start time: ${parsedStartTime}`);

    if (isNaN(parsedStartTime.getTime())) {
      responses.push({ status: 'error', message: `Invalid startTime: ${startTime}`, registrationId });
      continue; // Skip to the next row if startTime is invalid
    }

    const MAX_CLASSES_STUDENT = parseInt(process.env.MAX_CLASSES_STUDENT_PER_DAY);
    const MAX_CLASSES_INSTRUCTOR = parseInt(process.env.MAX_CLASSES_INSTRUCTOR_PER_DAY);
    const classDuration = parseInt(process.env.CLASS_DURATION_MINUTES);

    try {
        if (action === 'new') {
        
         // Check daily limits for both student and instructor
        const { exceedsStudentLimit, exceedsInstructorLimit } = await checkDailyClassLimit(studentId, instructorId, parsedStartTime);

        if (exceedsStudentLimit) {
            responses.push({ status: 'error', message: `Student has exceeded daily limit of classes.`, registrationId });
            continue;
        }

        if (exceedsInstructorLimit) {
            responses.push({ status: 'error', message: `Instructor has exceeded daily limit of classes.`, registrationId });
            continue;
        }

        const classExists = await checkClassExists(studentId, instructorId, parsedStartTime, classDuration);
       
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
                endTime: calculateEndTime(startTime, classDuration),
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
