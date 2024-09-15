const express = require('express');
const { processSchedule , changeEnvValues} = require('../controllers/scheduleController');
const { upload, csvMiddleware } = require('../middleware/csvMiddleware');

const router = express.Router();

router.post('/upload', upload.single('file'), csvMiddleware, processSchedule);

router.post('/config',  changeEnvValues);

module.exports = router;
