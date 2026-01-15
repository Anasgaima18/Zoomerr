const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const meetingController = require('../controllers/meetingController');

// @route   POST api/meetings/start
// @desc    Start instant meeting
// @access  Private
router.post('/start', auth, meetingController.startInstantMeeting);

// @route   GET api/meetings/join/:meetingId
// @desc    Join meeting (get token)
// @access  Private
router.get('/join/:meetingId', auth, meetingController.joinMeeting);

// @route   GET api/meetings/:meetingId
// @desc    Get meeting details
// @access  Private
router.get('/:meetingId', auth, meetingController.getMeeting);

const summaryController = require('../controllers/summaryController');
// @route   POST api/meetings/:meetingId/summary
// @desc    Generate summary
router.post('/:meetingId/summary', auth, summaryController.generateSummary);

// @route   GET api/meetings/:meetingId/summary
// @desc    Get summary
router.get('/:meetingId/summary', auth, summaryController.getSummary);

module.exports = router;
