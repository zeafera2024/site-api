const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

router.post("/schedule-message", messageController.scheduleMessageController);

module.exports = router;
