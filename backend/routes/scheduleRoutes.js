const express = require('express');
const { processSchedule , changeEnvValues} = require('../controllers/scheduleController');
const { upload, csvMiddleware } = require('../middleware/csvMiddleware');
const { getClassScheduleReport, getDailyClassCount } = require('../controllers/schedulereportController');

const router = express.Router();

router.post('/upload', upload.single('file'), csvMiddleware, processSchedule);

router.post('/config',  changeEnvValues);

// Route to get class schedule report
router.get('/class-schedule/report', getClassScheduleReport);

// Route to get daily class count for graph
router.get('/class-schedule/daily-count', getDailyClassCount);

module.exports = router;
