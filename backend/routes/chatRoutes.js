const express = require("express");
const router = express.Router();

const {
  sendMessage,
  getMessages,
  getChatUsers,
  getChatMetadata,
} = require("../controllers/chatController");

router.post("/send", sendMessage);

router.get("/messages/:user1/:user2", getMessages);

router.get("/users/:userId", getChatUsers);

router.get("/metadata/:userId", getChatMetadata);

module.exports = router;
