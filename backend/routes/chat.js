const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const chatController = require("../controllers/chatController");

router.post('/new', auth, chatController.createConversation);
router.get('/list', auth, chatController.getConversations);
router.get('/messages/:id', auth, chatController.getMessagesByConversationId);
router.post('/message', auth, chatController.chatWithAI);

module.exports = router;