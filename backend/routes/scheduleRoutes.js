//use express package for api routing and all
const express = require('express');
//fetch function of controller for passing in upload routes
const {processSchedule} = require('../controllers/scheduleController');

const router = express.Router();

router.post('/upload', upload.single('file'), csvMiddleware, processSchedule);

module.exports = route