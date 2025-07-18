const express = require("express");
const { searchController } = require("../controllers/searchController");
const {
  clearSessionController,
  getSessionController,
} = require("../controllers/sessionController");
const { healthController } = require("../controllers/healthController");

const router = express.Router();

router.post("/search", searchController);
router.get("/health", healthController);
router.post("/clear-session", clearSessionController);
router.get("/session/:sessionId", getSessionController);

module.exports = router;
