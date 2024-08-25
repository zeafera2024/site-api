const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

router.post("/schedule-message", messageController.scheduleMessage);

module.exports = router;
