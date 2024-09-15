const ClassSchedule = require('../models/ClassSchedule');
const ClassMaster = require('../models/ClassMaster');
const Student = require('../models/Student');
const Instructor = require('../models/Instructor');
const config = require('../config/config');
const fs = require('fs');
const path = require('path');
//const moment = require('moment');
const moment = require('moment-timezone');



// API to get class schedule report filtered by date and instructor name
const getClassScheduleReport = async (req, res) => {
    try {
      const { date, instructorName } = req.query; // Get query params from the request
      
      console.log(date);

      // Initialize filter object
      const filter = {};
  
      // Filter by date (startTime)
      if (date) {
        const startOfDay = moment.tz(date, 'YYYY-MM-DD', 'Asia/Dubai').startOf('day').toDate();
        const endOfDay = moment.tz(date, 'YYYY-MM-DD', 'Asia/Dubai').endOf('day').toDate();
  
        filter.startTime = {
          $gte: startOfDay,
          $lte: endOfDay
        };
      }
  
      // Filter by instructor name
      if (instructorName) {

        const instructor = await Instructor.findOne({ name: instructorName });
        if (instructor) {
          filter.instructorId = instructor.instructorId; // Filter by instructorId if name matches
        } else {
          return res.status(404).json({ message: 'Instructor not found' });
        }
      }
      
      console.log(filter);

      // Query the ClassSchedule collection based on the filters
      const classSchedules = await ClassSchedule.find(filter).sort({ startTime: 1 }); // Sorting by start time
  
      res.json({ status: 'success', data: classSchedules });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  };
  
  // API to get the per-day class count
const getDailyClassCount = async (req, res) => {
    try {
      const result = await ClassSchedule.aggregate([
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$startTime" } // Group by date (YYYY-MM-DD)
            },
            classCount: { $sum: 1 } // Count the number of classes per day
          }
        },
        {
          $sort: { "_id": 1 } // Sort by date ascending
        }
      ]);
  
      // Format the data to be returned for the frontend graph
      const formattedData = result.map(item => ({
        date: item._id,
        count: item.classCount
      }));
  
      res.json({ status: 'success', data: formattedData });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  };

  module.exports = { getClassScheduleReport, getDailyClassCount };
